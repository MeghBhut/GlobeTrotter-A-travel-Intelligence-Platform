/**
 * GlobeTrotter UI Rendering Controller (Cyanotype Theme Compliant)
 */

class GlobeTrotterUI {
  constructor() {
    this.state = window.GlobeTrotterState;
    this.planner = window.GlobeTrotterPlanner;
    this.api = window.GlobeTrotterAPI;
  }

  init() {
    this.bindEvents();
    this.renderAll();

    this.state.subscribe((state, action, payload) => {
      this.handleStateUpdate(state, action, payload);
    });

    this.checkBackendStatus();
  }

  async checkBackendStatus() {
    const isLive = await this.api.checkBackendHealth();
    this.renderBackendBadge(isLive);
  }

  renderBackendBadge(isLive) {
    const badge = document.getElementById('backend-status-badge');
    if (badge) {
      if (isLive) {
        badge.innerHTML = `
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse"></span>
          <span class="font-medium">Live API (localhost:8000)</span>
        `;
        badge.className = "cursor-pointer chip text-[11px] py-1 px-2.5 active";
      } else {
        badge.innerHTML = `
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--sun)]"></span>
          <span class="font-normal">Mock API (Contract v1)</span>
        `;
        badge.className = "cursor-pointer chip text-[11px] py-1 px-2.5";
      }
    }
  }

