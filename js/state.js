/**
 * GlobeTrotter State Management Module (v2 Update)
 * Supports User Authentication, Multi-Stop Itineraries, Calendar Views, Public Sharing, and Settings.
 */

class GlobeTrotterState {
  constructor() {
    this.api = window.GlobeTrotterAPI;

    // Core application state
    this.state = {
      currentView: 'explore', // 'explore' | 'planner' | 'saved' | 'comparison' | 'profile' | 'public'
      plannerViewMode: 'list', // 'list' | 'calendar'
      selectedCityId: 1,
      activeModalCityId: null,
      
      // Auth & Profile
      currentUser: this.api.currentUser,
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
        includeTaxes: true,
        dailyFoodBudgetPerPerson: 1000,
        dailyLocalTransport: 600,
        activePreset: 'cultural',
        daySchedule: {
          1: { morning: 101, afternoon: 103, evening: 102 },
          2: { morning: 108, afternoon: null, evening: null },
          3: { morning: null, afternoon: null, evening: null }
        },
        // Multi-stop support
        stops: []
      },

      // Comparison list (numeric IDs)
      comparisonCityIds: [1, 3],

      // Saved trips from API
      savedTrips: [],
      backendBudget: null
    };

    this.subscribers = [];
    this.initUser();
  }

  async initUser() {
    if (this.api.token) {
      const user = await this.api.getMe();
      this.state.currentUser = user;
      this.notify('AUTH_STATE_CHANGED', user);
    }
    this.loadSavedTrips();
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
    return CITIES_DATA.find(c => c.id === this.state.tripPlan.cityId) || CITIES_DATA[0];
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
    }
    this.notify('VIEW_CHANGED', { view: viewName, params });
  }

  setPlannerViewMode(mode) {
    this.state.plannerViewMode = mode;
    this.notify('PLANNER_VIEW_MODE_CHANGED', mode);
  }

  // ==================== DESTINATION & TRIP BUILDER ====================

  setCity(cityId, applyPreset = true) {
    const numCityId = parseInt(cityId);
    const city = CITIES_DATA.find(c => c.id === numCityId);
    if (!city) return;

    this.state.tripPlan.cityId = numCityId;
    this.state.tripPlan.title = `${city.name} Explorer Itinerary`;
    this.state.selectedCityId = numCityId;

    const cityHotels = HOTELS_DATA.filter(h => h.city_id === numCityId);
    const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === numCityId);

    if (applyPreset) {
      this.applyPreset('cultural', numCityId);
    } else {
      this.state.tripPlan.hotelId = cityHotels[0]?.id || null;
      this.state.tripPlan.activityIds = cityActs.slice(0, 2).map(a => a.id);
      this.regenerateSchedule();
    }

    this.notify('CITY_CHANGED', numCityId);
  }

  setModalCity(cityId) {
    this.state.activeModalCityId = cityId ? parseInt(cityId) : null;
    this.notify('MODAL_CITY_CHANGED', this.state.activeModalCityId);
  }

  setHotel(hotelId) {
    this.state.tripPlan.hotelId = parseInt(hotelId);
    this.state.tripPlan.activePreset = null;
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
    this.notify('ACTIVITIES_CHANGED', ids);
  }

  setTripDuration(nights) {
    const val = Math.max(1, Math.min(14, parseInt(nights) || 1));
    this.state.tripPlan.nights = val;
    const start = new Date(this.state.tripPlan.start_date || Date.now());
    this.state.tripPlan.end_date = new Date(start.getTime() + val * 86400000).toISOString().split('T')[0];
    this.adjustScheduleForDuration(val);
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
    this.notify('PRESET_APPLIED', { presetKey, cityId });
  }

  // Schedule management
  regenerateSchedule() {
    const nights = this.state.tripPlan.nights;
    const schedule = {};
    const activities = [...this.state.tripPlan.activityIds];
    let actIndex = 0;

    for (let day = 1; day <= nights; day++) {
      schedule[day] = {
        morning: activities[actIndex++] || null,
        afternoon: activities[actIndex++] || null,
        evening: activities[actIndex++] || null
      };
    }
    this.state.tripPlan.daySchedule = schedule;
  }

  adjustScheduleForDuration(nights) {
    const currentSchedule = this.state.tripPlan.daySchedule || {};
    const newSchedule = {};

    for (let day = 1; day <= nights; day++) {
      newSchedule[day] = currentSchedule[day] || { morning: null, afternoon: null, evening: null };
    }
    this.state.tripPlan.daySchedule = newSchedule;
  }

  autoSlotActivity(activityId) {
    const schedule = this.state.tripPlan.daySchedule;
    for (const day in schedule) {
      for (const slot of ['morning', 'afternoon', 'evening']) {
        if (!schedule[day][slot]) {
          schedule[day][slot] = activityId;
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
  }

  setScheduleSlot(day, slot, activityId) {
    if (!this.state.tripPlan.daySchedule[day]) {
      this.state.tripPlan.daySchedule[day] = { morning: null, afternoon: null, evening: null };
    }
    this.state.tripPlan.daySchedule[day][slot] = activityId ? parseInt(activityId) : null;
    this.notify('SCHEDULE_UPDATED', this.state.tripPlan.daySchedule);
  }

  // ==================== TRIPS API SYNC ====================

  async loadSavedTrips() {
    try {
      this.state.savedTrips = await this.api.getTrips();
      this.notify('SAVED_TRIPS_LOADED', this.state.savedTrips);
    } catch (e) {
      console.warn('Failed to load trips from API:', e);
    }
  }

  async saveCurrentTrip(customName = null) {
    const currentCity = this.getCurrentCity();
    const currentHotel = HOTELS_DATA.find(h => h.id === this.state.tripPlan.hotelId);
    const startDate = this.state.tripPlan.start_date || new Date().toISOString().split('T')[0];
    const endDate = this.state.tripPlan.end_date || new Date(Date.now() + this.state.tripPlan.nights * 86400000).toISOString().split('T')[0];
    const numPeople = this.state.tripPlan.adults + this.state.tripPlan.children;

    const tripPayload = {
      name: customName || this.state.tripPlan.title || `${currentCity.name} Tour`,
      description: this.state.tripPlan.description || `${this.state.tripPlan.nights} nights in ${currentCity.name}`,
      start_date: startDate,
      end_date: endDate,
      num_people: numPeople,
      is_public: this.state.tripPlan.is_public || false
    };

    // 1. Create Trip
    const createdTrip = await this.api.createTrip(tripPayload);

    // 2. Add Primary Stop
    const stop = await this.api.addStop(createdTrip.id, {
      city_id: currentCity.id,
      start_date: startDate,
      end_date: endDate
    });

    // 3. Add Activities
    for (const actId of this.state.tripPlan.activityIds) {
      await this.api.addStopActivity(stop.id, {
        activity_id: actId,
        num_people: numPeople
      });
    }

    this.state.tripPlan.id = createdTrip.id;
    await this.loadSavedTrips();
    this.notify('TRIP_SAVED', createdTrip);
    return createdTrip;
  }

  async loadSavedTrip(tripId) {
    try {
      const trip = await this.api.getTrip(tripId);
      if (!trip) return false;

      const stop = trip.stops && trip.stops[0] ? trip.stops[0] : null;
      const cityId = stop && stop.city ? stop.city.id : 1;
      const hotelId = HOTELS_DATA.find(h => h.city_id === cityId)?.id || 1001;
      const actIds = stop && stop.activities ? stop.activities.map(a => a.activity_id) : [];

      this.state.tripPlan = {
        id: trip.id,
        title: trip.name,
        description: trip.description,
        cityId: cityId,
        hotelId: hotelId,
        activityIds: actIds.length ? actIds : [101, 102],
        start_date: trip.start_date || new Date().toISOString().split('T')[0],
        end_date: trip.end_date || new Date(Date.now() + 3*86400000).toISOString().split('T')[0],
        nights: trip.start_date && trip.end_date ? Math.max(1, Math.round((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000)) : 3,
        adults: 2,
        children: 0,
        is_public: trip.is_public,
        share_slug: trip.share_slug,
        includeTaxes: true,
        dailyFoodBudgetPerPerson: 1000,
        dailyLocalTransport: 600,
        daySchedule: {},
        stops: trip.stops || []
      };

      this.state.selectedCityId = cityId;
      this.regenerateSchedule();

      // Fetch backend budget
      try {
        this.state.backendBudget = await this.api.getTripBudget(trip.id);
      } catch (be) {
        console.warn('Backend budget fetch fallback');
      }

      this.notify('TRIP_LOADED', trip);
      return true;
    } catch (e) {
      console.warn('Error loading trip:', e);
      return false;
    }
  }

  async toggleTripPublic(tripId, isPublic) {
    const updated = await this.api.updateTrip(tripId, { is_public: isPublic });
    await this.loadSavedTrips();
    this.notify('TRIP_UPDATED', updated);
    return updated;
  }

  async deleteSavedTrip(tripId) {
    await this.api.deleteTrip(tripId);
    await this.loadSavedTrips();
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

  toggleComparisonCity(cityId) {
    const numId = parseInt(cityId);
    const index = this.state.comparisonCityIds.indexOf(numId);
    if (index > -1) {
      if (this.state.comparisonCityIds.length > 1) {
        this.state.comparisonCityIds.splice(index, 1);
      }
    } else {
      if (this.state.comparisonCityIds.length >= 3) {
        this.state.comparisonCityIds.shift();
      }
      this.state.comparisonCityIds.push(numId);
    }
    this.notify('COMPARISON_UPDATED', this.state.comparisonCityIds);
  }
}

// Global state instance
window.GlobeTrotterState = new GlobeTrotterState();
