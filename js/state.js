/**
 * GlobeTrotter State Management Module (v2 Update)
 * Supports Token Validation, Multi-Stop Itineraries, Calendar Views, Public Sharing, and Settings.
 */

class GlobeTrotterStateClass {
  constructor() {
    this.api = window.GlobeTrotterAPI;

    // Core application state
    this.state = {
      currentView: 'explore', // 'explore' | 'planner' | 'saved' | 'community' | 'friends' | 'comparison' | 'profile' | 'public'
      plannerViewMode: 'list', // 'list' | 'calendar'
      timelineStatus: 'all',
      selectedCityId: 1,
      activeModalCityId: null,
      
      // Auth & Profile (starts strictly null until verified via API)
      currentUser: null,
      isAuthModalOpen: false,
      authModalMode: 'login', // 'login' | 'signup' | 'forgot'
      
      // Public Shared Trip
      publicTrip: null,
      publicTripSlug: null,

      // User Preferences
      preferences: {
        language: 'en',
        currency: 'INR'
      },

      // Filters
      filters: {
        region: 'all',
        vibe: 'all',
        budgetTier: 'all',
        searchQuery: '',
        maxHotelBudget: 60000
      },

      // Currency
      currency: 'INR',

      // Active Trip Plan (Customizer & Builder)
      tripPlan: {
        id: null,
        title: "Mumbai Explorer Getaway",
        description: "3-day cultural and coastal tour",
        cityId: 1,
        hotelId: 1001,
        activityIds: [101, 102, 103, 108],
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        nights: 3,
        adults: 2,
        children: 0,
        is_public: false,
        visibility: 'private',
        includeTaxes: true,
        dailyFoodBudgetPerPerson: 1000,
        dailyLocalTransport: 600,
        activePreset: 'cultural',
        activeStopIndex: 0,
        daySchedule: {
          1: { morning: 101, afternoon: 103, evening: 102 },
          2: { morning: 108, afternoon: null, evening: null },
          3: { morning: null, afternoon: null, evening: null }
        },
        stops: [
          {
            clientId: 'stop-1',
            cityId: 1,
            hotelId: 1001,
            activityIds: [101, 102, 103, 108],
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
            nights: 3,
            daySchedule: {
              1: { morning: 101, afternoon: 103, evening: 102 },
              2: { morning: 108, afternoon: null, evening: null },
              3: { morning: null, afternoon: null, evening: null }
            }
          }
        ],
        legs: []
      },

      // Comparison list (numeric IDs)
      comparisonCityIds: [1, 3],

      // Saved trips from API
      savedTrips: [],
      backendBudget: null,
      tripCalendar: null,
      calendarLoading: false,
      calendarError: null,
      communityTrips: [],
      friends: [],
      friendRequests: [],
      friendSearchResults: [],
      friendTrips: [],
      selectedFriend: null,
      friendsLoading: false,
      communityLoading: false
    };

    this.subscribers = [];
  }

  /**
   * Validates stored token on startup via GET /api/me.
   * If invalid/401, clears token and remains logged out.
   */
  async initUser() {
    await this.api.checkBackendHealth();
    if (this.api.token) {
      const user = await this.api.getMe();
      if (user) {
        this.state.currentUser = user;
        this.notify('AUTH_STATE_CHANGED', user);
        await this.loadSavedTrips();
      } else {
        this.state.currentUser = null;
        this.state.savedTrips = [];
        this.notify('AUTH_STATE_CHANGED', null);
      }
    } else {
      this.state.currentUser = null;
      this.state.savedTrips = [];
      this.notify('AUTH_STATE_CHANGED', null);
    }
  }

  // Subscribe to state updates
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Notify listeners
  notify(actionType, payload) {
    this.subscribers.forEach(cb => cb(this.state, actionType, payload));
  }

  // Getters
  getState() {
    return this.state;
  }

  getCurrentCity() {
    const stop = this.getActiveStop();
    return CITIES_DATA.find(c => c.id === stop.cityId) || CITIES_DATA[0];
  }

  getModalCity() {
    return CITIES_DATA.find(c => c.id === this.state.activeModalCityId);
  }

  isAuthenticated() {
    return this.api.isAuthenticated();
  }

  // ==================== AUTH ACTIONS ====================

  openAuthModal(mode = 'login') {
    this.state.authModalMode = mode;
    this.state.isAuthModalOpen = true;
    this.notify('AUTH_MODAL_CHANGED', { isOpen: true, mode });
  }

  closeAuthModal() {
    this.state.isAuthModalOpen = false;
    this.notify('AUTH_MODAL_CHANGED', { isOpen: false, mode: this.state.authModalMode });
  }