  bindEvents() {
    // Nav Tab Switches
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        if (view) this.state.setView(view);
      });
    });

    // Filters
    const regionFilter = document.getElementById('filter-region');
    if (regionFilter) {
      regionFilter.addEventListener('change', (e) => {
        this.state.setFilter('region', e.target.value);
      });
    }

    const vibeFilter = document.getElementById('filter-vibe');
    if (vibeFilter) {
      vibeFilter.addEventListener('change', (e) => {
        this.state.setFilter('vibe', e.target.value);
      });
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.setFilter('searchQuery', e.target.value);
      });
    }

    // Currency Switcher
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        this.state.setCurrency(e.target.value);
      });
    }

    // Modal Close
    const modalBackdrop = document.getElementById('city-modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
          this.closeCityModal();
        }
      });
    }
  }

  handleStateUpdate(state, action, payload) {
    switch (action) {
      case 'VIEW_CHANGED':
        this.renderView(state.currentView);
        break;
      case 'FILTERS_CHANGED':
        this.renderDestinationsGrid();
        break;
      case 'CURRENCY_CHANGED':
        this.renderAllPrices();
        break;
      case 'CITY_CHANGED':
      case 'PRESET_APPLIED':
      case 'HOTEL_CHANGED':
      case 'ACTIVITIES_CHANGED':
      case 'DURATION_CHANGED':
      case 'TRAVELERS_CHANGED':
      case 'TAXES_TOGGLED':
      case 'ALLOWANCES_CHANGED':
      case 'SCHEDULE_UPDATED':
      case 'TRIP_LOADED':
        this.renderPlanner();
        this.renderBudgetSidebar();
        break;
      case 'MODAL_CITY_CHANGED':
        if (state.activeModalCityId) {
          this.openCityModal(state.activeModalCityId);
        } else {
          this.closeCityModal();
        }
        break;
      case 'SAVED_TRIPS_LOADED':
      case 'TRIP_SAVED':
      case 'TRIP_DELETED':
        this.renderSavedTrips();
        break;
      case 'COMPARISON_UPDATED':
        this.renderComparison();
        break;
      default:
        break;
    }
    if (window.lucide) window.lucide.createIcons();
  }

  renderAll() {
    this.renderDestinationsGrid();
    this.renderPlanner();
    this.renderBudgetSidebar();
    this.renderSavedTrips();
    this.renderComparison();
    this.renderView(this.state.getState().currentView);
    if (window.lucide) window.lucide.createIcons();
  }

  renderView(viewName) {
    const views = ['explore', 'planner', 'saved', 'comparison'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      const tabs = document.querySelectorAll(`.nav-tab[data-view="${v}"]`);
      if (el) {
        if (v === viewName) {
          el.classList.remove('hidden');
          el.classList.add('animate-fade-in');
        } else {
          el.classList.add('hidden');
        }
      }
      tabs.forEach(tab => {
        if (v === viewName) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderDestinationsGrid() {
    const grid = document.getElementById('destinations-grid');
    if (!grid) return;

    const { region, vibe, searchQuery } = this.state.getState().filters;
    const currency = this.state.getState().currency;

    let filtered = CITIES_DATA.filter(city => {
      if (region !== 'all' && city.region.toLowerCase() !== region.toLowerCase()) return false;
      if (vibe !== 'all' && !city.tags.some(t => t.toLowerCase() === vibe.toLowerCase())) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = city.name.toLowerCase().includes(query);
        const matchesState = city.state.toLowerCase().includes(query);
        const matchesTag = city.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesState && !matchesTag) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-dim">
          <i data-lucide="map-pin-off" class="w-12 h-12 mx-auto mb-3 text-dim"></i>
          <h3 class="text-xl font-semibold text-primary">No destinations found</h3>
          <p class="text-sm mt-1">Try adjusting your search keywords or region filters.</p>
          <button onclick="GlobeTrotterState.resetFilters()" class="btn-primary mt-4">
            Reset Filters
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(city => {
      const cityHotels = HOTELS_DATA.filter(h => h.city_id === city.id);
      const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === city.id);
      const lowestHotel = cityHotels[0] || { price_per_night: 0 };
      const freeCount = cityActs.filter(a => a.price_per_person === 0).length;

      return `
        <article class="destination-card">
          <!-- Image Band -->
          <div class="relative h-48 sm:h-52 overflow-hidden">
            <img src="${city.heroImage}" alt="${city.name}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-out" onerror="this.outerHTML='<div class=\\'postcard-placeholder\\'><span class=\\'sun\\'></span></div>'" />
            <div class="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent"></div>
            
            <div class="absolute top-3 left-3 flex gap-1.5 flex-wrap">
              <span class="chip text-[11px] py-0.5 px-2">
                ${city.region} India • #${city.id}
              </span>
            </div>

            ${freeCount > 0 ? `
              <div class="absolute top-3 right-3">
                <span class="chip text-[11px] py-0.5 px-2 active">
                  <i data-lucide="tag" class="w-3 h-3"></i> ${freeCount} Free Walks
                </span>
              </div>
            ` : ''}
          </div>

          <!-- Card Body -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <p class="eyebrow mb-1">${city.state}, INDIA</p>
              <h3 class="card-title text-xl font-bold mb-1">${city.name}</h3>
              <p class="card-country text-dim text-xs mb-3 line-clamp-2">${city.description}</p>
              
              <div class="flex flex-wrap gap-1.5 mb-4">
                ${city.tags.slice(0, 3).map(tag => `
                  <span class="chip text-[10px] py-0.5 px-2">
                    #${tag}
                  </span>
                `).join('')}
              </div>
            </div>

            <div>
              <div class="grid grid-cols-2 gap-2 py-2.5 px-3 rounded-[var(--radius-control)] surface-inset mb-4 text-xs">
                <div>
                  <span class="text-dim block text-[10px] uppercase font-semibold">Stays From</span>
                  <span class="price text-sm font-semibold">${this.planner.formatPrice(lowestHotel.price_per_night, currency)}<span class="text-[10px] text-dim font-normal">/nt</span></span>
                </div>
                <div class="text-right">
                  <span class="text-dim block text-[10px] uppercase font-semibold">Tours</span>
                  <span class="stat-mono text-sm font-medium">${cityActs.length} Curated</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--line)]">
                <button onclick="GlobeTrotterState.setModalCity(${city.id})" class="btn-secondary text-xs">
                  <i data-lucide="info" class="w-3.5 h-3.5"></i> Catalog
                </button>
                <button onclick="GlobeTrotterApp.startPlanning(${city.id})" class="btn-primary text-xs">
                  <i data-lucide="calendar" class="w-3.5 h-3.5"></i> Plan Trip
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  renderPlanner() {
    const currentCity = this.state.getCurrentCity();
    const tripPlan = this.state.getState().tripPlan;
    const currency = this.state.getState().currency;

    const cityHotels = HOTELS_DATA.filter(h => h.city_id === currentCity.id);
    const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === currentCity.id);

    // 1. Destination Dropdown Selector
    const destSelect = document.getElementById('planner-destination-select');
    if (destSelect) {
      destSelect.innerHTML = CITIES_DATA.map(c => `
        <option value="${c.id}" ${c.id === currentCity.id ? 'selected' : ''}>
          ${c.name}, ${c.state} (${c.region} India)
        </option>
      `).join('');
    }

    // 2. City Header Banner
    const cityBanner = document.getElementById('planner-city-banner');
    if (cityBanner) {
      cityBanner.innerHTML = `
        <div class="surface relative rounded-[var(--radius-card)] overflow-hidden mb-6 h-40 sm:h-48 border border-[var(--line)]">
          <img src="${currentCity.heroImage}" alt="${currentCity.name}" class="w-full h-full object-cover" onerror="this.outerHTML='<div class=\\'postcard-placeholder h-full\\'><span class=\\'sun\\'></span></div>'" />
          <div class="absolute inset-0 bg-gradient-to-r from-[var(--surface)] via-[var(--surface)]/70 to-transparent"></div>
          <div class="absolute inset-0 p-6 flex flex-col justify-between">
            <div class="flex justify-between items-start">
              <span class="chip text-xs">
                ${currentCity.region} India • Best: ${currentCity.bestTime} (ID: ${currentCity.id})
              </span>
              <button onclick="GlobeTrotterState.setModalCity(${currentCity.id})" class="btn-secondary text-xs">
                <i data-lucide="eye" class="w-3 h-3"></i> View Catalog
              </button>
            </div>
            <div>
              <p class="eyebrow">${currentCity.state}</p>
              <h2 class="text-3xl font-bold tracking-tight">${currentCity.name}</h2>
              <p class="text-dim text-xs font-medium">${currentCity.tagline}</p>
            </div>
          </div>
        </div>
      `;
    }

    // 3. Preset Tier Pills
    const presetContainer = document.getElementById('planner-preset-pills');
    if (presetContainer) {
      presetContainer.innerHTML = Object.keys(PRESET_TIERS).map(pKey => {
        const p = PRESET_TIERS[pKey];
        const isActive = tripPlan.activePreset === pKey;
        return `
          <button onclick="GlobeTrotterState.applyPreset('${pKey}')" class="p-3.5 rounded-[var(--radius-control)] border text-left transition cursor-pointer ${isActive ? 'surface-elevated border-[var(--cyan)]' : 'surface-inset border-[var(--line)] hover:border-[var(--cyan)]'}">
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-xs flex items-center gap-1.5 ${isActive ? 'text-[var(--cyan)]' : 'text-primary'}">
                <i data-lucide="${p.icon}" class="w-3.5 h-3.5"></i> ${p.name}
              </span>
              <span class="eyebrow text-[9px]">${p.badge}</span>
            </div>
            <p class="text-[11px] text-dim line-clamp-2 leading-tight">${p.description}</p>
          </button>
        `;
      }).join('');
    }

    // 4. Form inputs
    const nightsInput = document.getElementById('input-nights');
    if (nightsInput) nightsInput.value = tripPlan.nights;

    const adultsInput = document.getElementById('input-adults');
    if (adultsInput) adultsInput.value = tripPlan.adults;

    const childrenInput = document.getElementById('input-children');
    if (childrenInput) childrenInput.value = tripPlan.children;

    const taxToggle = document.getElementById('toggle-taxes');
    if (taxToggle) taxToggle.checked = tripPlan.includeTaxes;

    const foodInput = document.getElementById('input-food-rate');
    if (foodInput) foodInput.value = tripPlan.dailyFoodBudgetPerPerson;

    const transportInput = document.getElementById('input-transport-rate');
    if (transportInput) transportInput.value = tripPlan.dailyLocalTransport;

    // 5. Hotel Selection List
    const hotelsList = document.getElementById('planner-hotels-list');
    if (hotelsList) {
      hotelsList.innerHTML = cityHotels.map(hotel => {
        const isSelected = tripPlan.hotelId === hotel.id;
        return `
          <label class="block cursor-pointer">
            <div class="p-3.5 rounded-[var(--radius-control)] border transition flex items-center justify-between ${isSelected ? 'surface-inset border-[var(--cyan)]' : 'surface border-[var(--line)] hover:border-[var(--cyan)]'}">
              <div class="flex items-center gap-3">
                <input type="radio" name="selected-hotel" value="${hotel.id}" ${isSelected ? 'checked' : ''} onchange="GlobeTrotterState.setHotel(${hotel.id})" class="custom-checkbox" />
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-primary">${hotel.name}</span>
                    <span class="chip text-[10px] py-0.5 px-1.5">${hotel.tier}</span>
                    <span class="stat-mono text-[10px] text-dim">#${hotel.id}</span>
                  </div>
                  <p class="text-xs text-dim mt-0.5">${hotel.location} • <span class="rating">★ ${hotel.rating}</span> • <span class="text-dim">${hotel.amenities.slice(0, 2).join(', ')}</span></p>
                </div>
              </div>
              <div class="text-right">
                <span class="price text-sm font-semibold block">${this.planner.formatPrice(hotel.price_per_night, currency)}</span>
                <span class="stat-mono text-[10px] text-dim uppercase">per night</span>
              </div>
            </div>
          </label>
        `;
      }).join('');
    }

    // 6. Activities Selection List
    const activitiesList = document.getElementById('planner-activities-list');
    if (activitiesList) {
      activitiesList.innerHTML = cityActs.map(act => {
        const isSelected = tripPlan.activityIds.includes(act.id);
        const isFree = act.price_per_person === 0;
        return `
          <label class="block cursor-pointer">
            <div class="p-3.5 rounded-[var(--radius-control)] border transition flex items-center justify-between ${isSelected ? 'surface-inset border-[var(--cyan)]' : 'surface border-[var(--line)] hover:border-[var(--cyan)]'}">
              <div class="flex items-center gap-3 flex-1 pr-3">
                <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="GlobeTrotterState.toggleActivity(${act.id})" class="custom-checkbox" />
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-primary">${act.name}</span>
                    <span class="chip text-[10px] py-0.5 px-1.5">${act.category}</span>
                    <span class="stat-mono text-[10px] text-dim">#${act.id}</span>
                    ${act.highlight ? '<span class="rating text-[10px] font-bold">★ Highlight</span>' : ''}
                  </div>
                  <p class="text-xs text-dim mt-0.5 line-clamp-1">${act.description}</p>
                </div>
              </div>
              <div class="text-right shrink-0">
                ${isFree ? `
                  <span class="chip active text-[10px] py-0.5 px-2">FREE</span>
                ` : `
                  <span class="price text-sm font-semibold block">${this.planner.formatPrice(act.price_per_person, currency)}</span>
                  <span class="stat-mono text-[10px] text-dim uppercase">per pax</span>
                `}
              </div>
            </div>
          </label>
        `;
      }).join('');
    }

    this.renderDayScheduler();
  }

  renderDayScheduler() {
    const container = document.getElementById('planner-schedule-container');
    if (!container) return;

    const currentCity = this.state.getCurrentCity();
    const state = this.state.getState();
    const nights = state.tripPlan.nights;
    const schedule = state.tripPlan.daySchedule;
    const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === currentCity.id);
    const selectedActs = cityActs.filter(a => state.tripPlan.activityIds.includes(a.id));

    let html = '';
    for (let day = 1; day <= nights; day++) {
      const daySlots = schedule[day] || { morning: null, afternoon: null, evening: null };

      const renderSlot = (slotKey, label) => {
        const actId = daySlots[slotKey];
        const act = actId ? cityActs.find(a => a.id === parseInt(actId)) : null;

        return `
          <div class="p-2.5 rounded-[var(--radius-control)] surface-inset border border-[var(--line)] flex flex-col justify-between min-h-[85px]">
            <div class="flex justify-between items-center mb-1">
              <span class="eyebrow text-[10px]">${label}</span>
              ${act ? `
                <button onclick="GlobeTrotterState.setScheduleSlot(${day}, '${slotKey}', null)" class="text-dim hover:text-rose-500 text-xs transition cursor-pointer" title="Clear slot">
                  <i data-lucide="x" class="w-3 h-3"></i>
                </button>
              ` : ''}
            </div>
            
            ${act ? `
              <div class="text-xs font-medium text-primary line-clamp-2 leading-tight">
                ${act.name}
              </div>
              <span class="stat-mono text-[10px] text-[var(--cyan)] mt-1">${act.category} • ${act.duration}</span>
            ` : `
              <select onchange="GlobeTrotterState.setScheduleSlot(${day}, '${slotKey}', this.value || null)" class="select-control w-full text-xs p-1 text-dim">
                <option value="">+ Assign Activity...</option>
                ${selectedActs.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
              </select>
            `}
          </div>
        `;
      };

      html += `
        <div class="p-4 rounded-[var(--radius-card)] surface border border-[var(--line)] flex flex-col">
          <div class="flex items-center justify-between pb-2 mb-3 border-b border-[var(--line)]">
            <span class="eyebrow text-xs">Day ${day} Itinerary</span>
            <span class="stat-mono text-[11px] text-dim">3 Slots</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            ${renderSlot('morning', 'Morning')}
            ${renderSlot('afternoon', 'Afternoon')}
            ${renderSlot('evening', 'Evening')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  renderBudgetSidebar() {
    const state = this.state.getState();
    const budget = this.planner.calculateTripBudget(state.tripPlan, state.currency);
    if (!budget) return;

    const currency = state.currency;
    const insights = this.planner.getBudgetInsights(budget);

    const grandTotalEl = document.getElementById('budget-grand-total');
    if (grandTotalEl) grandTotalEl.textContent = this.planner.formatPrice(budget.totals.grandTotalINR, currency);

    const perPersonEl = document.getElementById('budget-per-person');
    if (perPersonEl) perPersonEl.textContent = `${this.planner.formatPrice(budget.totals.perPersonINR, currency)} / traveler`;

    const lineHotel = document.getElementById('budget-line-hotel');
    if (lineHotel) lineHotel.textContent = this.planner.formatPrice(budget.lineItems.accommodation.totalINR, currency);

    const lineActivities = document.getElementById('budget-line-activities');
    if (lineActivities) lineActivities.textContent = this.planner.formatPrice(budget.lineItems.activities.totalINR, currency);

    const lineFood = document.getElementById('budget-line-food');
    if (lineFood) lineFood.textContent = this.planner.formatPrice(budget.lineItems.food.totalINR, currency);

    const lineTransport = document.getElementById('budget-line-transport');
    if (lineTransport) lineTransport.textContent = this.planner.formatPrice(budget.lineItems.transport.totalINR, currency);

    const lineTaxes = document.getElementById('budget-line-taxes');
    if (lineTaxes) lineTaxes.textContent = this.planner.formatPrice(budget.lineItems.taxes.totalINR, currency);

    const barHotel = document.getElementById('budget-bar-hotel');
    if (barHotel) barHotel.style.width = `${budget.lineItems.accommodation.percentage}%`;

    const barActivities = document.getElementById('budget-bar-activities');
    if (barActivities) barActivities.style.width = `${budget.lineItems.activities.percentage}%`;

    const barFood = document.getElementById('budget-bar-food');
    if (barFood) barFood.style.width = `${budget.lineItems.food.percentage}%`;

    const barTransport = document.getElementById('budget-bar-transport');
    if (barTransport) barTransport.style.width = `${budget.lineItems.transport.percentage}%`;

    const insightsContainer = document.getElementById('budget-insights-container');
    if (insightsContainer) {
      if (insights.length === 0) {
        insightsContainer.innerHTML = '';
      } else {
        insightsContainer.innerHTML = insights.map(ins => `
          <div class="p-3 rounded-[var(--radius-control)] text-xs border border-[var(--line)] surface-inset flex items-start gap-2.5">
            <i data-lucide="${ins.icon}" class="w-4 h-4 text-[var(--cyan)] shrink-0 mt-0.5"></i>
            <div>
              <span class="font-bold block text-primary">${ins.title}</span>
              <p class="text-[11px] text-dim mt-0.5">${ins.message}</p>
              ${ins.actionHotelId ? `
                <button onclick="GlobeTrotterState.setHotel(${ins.actionHotelId})" class="btn-primary text-[10px] py-0.5 px-2 mt-1.5">
                  Switch Stay
                </button>
              ` : ''}
              ${ins.actionActivityId ? `
                <button onclick="GlobeTrotterState.toggleActivity(${ins.actionActivityId})" class="btn-secondary text-[10px] py-0.5 px-2 mt-1.5">
                  + Add Free Walk
                </button>
              ` : ''}
            </div>
          </div>
        `).join('');
      }
    }
  }

  renderSavedTrips() {
    const container = document.getElementById('saved-trips-container');
    if (!container) return;

    const saved = this.state.getState().savedTrips;
    const currency = this.state.getState().currency;

    if (saved.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 text-dim col-span-full">
          <i data-lucide="bookmark-x" class="w-12 h-12 mx-auto mb-3 text-dim"></i>
          <h3 class="text-lg font-bold text-primary">No saved trips yet</h3>
          <p class="text-sm mt-1">Configure your custom itinerary and click "Save Trip" to store it via the API.</p>
          <button onclick="GlobeTrotterState.setView('planner')" class="btn-primary mt-4">
            Go to Planner
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = saved.map(trip => {
      const stop = trip.stops && trip.stops[0] ? trip.stops[0] : null;
      const city = stop && stop.city ? stop.city : CITIES_DATA[0];
      const hotel = stop && stop.hotel ? stop.hotel : null;
      const actCount = stop && stop.activities ? stop.activities.length : 0;

      return `
        <div class="surface-elevated p-5 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="eyebrow">${city.name}, ${city.state || ''}</p>
                <h4 class="text-xl font-bold text-primary mt-0.5">${trip.name}</h4>
              </div>
              <button onclick="GlobeTrotterApp.deleteTrip(${trip.id})" class="text-dim hover:text-rose-500 p-1 transition cursor-pointer" title="Delete Trip">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
            
            <p class="text-xs text-dim mb-4">
              ${trip.start_date || '2026-09-01'} to ${trip.end_date || '2026-09-04'} • ${trip.num_people || 2} Travelers
            </p>

            <div class="p-3 rounded-[var(--radius-control)] surface-inset mb-4 text-xs space-y-1">
              <div class="flex justify-between text-dim">
                <span>Hotel:</span>
                <span class="font-medium text-primary">${hotel ? hotel.name : 'Custom Stay'}</span>
              </div>
              <div class="flex justify-between text-dim">
                <span>Experiences:</span>
                <span class="font-medium text-primary">${actCount} booked</span>
              </div>
              <div class="flex justify-between text-dim border-t border-[var(--line)] pt-1 mt-1 font-bold">
                <span>Share Slug:</span>
                <span class="stat-mono text-[10px] text-[var(--cyan)]">${trip.share_slug || 'n/a'}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--line)]">
            <button onclick="GlobeTrotterApp.loadAndOpenTrip(${trip.id})" class="btn-primary text-xs">
              <i data-lucide="folder-open" class="w-3.5 h-3.5"></i> Load Trip
            </button>
            <button onclick="GlobeTrotterExport.printItinerary()" class="btn-secondary text-xs">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i> Print / PDF
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderComparison() {
    const container = document.getElementById('comparison-container');
    if (!container) return;

    const cityIds = this.state.getState().comparisonCityIds;
    const currency = this.state.getState().currency;
    const comparisonData = this.planner.compareDestinations(cityIds);

    const selectorContainer = document.getElementById('comparison-city-selector');
    if (selectorContainer) {
      selectorContainer.innerHTML = CITIES_DATA.map(city => {
        const isChecked = cityIds.includes(city.id);
        return `
          <button onclick="GlobeTrotterState.toggleComparisonCity(${city.id})" class="chip text-xs ${isChecked ? 'active' : ''}">
            ${city.name} ${isChecked ? '✓' : '+'}
          </button>
        `;
      }).join('');
    }

    if (comparisonData.length === 0) {
      container.innerHTML = `<p class="text-center text-dim py-12">Select at least 2 cities above to compare.</p>`;
      return;
    }

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-${comparisonData.length} gap-6">
        ${comparisonData.map(c => `
          <div class="surface-elevated p-5 flex flex-col justify-between">
            <div>
              <div class="relative h-32 rounded-[var(--radius-control)] overflow-hidden mb-4">
                <img src="${c.heroImage}" alt="${c.name}" class="w-full h-full object-cover" onerror="this.outerHTML='<div class=\\'postcard-placeholder h-full\\'><span class=\\'sun\\'></span></div>'" />
                <div class="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent"></div>
                <div class="absolute bottom-2 left-3 right-3">
                  <h4 class="text-xl font-bold text-primary">${c.name}</h4>
                  <p class="eyebrow">${c.state} • ${c.region} India</p>
                </div>
              </div>

              <div class="space-y-2.5 text-xs text-dim mb-6">
                <div class="flex justify-between py-1.5 border-b border-[var(--line)]">
                  <span>Best Season:</span>
                  <span class="font-medium text-primary">${c.bestTime}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-[var(--line)]">
                  <span>Lowest Nightly Stay:</span>
                  <span class="price font-medium">${this.planner.formatPrice(c.stats.lowestHotelPrice, currency)}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-[var(--line)]">
                  <span>Luxury Nightly Stay:</span>
                  <span class="price font-medium">${this.planner.formatPrice(c.stats.highestHotelPrice, currency)}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-[var(--line)]">
                  <span>Free Activities:</span>
                  <span class="stat-mono font-medium text-[var(--cyan)]">${c.stats.freeActivitiesCount} of 10</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-[var(--line)]">
                  <span>Backpacker 3D/2N:</span>
                  <span class="price font-medium">${this.planner.formatPrice(c.stats.sampleBackpackerTotal, currency)}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-[var(--line)]">
                  <span>Ultra Luxury 3D/2N:</span>
                  <span class="price font-medium">${this.planner.formatPrice(c.stats.sampleLuxuryTotal, currency)}</span>
                </div>
              </div>
            </div>

            <button onclick="GlobeTrotterApp.startPlanning(${c.id})" class="btn-primary w-full">
              Select ${c.name}
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  openCityModal(cityId) {
    const numId = parseInt(cityId);
    const city = CITIES_DATA.find(c => c.id === numId);
    if (!city) return;

    const currency = this.state.getState().currency;
    const cityHotels = HOTELS_DATA.filter(h => h.city_id === numId);
    const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === numId);

    const modalBackdrop = document.getElementById('city-modal-backdrop');
    const modalContent = document.getElementById('city-modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="relative">
        <button onclick="GlobeTrotterState.setModalCity(null)" class="theme-toggle absolute top-4 right-4 z-20" aria-label="Close modal">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>

        <div class="relative h-64 sm:h-72 rounded-t-[var(--radius-card)] overflow-hidden">
          <img src="${city.heroImage}" alt="${city.name}" class="w-full h-full object-cover" onerror="this.outerHTML='<div class=\\'postcard-placeholder h-full\\'><span class=\\'sun\\'></span></div>'" />
          <div class="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent"></div>
          <div class="absolute bottom-6 left-6 right-6">
            <div class="flex gap-2 mb-2">
              <span class="chip text-xs">
                ${city.region} India • ${city.state} (#${city.id})
              </span>
              <span class="chip text-xs">
                Best: ${city.bestTime}
              </span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-primary">${city.name}</h2>
            <p class="text-dim text-sm sm:text-base font-medium">${city.tagline}</p>
          </div>
        </div>

        <div class="p-6 sm:p-8 space-y-8">
          <p class="text-sm sm:text-base text-dim leading-relaxed">${city.description}</p>

          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-primary flex items-center gap-2">
                <i data-lucide="hotel" class="w-4 h-4 text-[var(--cyan)]"></i> GET /api/cities/${city.id}/hotels (${cityHotels.length} Stays)
              </h3>
              <span class="eyebrow">Rates per night</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${cityHotels.map((h, i) => `
                <div class="p-3.5 rounded-[var(--radius-control)] surface-inset flex items-center justify-between border border-[var(--line)]">
                  <div>
                    <div class="flex items-center gap-1.5">
                      <span class="stat-mono text-xs text-[var(--cyan)]">#${h.id}</span>
                      <span class="font-bold text-sm text-primary">${h.name}</span>
                    </div>
                    <p class="text-xs text-dim mt-0.5"><span class="font-medium">${h.tier}</span> • ${h.location}</p>
                    <p class="text-[11px] text-dim mt-0.5">${h.amenities.join(', ')}</p>
                  </div>
                  <div class="text-right">
                    <span class="price text-sm font-semibold block">${this.planner.formatPrice(h.price_per_night, currency)}</span>
                    <span class="stat-mono text-[10px] text-dim">/ night</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-primary flex items-center gap-2">
                <i data-lucide="compass" class="w-4 h-4 text-[var(--cyan)]"></i> GET /api/cities/${city.id}/activities (${cityActs.length} Experiences)
              </h3>
              <span class="eyebrow">Estimates per person</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${cityActs.map((a, i) => `
                <div class="p-3.5 rounded-[var(--radius-control)] surface-inset flex items-start justify-between gap-3 border border-[var(--line)]">
                  <div class="flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="stat-mono text-xs text-[var(--cyan)]">#${a.id}</span>
                      <span class="font-bold text-sm text-primary">${a.name}</span>
                      <span class="chip text-[10px] py-0.5 px-1.5">${a.category}</span>
                    </div>
                    <p class="text-xs text-dim mt-1 leading-relaxed">${a.description}</p>
                  </div>
                  <div class="text-right shrink-0">
                    ${a.price_per_person === 0 ? `
                      <span class="chip active text-[10px] py-0.5 px-2">FREE</span>
                    ` : `
                      <span class="price text-sm font-semibold block">${this.planner.formatPrice(a.price_per_person, currency)}</span>
                      <span class="stat-mono text-[10px] text-dim">/ person</span>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="text-xs text-dim text-center sm:text-left">
              Build an API-synced custom itinerary for <strong class="text-primary">${city.name}</strong>
            </div>
            <button onclick="GlobeTrotterApp.startPlanning(${city.id})" class="btn-primary w-full sm:w-auto">
              <i data-lucide="sparkles" class="w-4 h-4"></i> Start Customizing Itinerary
            </button>
          </div>
        </div>
      </div>
    `;

    modalBackdrop.classList.remove('hidden');
    modalBackdrop.classList.add('flex', 'animate-fade-in');
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
  }

  closeCityModal() {
    const modalBackdrop = document.getElementById('city-modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.classList.add('hidden');
      modalBackdrop.classList.remove('flex');
      document.body.style.overflow = 'auto';
    }
    this.state.state.activeModalCityId = null;
  }

  renderAllPrices() {
    this.renderDestinationsGrid();
    this.renderPlanner();
    this.renderBudgetSidebar();
    this.renderSavedTrips();
    this.renderComparison();
  }
}

window.GlobeTrotterUI = new GlobeTrotterUI();