  async login(email, password) {
    const res = await this.api.login(email, password);
    this.state.currentUser = res.user;
    this.closeAuthModal();
    this.notify('AUTH_STATE_CHANGED', res.user);
    await this.loadSavedTrips();
    return res;
  }

  async signup(name, email, password) {
    const res = await this.api.signup(name, email, password);
    this.state.currentUser = res.user;
    this.closeAuthModal();
    this.notify('AUTH_STATE_CHANGED', res.user);
    await this.loadSavedTrips();
    return res;
  }

  logout() {
    this.api.logout();
    this.state.currentUser = null;
    this.state.savedTrips = [];
    this.notify('AUTH_STATE_CHANGED', null);
  }

  // ==================== NAVIGATION & VIEWS ====================

  setView(viewName, params = {}) {
    this.state.currentView = viewName;
    if (viewName === 'public' && params.slug) {
      this.loadPublicTrip(params.slug);
    } else if (viewName === 'community') {
      this.loadCommunityTrips();
    } else if (viewName === 'friends') {
      this.loadFriendsHub();
    }
    this.notify('VIEW_CHANGED', { view: viewName, params });
  }

  setTimelineStatus(status = 'all') {
    this.state.timelineStatus = status;
    this.loadSavedTrips(status === 'all' ? '' : status);
    this.notify('TIMELINE_STATUS_CHANGED', status);
  }

  setPlannerViewMode(mode) {
    this.state.plannerViewMode = mode;
    if (mode === 'calendar' && this.state.tripPlan.id) {
      this.loadTripCalendar(this.state.tripPlan.id);
    }
    this.notify('PLANNER_VIEW_MODE_CHANGED', mode);
  }

  // ==================== DESTINATION & TRIP BUILDER ====================

  createStop(cityId, startDate = null, endDate = null, applyPreset = true) {
    const numCityId = parseInt(cityId);
    const city = CITIES_DATA.find(c => c.id === numCityId) || CITIES_DATA[0];
    const cityHotels = HOTELS_DATA.filter(h => h.city_id === city.id);
    const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === city.id);
    const start = startDate || this.state.tripPlan.start_date || new Date().toISOString().split('T')[0];
    const end = endDate || new Date(new Date(start).getTime() + Math.max(1, this.state.tripPlan.nights || 3) * 86400000).toISOString().split('T')[0];
    const nights = Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) || this.state.tripPlan.nights || 3);
    const preset = PRESET_TIERS[this.state.tripPlan.activePreset || 'cultural'];
    const selectedHotel = applyPreset && preset ? preset.hotelSelector(cityHotels) : cityHotels[0];
    const selectedActs = applyPreset && preset ? preset.activitySelector(cityActs) : cityActs.slice(0, 2);
    const activityIds = selectedActs.map(a => a.id);

    return {
      clientId: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      cityId: city.id,
      hotelId: selectedHotel?.id || null,
      activityIds,
      start_date: start,
      end_date: end,
      nights,
      daySchedule: this.buildSchedule(activityIds, nights)
    };
  }

  ensureStops() {
    if (!Array.isArray(this.state.tripPlan.stops) || this.state.tripPlan.stops.length === 0) {
      this.state.tripPlan.stops = [this.createStop(this.state.tripPlan.cityId || 1, this.state.tripPlan.start_date, this.state.tripPlan.end_date, false)];
    }
    this.state.tripPlan.activeStopIndex = Math.min(
      Math.max(parseInt(this.state.tripPlan.activeStopIndex) || 0, 0),
      this.state.tripPlan.stops.length - 1
    );
    this.syncTripPlanFromActiveStop();
  }

  getActiveStop() {
    this.ensureStopsShallow();
    return this.state.tripPlan.stops[this.state.tripPlan.activeStopIndex || 0];
  }

  ensureStopsShallow() {
    if (!Array.isArray(this.state.tripPlan.stops) || this.state.tripPlan.stops.length === 0) {
      this.state.tripPlan.stops = [{
        clientId: 'stop-1',
        cityId: this.state.tripPlan.cityId || 1,
        hotelId: this.state.tripPlan.hotelId || 1001,
        activityIds: [...(this.state.tripPlan.activityIds || [])],
        start_date: this.state.tripPlan.start_date,
        end_date: this.state.tripPlan.end_date,
        nights: this.state.tripPlan.nights || 3,
        daySchedule: this.state.tripPlan.daySchedule || {}
      }];
      this.state.tripPlan.activeStopIndex = 0;
    }
  }

  syncTripPlanFromActiveStop() {
    const stop = this.state.tripPlan.stops[this.state.tripPlan.activeStopIndex || 0];
    if (!stop) return;
    this.state.tripPlan.cityId = stop.cityId;
    this.state.tripPlan.hotelId = stop.hotelId;
    this.state.tripPlan.activityIds = stop.activityIds;
    this.state.tripPlan.daySchedule = stop.daySchedule;
    this.state.tripPlan.nights = stop.nights;
    this.state.tripPlan.start_date = stop.start_date;
    this.state.tripPlan.end_date = stop.end_date;
    this.state.selectedCityId = stop.cityId;
  }

  syncActiveStopFromTripPlan() {
    const stop = this.getActiveStop();
    stop.cityId = this.state.tripPlan.cityId;
    stop.hotelId = this.state.tripPlan.hotelId;
    stop.activityIds = this.state.tripPlan.activityIds;
    stop.daySchedule = this.state.tripPlan.daySchedule;
    stop.nights = this.state.tripPlan.nights;
    stop.start_date = this.state.tripPlan.start_date;
    stop.end_date = this.state.tripPlan.end_date;
  }

  buildSchedule(activityIds, nights) {
    const schedule = {};
    const activities = [...activityIds];
    let actIndex = 0;
    for (let day = 1; day <= nights; day++) {
      schedule[day] = {
        morning: activities[actIndex++] || null,
        afternoon: activities[actIndex++] || null,
        evening: activities[actIndex++] || null
      };
    }
    return schedule;
  }

  setActiveStop(index) {
    this.ensureStops();
    const nextIndex = Math.min(Math.max(parseInt(index) || 0, 0), this.state.tripPlan.stops.length - 1);
    this.state.tripPlan.activeStopIndex = nextIndex;
    this.syncTripPlanFromActiveStop();
    this.notify('ACTIVE_STOP_CHANGED', nextIndex);
  }

  addTripStop(cityId = null) {
    this.ensureStops();
    const lastStop = this.state.tripPlan.stops[this.state.tripPlan.stops.length - 1];
    const nextCity = cityId || CITIES_DATA.find(c => !this.state.tripPlan.stops.some(s => s.cityId === c.id))?.id || 1;
    const start = lastStop?.end_date || this.state.tripPlan.end_date;
    const end = new Date(new Date(start).getTime() + Math.max(1, this.state.tripPlan.nights || 2) * 86400000).toISOString().split('T')[0];
    this.state.tripPlan.stops.push(this.createStop(nextCity, start, end, true));
    this.state.tripPlan.activeStopIndex = this.state.tripPlan.stops.length - 1;
    this.syncTripPlanFromActiveStop();
    this.updateTripDateBounds();
    this.notify('STOPS_CHANGED', this.state.tripPlan.stops);
  }

  removeTripStop(index) {
    this.ensureStops();
    if (this.state.tripPlan.stops.length <= 1) return;
    this.state.tripPlan.stops.splice(parseInt(index), 1);
    this.state.tripPlan.activeStopIndex = Math.min(this.state.tripPlan.activeStopIndex, this.state.tripPlan.stops.length - 1);
    this.syncTripPlanFromActiveStop();
    this.updateTripDateBounds();
    this.notify('STOPS_CHANGED', this.state.tripPlan.stops);
  }

  moveTripStop(index, direction) {
    this.ensureStops();
    const from = parseInt(index);
    const to = from + parseInt(direction);
    if (to < 0 || to >= this.state.tripPlan.stops.length) return;
    const [stop] = this.state.tripPlan.stops.splice(from, 1);
    this.state.tripPlan.stops.splice(to, 0, stop);
    this.state.tripPlan.activeStopIndex = to;
    this.syncTripPlanFromActiveStop();
    this.notify('STOPS_CHANGED', this.state.tripPlan.stops);
  }

  updateTripDateBounds() {
    const stops = this.state.tripPlan.stops || [];
    const starts = stops.map(s => s.start_date).filter(Boolean).sort();
    const ends = stops.map(s => s.end_date).filter(Boolean).sort();
    if (starts.length) this.state.tripPlan.trip_start_date = starts[0];
    if (ends.length) this.state.tripPlan.trip_end_date = ends[ends.length - 1];
  }

  rebuildTravelLegs() {
    const stops = this.state.tripPlan.stops || [];
    const existing = this.state.tripPlan.legs || [];
    const travelerCount = (parseInt(this.state.tripPlan.adults) || 1) + (parseInt(this.state.tripPlan.children) || 0);
    this.state.tripPlan.legs = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const previous = existing[i] || {};
      this.state.tripPlan.legs.push({
        from_city_id: stops[i].cityId,
        to_city_id: stops[i + 1].cityId,
        mode: previous.mode || 'train',
        cost: parseInt(previous.cost) || 0,
        depart_date: previous.depart_date || stops[i].end_date || stops[i + 1].start_date || null,
        duration_hours: parseInt(previous.duration_hours) || 4,
        passengers: parseInt(previous.passengers) || travelerCount
      });
    }
  }

  updateTravelLeg(index, field, value) {
    this.rebuildTravelLegs();
    const leg = this.state.tripPlan.legs[parseInt(index)];
    if (!leg) return;
    leg[field] = ['cost', 'duration_hours', 'passengers'].includes(field) ? Math.max(0, parseInt(value) || 0) : value;
    this.notify('LEGS_CHANGED', this.state.tripPlan.legs);
  }

  setCity(cityId, applyPreset = true) {
    const numCityId = parseInt(cityId);
    const city = CITIES_DATA.find(c => c.id === numCityId);
    if (!city) return;

    this.state.tripPlan.cityId = numCityId;
    this.state.tripPlan.title = `${city.name} Explorer Itinerary`;
    this.state.selectedCityId = numCityId;
    const activeStop = this.getActiveStop();
    activeStop.cityId = numCityId;

    const cityHotels = HOTELS_DATA.filter(h => h.city_id === numCityId);
    const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === numCityId);

    if (applyPreset) {
      this.applyPreset('cultural', numCityId);
    } else {
      this.state.tripPlan.hotelId = cityHotels[0]?.id || null;
      this.state.tripPlan.activityIds = cityActs.slice(0, 2).map(a => a.id);
      this.regenerateSchedule();
    }

    this.syncActiveStopFromTripPlan();
    this.updateTripDateBounds();
    this.notify('CITY_CHANGED', numCityId);
  }

  setModalCity(cityId) {
    this.state.activeModalCityId = cityId ? parseInt(cityId) : null;
    this.notify('MODAL_CITY_CHANGED', this.state.activeModalCityId);
  }

  setHotel(hotelId) {
    this.state.tripPlan.hotelId = parseInt(hotelId);
    this.state.tripPlan.activePreset = null;
    this.syncActiveStopFromTripPlan();
    this.notify('HOTEL_CHANGED', this.state.tripPlan.hotelId);
  }

  toggleActivity(activityId) {
    const numActId = parseInt(activityId);
    const ids = this.state.tripPlan.activityIds;
    const index = ids.indexOf(numActId);
    if (index > -1) {
      ids.splice(index, 1);
      this.removeActivityFromSchedule(numActId);
    } else {
      ids.push(numActId);
      this.autoSlotActivity(numActId);
    }
    this.state.tripPlan.activePreset = null;
    this.syncActiveStopFromTripPlan();
    this.notify('ACTIVITIES_CHANGED', ids);
  }

  setTripDuration(nights) {
    const val = Math.max(1, Math.min(14, parseInt(nights) || 1));
    this.state.tripPlan.nights = val;
    const start = new Date(this.state.tripPlan.start_date || Date.now());
    this.state.tripPlan.end_date = new Date(start.getTime() + val * 86400000).toISOString().split('T')[0];
    this.adjustScheduleForDuration(val);
    this.syncActiveStopFromTripPlan();
    this.updateTripDateBounds();
    this.notify('DURATION_CHANGED', val);
  }

  setTripDates(start_date, end_date) {
    this.state.tripPlan.start_date = start_date;
    this.state.tripPlan.end_date = end_date;
    if (start_date && end_date) {
      const diff = Math.max(1, Math.round((new Date(end_date) - new Date(start_date)) / 86400000));
      this.state.tripPlan.nights = diff;
      this.adjustScheduleForDuration(diff);
    }
    this.syncActiveStopFromTripPlan();
    this.updateTripDateBounds();
    this.notify('DATES_CHANGED', { start_date, end_date });
  }

  setTravelers(adults, children = 0) {
    this.state.tripPlan.adults = Math.max(1, parseInt(adults) || 1);
    this.state.tripPlan.children = Math.max(0, parseInt(children) || 0);
    this.notify('TRAVELERS_CHANGED', { adults: this.state.tripPlan.adults, children: this.state.tripPlan.children });
  }

  setCurrency(currCode) {
    if (CURRENCIES[currCode]) {
      this.state.currency = currCode;
      this.state.preferences.currency = currCode;
      this.notify('CURRENCY_CHANGED', currCode);
    }
  }

  setIncludeTaxes(enabled) {
    this.state.tripPlan.includeTaxes = !!enabled;
    this.notify('TAXES_TOGGLED', enabled);
  }

  setPlanVisibility(visibility) {
    this.state.tripPlan.visibility = ['private', 'friends', 'public'].includes(visibility) ? visibility : 'private';
    this.state.tripPlan.is_public = this.state.tripPlan.visibility === 'public';
    this.notify('VISIBILITY_CHANGED', this.state.tripPlan.visibility);
  }

  setDailyAllowances(foodPerPerson, localTransport) {
    this.state.tripPlan.dailyFoodBudgetPerPerson = Math.max(0, parseInt(foodPerPerson) || 0);
    this.state.tripPlan.dailyLocalTransport = Math.max(0, parseInt(localTransport) || 0);
    this.notify('ALLOWANCES_CHANGED', { food: this.state.tripPlan.dailyFoodBudgetPerPerson, transport: this.state.tripPlan.dailyLocalTransport });
  }

  setFilter(filterName, value) {
    this.state.filters[filterName] = value;
    this.notify('FILTERS_CHANGED', this.state.filters);
  }

  resetFilters() {
    this.state.filters = {
      region: 'all',
      vibe: 'all',
      budgetTier: 'all',
      searchQuery: '',
      maxHotelBudget: 60000
    };
    this.notify('FILTERS_CHANGED', this.state.filters);
  }

  applyPreset(presetKey, targetCityId = null) {
    const cityId = targetCityId ? parseInt(targetCityId) : this.state.tripPlan.cityId;
    const city = CITIES_DATA.find(c => c.id === cityId);
    const preset = PRESET_TIERS[presetKey];
    if (!city || !preset) return;

    const cityHotels = HOTELS_DATA.filter(h => h.city_id === cityId);
    const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === cityId);

    const selectedHotel = preset.hotelSelector(cityHotels);
    const selectedActs = preset.activitySelector(cityActs);

    this.state.tripPlan.cityId = cityId;
    this.state.tripPlan.hotelId = selectedHotel.id;
    this.state.tripPlan.activityIds = selectedActs.map(a => a.id);
    this.state.tripPlan.activePreset = presetKey;
    this.state.tripPlan.title = `${city.name} (${preset.name})`;

    this.regenerateSchedule();
    this.syncActiveStopFromTripPlan();
    this.updateTripDateBounds();
    this.notify('PRESET_APPLIED', { presetKey, cityId });
  }

  // Schedule management
  regenerateSchedule() {
    this.state.tripPlan.daySchedule = this.buildSchedule(this.state.tripPlan.activityIds, this.state.tripPlan.nights);
    this.syncActiveStopFromTripPlan();
  }

  adjustScheduleForDuration(nights) {
    const currentSchedule = this.state.tripPlan.daySchedule || {};
    const newSchedule = {};

    for (let day = 1; day <= nights; day++) {
      newSchedule[day] = currentSchedule[day] || { morning: null, afternoon: null, evening: null };
    }
    this.state.tripPlan.daySchedule = newSchedule;
    this.syncActiveStopFromTripPlan();
  }

  autoSlotActivity(activityId) {
    const schedule = this.state.tripPlan.daySchedule;
    for (const day in schedule) {
      for (const slot of ['morning', 'afternoon', 'evening']) {
        if (!schedule[day][slot]) {
          schedule[day][slot] = activityId;
          this.syncActiveStopFromTripPlan();
          return;
        }
      }
    }
  }

  removeActivityFromSchedule(activityId) {
    const schedule = this.state.tripPlan.daySchedule;
    for (const day in schedule) {
      for (const slot of ['morning', 'afternoon', 'evening']) {
        if (schedule[day][slot] === activityId) {
          schedule[day][slot] = null;
        }
      }
    }
    this.syncActiveStopFromTripPlan();
  }

  setScheduleSlot(day, slot, activityId) {
    if (!this.state.tripPlan.daySchedule[day]) {
      this.state.tripPlan.daySchedule[day] = { morning: null, afternoon: null, evening: null };
    }
    this.state.tripPlan.daySchedule[day][slot] = activityId ? parseInt(activityId) : null;
    this.syncActiveStopFromTripPlan();
    this.notify('SCHEDULE_UPDATED', this.state.tripPlan.daySchedule);
  }

  getScheduledInfoForPlanStop(planStop, activityId) {
    const schedule = planStop.daySchedule || {};
    for (const [dayKey, slots] of Object.entries(schedule)) {
      for (const slot of ['morning', 'afternoon', 'evening']) {
        if (parseInt(slots?.[slot]) === parseInt(activityId)) {
          const base = planStop.start_date ? new Date(planStop.start_date) : null;
          const dayOffset = Math.max(0, (parseInt(dayKey) || 1) - 1);
          const scheduledDate = base
            ? new Date(base.getTime() + dayOffset * 86400000).toISOString().split('T')[0]
            : null;
          return { scheduled_date: scheduledDate, slot };
        }
      }
    }
    return { scheduled_date: planStop.start_date || null, slot: null };
  }

  // ==================== TRIPS API SYNC ====================

  async loadSavedTrips(status = '') {
    if (!this.isAuthenticated()) {
      this.state.savedTrips = [];
      this.notify('SAVED_TRIPS_LOADED', []);
      return;
    }

    try {
      this.state.savedTrips = await this.api.getTrips(status);
      this.notify('SAVED_TRIPS_LOADED', this.state.savedTrips);
    } catch (e) {
      console.warn('Failed to load trips from API:', e);
    }
  }

  async saveCurrentTrip(customName = null) {
    this.ensureStops();
    this.updateTripDateBounds();
    const stops = this.state.tripPlan.stops;
    const firstCity = CITIES_DATA.find(c => c.id === stops[0]?.cityId) || this.getCurrentCity();
    const destinationNames = stops
      .map(stop => CITIES_DATA.find(c => c.id === stop.cityId)?.name)
      .filter(Boolean);
    const startDate = this.state.tripPlan.trip_start_date || stops[0]?.start_date || new Date().toISOString().split('T')[0];
    const endDate = this.state.tripPlan.trip_end_date || stops[stops.length - 1]?.end_date || startDate;
    const numPeople = this.state.tripPlan.adults + this.state.tripPlan.children;

    const tripPayload = {
      name: customName || this.state.tripPlan.title || `${firstCity.name} Tour`,
      description: this.state.tripPlan.description || `${destinationNames.join(' → ')} multi-city itinerary`,
      start_date: startDate,
      end_date: endDate,
      num_people: numPeople,
      is_public: this.state.tripPlan.visibility === 'public',
      visibility: this.state.tripPlan.visibility || 'private',
      daily_meal_estimate: (this.state.tripPlan.dailyFoodBudgetPerPerson || 0) * numPeople
    };

    const createdTrip = await this.api.createTrip(tripPayload);
    const savedStops = [];

    for (const [index, planStop] of stops.entries()) {
      const savedStop = await this.api.addStop(createdTrip.id, {
        city_id: planStop.cityId,
        start_date: planStop.start_date || startDate,
        end_date: planStop.end_date || planStop.start_date || endDate,
        hotel_id: planStop.hotelId
      });

      if (savedStop && savedStop.id && savedStop.order_index !== index) {
        await this.api.updateStop(savedStop.id, { order_index: index });
      }
      savedStops[index] = savedStop;

      if (planStop.hotelId) {
        await this.api.addStopHotel(savedStop.id, {
          hotel_id: planStop.hotelId,
          nights: planStop.nights || null
        });
      }

      for (const actId of planStop.activityIds || []) {
        const scheduled = this.getScheduledInfoForPlanStop(planStop, actId);
        await this.api.addStopActivity(savedStop.id, {
          activity_id: actId,
          num_people: numPeople,
          scheduled_date: scheduled.scheduled_date,
          slot: scheduled.slot
        });
      }
    }

    this.rebuildTravelLegs();
    for (const leg of this.state.tripPlan.legs || []) {
      await this.api.addTripLeg(createdTrip.id, leg);
    }

    this.state.tripPlan.id = createdTrip.id;
    const fullTrip = await this.api.getTrip(createdTrip.id).catch(() => createdTrip);
    await this.loadSavedTrips();
    this.notify('TRIP_SAVED', createdTrip);
    return fullTrip;
  }

  async loadSavedTrip(tripId) {
    try {
      const trip = await this.api.getTrip(tripId);
      if (!trip) return false;

      const sortedStops = (trip.stops || []).slice().sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      const fallbackStop = sortedStops[0] || null;
      const cityId = fallbackStop && fallbackStop.city ? fallbackStop.city.id : 1;
      const loadedStops = sortedStops.length ? sortedStops.map((stop, index) => {
        const stopCityId = stop.city?.id || cityId;
        const stopStart = stop.start_date || trip.start_date || new Date().toISOString().split('T')[0];
        const stopEnd = stop.end_date || trip.end_date || stopStart;
        const stopNights = Math.max(1, Math.round((new Date(stopEnd) - new Date(stopStart)) / 86400000) || 1);
        const actIds = stop.activities ? stop.activities.map(a => a.activity_id) : [];
        return {
          id: stop.id,
          clientId: `api-stop-${stop.id || index}`,
          cityId: stopCityId,
          hotelId: stop.hotels?.[0]?.hotel_id || stop.hotel?.id || HOTELS_DATA.find(h => h.city_id === stopCityId)?.id || null,
          activityIds: actIds,
          start_date: stopStart,
          end_date: stopEnd,
          nights: stopNights,
          daySchedule: this.buildSchedule(actIds, stopNights)
        };
      }) : [this.createStop(cityId, trip.start_date, trip.end_date, false)];

      this.state.tripPlan = {
        id: trip.id,
        title: trip.name,
        description: trip.description,
        cityId: loadedStops[0].cityId,
        hotelId: loadedStops[0].hotelId,
        activityIds: loadedStops[0].activityIds,
        start_date: trip.start_date || new Date().toISOString().split('T')[0],
        end_date: trip.end_date || new Date(Date.now() + 3*86400000).toISOString().split('T')[0],
        nights: trip.start_date && trip.end_date ? Math.max(1, Math.round((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000)) : 3,
        adults: 2,
        children: 0,
        is_public: trip.is_public,
        visibility: trip.visibility || (trip.is_public ? 'public' : 'private'),
        share_slug: trip.share_slug,
        includeTaxes: true,
        dailyFoodBudgetPerPerson: trip.daily_meal_estimate && trip.num_people ? Math.round(trip.daily_meal_estimate / trip.num_people) : 1000,
        dailyLocalTransport: 600,
        activePreset: null,
        activeStopIndex: 0,
        daySchedule: {},
        stops: loadedStops,
        legs: (trip.legs || []).map(leg => ({
          id: leg.id,
          from_city_id: leg.from_city?.id,
          to_city_id: leg.to_city?.id,
          mode: leg.mode || 'train',
          cost: leg.cost || 0,
          depart_date: leg.depart_date || null,
          duration_hours: leg.duration_hours || 0
        }))
      };

      this.syncTripPlanFromActiveStop();
      this.updateTripDateBounds();

      try {
        this.state.backendBudget = await this.api.getTripBudget(trip.id);
      } catch (be) {
        console.warn('Backend budget fetch fallback');
      }

      await this.loadTripCalendar(trip.id).catch(() => null);

      this.notify('TRIP_LOADED', trip);
      return true;
    } catch (e) {
      console.warn('Error loading trip:', e);
      return false;
    }
  }

  async toggleTripPublic(tripId, isPublic) {
    const updated = await this.api.updateTrip(tripId, { is_public: isPublic });
    await this.loadSavedTrips(this.state.timelineStatus === 'all' ? '' : this.state.timelineStatus);
    this.notify('TRIP_UPDATED', updated);
    return updated;
  }

  async updateTripVisibility(tripId, visibility) {
    const updated = await this.api.updateTrip(tripId, {
      visibility,
      is_public: visibility === 'public'
    });
    await this.loadSavedTrips(this.state.timelineStatus === 'all' ? '' : this.state.timelineStatus);
    this.notify('TRIP_UPDATED', updated);
    return updated;
  }

  async deleteSavedTrip(tripId) {
    await this.api.deleteTrip(tripId);
    await this.loadSavedTrips(this.state.timelineStatus === 'all' ? '' : this.state.timelineStatus);
    this.notify('TRIP_DELETED', tripId);
  }

  async loadPublicTrip(slug) {
    try {
      this.state.publicTripSlug = slug;
      this.state.publicTrip = await this.api.getPublicTrip(slug);
      this.notify('PUBLIC_TRIP_LOADED', this.state.publicTrip);
    } catch (e) {
      this.state.publicTrip = null;
      this.notify('PUBLIC_TRIP_ERROR', e.message);
    }
  }

  async loadTripCalendar(tripId = null) {
    const id = tripId || this.state.tripPlan.id;
    if (!id) {
      this.state.tripCalendar = null;
      this.state.calendarError = null;
      this.notify('TRIP_CALENDAR_LOADED', null);
      return null;
    }

    this.state.calendarLoading = true;
    this.state.calendarError = null;
    this.notify('TRIP_CALENDAR_LOADING', true);
    try {
      this.state.tripCalendar = await this.api.getTripCalendar(id);
      this.notify('TRIP_CALENDAR_LOADED', this.state.tripCalendar);
      return this.state.tripCalendar;
    } catch (e) {
      this.state.calendarError = e.message;
      this.notify('TRIP_CALENDAR_ERROR', e.message);
      throw e;
    } finally {
      this.state.calendarLoading = false;
      this.notify('TRIP_CALENDAR_LOADING', false);
    }
  }

  findStopForDate(date, cityName = '') {
    const stops = this.state.tripPlan.stops || [];
    return stops.find(stop =>
      stop.start_date && stop.end_date && stop.start_date <= date && stop.end_date >= date
    ) || stops.find(stop => {
      const city = CITIES_DATA.find(c => c.id === stop.cityId);
      return cityName && city?.name === cityName;
    }) || stops[0] || null;
  }

  async addActivityToCalendar(date, slot, activityId) {
    const stop = this.findStopForDate(date);
    if (!stop?.id) throw new Error('Save or load this trip before adding calendar activities');
    const numPeople = (this.state.tripPlan.adults || 1) + (this.state.tripPlan.children || 0);
    const created = await this.api.addStopActivity(stop.id, {
      activity_id: parseInt(activityId),
      num_people: numPeople,
      scheduled_date: date,
      slot
    });
    await this.loadTripCalendar(this.state.tripPlan.id);
    this.notify('TRIP_ACTIVITY_SCHEDULED', created);
    return created;
  }

  async rescheduleActivity(stopActivityId, scheduledDate, slot) {
    const updated = await this.api.updateStopActivity(stopActivityId, {
      scheduled_date: scheduledDate,
      slot
    });
    await this.loadTripCalendar(this.state.tripPlan.id);
    this.notify('TRIP_ACTIVITY_RESCHEDULED', updated);
    return updated;
  }

  async loadCommunityTrips() {
    this.state.communityLoading = true;
    this.notify('COMMUNITY_TRIPS_LOADING', true);
    try {
      this.state.communityTrips = await this.api.getCommunityTrips();
      this.notify('COMMUNITY_TRIPS_LOADED', this.state.communityTrips);
    } catch (e) {
      this.notify('COMMUNITY_TRIPS_ERROR', e.message);
    } finally {
      this.state.communityLoading = false;
      this.notify('COMMUNITY_TRIPS_LOADING', false);
    }
  }

  async cloneVisibleTrip(tripId) {
    const result = await this.api.cloneTrip(tripId);
    await this.loadSavedTrips();
    this.notify('TRIP_CLONED', result);
    return result;
  }

  async loadFriendsHub() {
    if (!this.isAuthenticated()) {
      this.state.friends = [];
      this.state.friendRequests = [];
      this.state.friendTrips = [];
      this.state.selectedFriend = null;
      this.notify('FRIENDS_LOADED', null);
      return;
    }

    this.state.friendsLoading = true;
    this.notify('FRIENDS_LOADING', true);
    try {
      const [friends, requests] = await Promise.all([
        this.api.getFriends(),
        this.api.getFriendRequests()
      ]);
      this.state.friends = friends;
      this.state.friendRequests = requests;
      this.notify('FRIENDS_LOADED', { friends, requests });
    } catch (e) {
      this.notify('FRIENDS_ERROR', e.message);
    } finally {
      this.state.friendsLoading = false;
      this.notify('FRIENDS_LOADING', false);
    }
  }

  async searchFriends(q) {
    if (!q || !q.trim()) {
      this.state.friendSearchResults = [];
      this.notify('FRIEND_SEARCH_UPDATED', []);
      return [];
    }
    const results = await this.api.searchUsers(q.trim());
    this.state.friendSearchResults = results;
    this.notify('FRIEND_SEARCH_UPDATED', results);
    return results;
  }

  async sendFriendRequest(userId) {
    const result = await this.api.sendFriendRequest(userId);
    await this.loadFriendsHub();
    this.notify('FRIEND_REQUEST_SENT', result);
    return result;
  }

  async acceptFriendRequest(friendshipId) {
    const result = await this.api.acceptFriendRequest(friendshipId);
    await this.loadFriendsHub();
    this.notify('FRIEND_REQUEST_ACCEPTED', result);
    return result;
  }

  async deleteFriendship(friendshipId) {
    await this.api.deleteFriendship(friendshipId);
    await this.loadFriendsHub();
    this.notify('FRIENDSHIP_DELETED', friendshipId);
  }

  async loadFriendTrips(userId) {
    const friend = this.state.friends.find(f => String(f.user?.id) === String(userId))?.user || null;
    this.state.selectedFriend = friend;
    this.state.friendTrips = await this.api.getUserTrips(userId);
    this.notify('FRIEND_TRIPS_LOADED', { friend, trips: this.state.friendTrips });
    return this.state.friendTrips;
  }

  toggleComparisonCity(cityId) {
    const numId = parseInt(cityId);
    const index = this.state.comparisonCityIds.indexOf(numId);
    if (index > -1) {
        // Always allow removal; if it would leave zero cities, just remove (UI can handle empty state)
        this.state.comparisonCityIds.splice(index, 1);
    } else {
        // Add new city; if we already have two cities, replace the first one (or you could shift)
        if (this.state.comparisonCityIds.length >= 2) {
            // Replace the first city with the new one
            this.state.comparisonCityIds[0] = numId;
        } else {
            this.state.comparisonCityIds.push(numId);
        }
    }
    this.notify('COMPARISON_UPDATED', this.state.comparisonCityIds);
  }
}

// Global state instance
window.GlobeTrotterState = new GlobeTrotterStateClass();
