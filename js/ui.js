/**
 * GlobeTrotter UI Rendering Controller (API Contract v1 Compliant)
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
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-emerald-400 font-bold">Live API (localhost:8000)</span>
        `;
        badge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px]";
      } else {
        badge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span class="text-amber-300 font-medium">Mock API (Contract v1)</span>
        `;
        badge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-[11px]";
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
      const tab = document.querySelector(`.nav-tab[data-view="${v}"]`);
      if (el) {
        if (v === viewName) {
          el.classList.remove('hidden');
          el.classList.add('animate-fade-in');
        } else {
          el.classList.add('hidden');
        }
      }
      if (tab) {
        if (v === viewName) {
          tab.classList.add('text-amber-400', 'border-b-2', 'border-amber-400', 'bg-slate-800/60');
          tab.classList.remove('text-slate-400');
        } else {
          tab.classList.remove('text-amber-400', 'border-b-2', 'border-amber-400', 'bg-slate-800/60');
          tab.classList.add('text-slate-400');
        }
      }
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
        <div class="col-span-full py-16 text-center text-slate-400">
          <i data-lucide="map-pin-off" class="w-12 h-12 mx-auto mb-3 text-slate-500"></i>
          <h3 class="text-xl font-semibold text-white">No destinations found</h3>
          <p class="text-sm mt-1">Try adjusting your search keywords or region filters.</p>
          <button onclick="GlobeTrotterState.resetFilters()" class="mt-4 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm transition">
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
        <div class="glass-card rounded-2xl overflow-hidden flex flex-col group relative">
          <!-- Banner Image -->
          <div class="relative h-48 sm:h-56 overflow-hidden">
            <img src="${city.heroImage}" alt="${city.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>
            
            <!-- Region Badge -->
            <div class="absolute top-3 left-3 flex gap-1.5 flex-wrap">
              <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-900/80 backdrop-blur text-amber-400 border border-amber-500/30">
                ${city.region} India (ID: ${city.id})
              </span>
              <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-900/70 backdrop-blur text-slate-300">
                ${city.state}
              </span>
            </div>

            <!-- Free Activities Badge -->
            ${freeCount > 0 ? `
              <div class="absolute top-3 right-3">
                <span class="px-2 py-1 text-xs font-bold rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur flex items-center gap-1">
                  <i data-lucide="tag" class="w-3 h-3"></i> ${freeCount} Free Walks
                </span>
              </div>
            ` : ''}

            <!-- Title Overlay -->
            <div class="absolute bottom-3 left-4 right-4">
              <h3 class="text-2xl font-bold text-white tracking-tight leading-tight">${city.name}</h3>
              <p class="text-xs text-amber-300/90 font-medium truncate">${city.tagline}</p>
            </div>
          </div>

          <!-- Content Body -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <p class="text-slate-300 text-xs line-clamp-2 mb-4 leading-relaxed">${city.description}</p>
            
            <div class="flex flex-wrap gap-1.5 mb-4">
              ${city.tags.slice(0, 4).map(tag => `
                <span class="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  #${tag}
                </span>
              `).join('')}
            </div>

            <div class="grid grid-cols-2 gap-2 py-3 px-3 rounded-xl bg-slate-800/60 border border-slate-700/50 mb-4 text-xs">
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-semibold">Stays From</span>
                <span class="font-bold text-amber-400 text-sm">${this.planner.formatPrice(lowestHotel.price_per_night, currency)}<span class="text-[10px] font-normal text-slate-400">/nt</span></span>
              </div>
              <div class="text-right">
                <span class="text-slate-400 block text-[10px] uppercase font-semibold">Activities</span>
                <span class="font-bold text-white text-sm">${cityActs.length} Curated</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/40">
              <button onclick="GlobeTrotterState.setModalCity(${city.id})" class="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition flex items-center justify-center gap-1.5">
                <i data-lucide="info" class="w-3.5 h-3.5"></i> City Catalog
              </button>
              <button onclick="GlobeTrotterApp.startPlanning(${city.id})" class="px-3 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/10 transition flex items-center justify-center gap-1.5">
                <i data-lucide="calendar" class="w-3.5 h-3.5"></i> Plan Trip
              </button>
            </div>
          </div>
        </div>
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
        <div class="relative rounded-2xl overflow-hidden mb-6 h-40 sm:h-48 border border-amber-500/20">
          <img src="${currentCity.heroImage}" alt="${currentCity.name}" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent"></div>
          <div class="absolute inset-0 p-6 flex flex-col justify-between">
            <div class="flex justify-between items-start">
              <span class="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 backdrop-blur">
                ${currentCity.region} India • ${currentCity.bestTime} (City ID: ${currentCity.id})
              </span>
              <div class="flex gap-2">
                <button onclick="GlobeTrotterState.setModalCity(${currentCity.id})" class="px-2.5 py-1 text-xs font-medium bg-slate-900/80 hover:bg-slate-900 text-slate-300 rounded-lg border border-slate-700 backdrop-blur transition flex items-center gap-1">
                  <i data-lucide="eye" class="w-3 h-3"></i> View Catalog
                </button>
              </div>
            </div>
            <div>
              <h2 class="text-3xl font-extrabold text-white tracking-tight">${currentCity.name}</h2>
              <p class="text-sm text-amber-200/90 font-medium">${currentCity.tagline}</p>
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
          <button onclick="GlobeTrotterState.applyPreset('${pKey}')" class="p-3 rounded-xl border text-left transition ${isActive ? 'bg-amber-500/15 border-amber-500 text-white glow-amber' : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'}">
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-xs flex items-center gap-1.5 ${isActive ? 'text-amber-400' : 'text-slate-200'}">
                <i data-lucide="${p.icon}" class="w-3.5 h-3.5"></i> ${p.name}
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-900/80 text-slate-400">${p.badge}</span>
            </div>
            <p class="text-[11px] text-slate-400 line-clamp-2 leading-tight">${p.description}</p>
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
            <div class="p-3.5 rounded-xl border transition flex items-center justify-between ${isSelected ? 'bg-amber-500/10 border-amber-500/80 text-white shadow-sm' : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-300'}">
              <div class="flex items-center gap-3">
                <input type="radio" name="selected-hotel" value="${hotel.id}" ${isSelected ? 'checked' : ''} onchange="GlobeTrotterState.setHotel(${hotel.id})" class="w-4 h-4 text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700" />
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-white">${hotel.name}</span>
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">${hotel.tier}</span>
                    <span class="text-[10px] text-slate-500">#${hotel.id}</span>
                  </div>
                  <p class="text-xs text-slate-400 mt-0.5">${hotel.location} • <span class="text-amber-400">★ ${hotel.rating}</span> • <span class="text-slate-500">${hotel.amenities.slice(0, 2).join(', ')}</span></p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-base font-extrabold text-amber-400 block">${this.planner.formatPrice(hotel.price_per_night, currency)}</span>
                <span class="text-[10px] text-slate-400 uppercase tracking-wider">per night</span>
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
            <div class="p-3.5 rounded-xl border transition flex items-center justify-between ${isSelected ? 'bg-emerald-500/10 border-emerald-500/60 text-white shadow-sm' : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-300'}">
              <div class="flex items-center gap-3 flex-1 pr-3">
                <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="GlobeTrotterState.toggleActivity(${act.id})" class="custom-checkbox" />
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}">${act.name}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">${act.category}</span>
                    <span class="text-[10px] text-slate-500">#${act.id}</span>
                    ${act.highlight ? '<span class="text-[10px] text-amber-400 font-bold">★ Highlight</span>' : ''}
                  </div>
                  <p class="text-xs text-slate-400 mt-0.5 line-clamp-1">${act.description}</p>
                </div>
              </div>
              <div class="text-right shrink-0">
                ${isFree ? `
                  <span class="text-xs font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40">FREE (₹0)</span>
                ` : `
                  <span class="text-sm font-bold text-slate-200 block">${this.planner.formatPrice(act.price_per_person, currency)}</span>
                  <span class="text-[10px] text-slate-400 uppercase">per person</span>
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

      const renderSlot = (slotKey, label, colorClass) => {
        const actId = daySlots[slotKey];
        const act = actId ? cityActs.find(a => a.id === parseInt(actId)) : null;

        return `
          <div class="p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/60 flex flex-col justify-between min-h-[85px]">
            <div class="flex justify-between items-center mb-1">
              <span class="text-[10px] uppercase font-bold ${colorClass}">${label}</span>
              ${act ? `
                <button onclick="GlobeTrotterState.setScheduleSlot(${day}, '${slotKey}', null)" class="text-slate-500 hover:text-rose-400 text-xs transition" title="Clear slot">
                  <i data-lucide="x" class="w-3 h-3"></i>
                </button>
              ` : ''}
            </div>
            
            ${act ? `
              <div class="text-xs font-semibold text-slate-200 line-clamp-2 leading-tight">
                ${act.name}
              </div>
              <span class="text-[10px] text-amber-400 mt-1 font-medium">${act.category} • ${act.duration}</span>
            ` : `
              <select onchange="GlobeTrotterState.setScheduleSlot(${day}, '${slotKey}', this.value || null)" class="w-full text-xs bg-slate-800 border border-slate-700 rounded p-1 text-slate-400 focus:text-white focus:outline-none">
                <option value="">+ Assign Activity...</option>
                ${selectedActs.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
              </select>
            `}
          </div>
        `;
      };

      html += `
        <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70 flex flex-col">
          <div class="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/60">
            <span class="font-extrabold text-sm text-amber-400">Day ${day}</span>
            <span class="text-[11px] text-slate-400 font-medium">3 Time Slots</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            ${renderSlot('morning', 'Morning', 'text-amber-400')}
            ${renderSlot('afternoon', 'Afternoon', 'text-cyan-400')}
            ${renderSlot('evening', 'Evening', 'text-purple-400')}
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
          <div class="p-3 rounded-xl text-xs border flex items-start gap-2.5 ${
            ins.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
            ins.type === 'tip' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200' :
            'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }">
            <i data-lucide="${ins.icon}" class="w-4 h-4 shrink-0 mt-0.5"></i>
            <div>
              <span class="font-bold block">${ins.title}</span>
              <p class="text-[11px] opacity-90 mt-0.5">${ins.message}</p>
              ${ins.actionHotelId ? `
                <button onclick="GlobeTrotterState.setHotel(${ins.actionHotelId})" class="mt-1.5 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px]">
                  Switch Stay
                </button>
              ` : ''}
              ${ins.actionActivityId ? `
                <button onclick="GlobeTrotterState.toggleActivity(${ins.actionActivityId})" class="mt-1.5 px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold text-[10px]">
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
        <div class="text-center py-16 text-slate-400 col-span-full">
          <i data-lucide="bookmark-x" class="w-12 h-12 mx-auto mb-3 text-slate-600"></i>
          <h3 class="text-lg font-bold text-white">No saved trips yet</h3>
          <p class="text-sm mt-1">Configure your custom itinerary and click "Save Trip" to store it via the API.</p>
          <button onclick="GlobeTrotterState.setView('planner')" class="mt-4 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs transition">
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
        <div class="glass-card rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start mb-2">
              <div>
                <span class="text-xs text-amber-400 font-bold uppercase tracking-wider">${city.name}, ${city.state || ''}</span>
                <h4 class="text-xl font-bold text-white mt-0.5">${trip.name}</h4>
              </div>
              <button onclick="GlobeTrotterApp.deleteTrip(${trip.id})" class="text-slate-500 hover:text-rose-400 p-1 transition" title="Delete Trip">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
            
            <p class="text-xs text-slate-400 mb-4">
              ${trip.start_date || '2026-09-01'} to ${trip.end_date || '2026-09-04'} • ${trip.num_people || 2} Travelers ${trip.is_public ? '<span class="text-emerald-400 font-bold">• Public</span>' : ''}
            </p>

            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 mb-4 text-xs space-y-1">
              <div class="flex justify-between text-slate-300">
                <span>Hotel:</span>
                <span class="font-medium text-white">${hotel ? hotel.name : 'Custom Stay'}</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>Experiences:</span>
                <span class="font-medium text-white">${actCount} booked</span>
              </div>
              <div class="flex justify-between text-slate-300 border-t border-slate-800 pt-1 mt-1 font-bold">
                <span>Share Slug:</span>
                <span class="text-slate-400 font-mono text-[10px]">${trip.share_slug || 'n/a'}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/40">
            <button onclick="GlobeTrotterApp.loadAndOpenTrip(${trip.id})" class="px-3 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-1.5">
              <i data-lucide="folder-open" class="w-3.5 h-3.5"></i> Load Trip
            </button>
            <button onclick="GlobeTrotterExport.printItinerary()" class="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition flex items-center justify-center gap-1.5">
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
          <button onclick="GlobeTrotterState.toggleComparisonCity(${city.id})" class="px-3 py-1.5 rounded-lg text-xs font-medium border transition ${isChecked ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}">
            ${city.name} ${isChecked ? '✓' : '+'}
          </button>
        `;
      }).join('');
    }

    if (comparisonData.length === 0) {
      container.innerHTML = `<p class="text-center text-slate-400 py-12">Select at least 2 cities above to compare.</p>`;
      return;
    }

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-${comparisonData.length} gap-6">
        ${comparisonData.map(c => `
          <div class="glass-card rounded-2xl p-5 border border-slate-700 flex flex-col justify-between">
            <div>
              <div class="relative h-32 rounded-xl overflow-hidden mb-4">
                <img src="${c.heroImage}" alt="${c.name}" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div class="absolute bottom-2 left-3 right-3">
                  <h4 class="text-xl font-bold text-white">${c.name}</h4>
                  <p class="text-[11px] text-amber-300 font-medium">${c.state} • ${c.region} India</p>
                </div>
              </div>

              <div class="space-y-2.5 text-xs text-slate-300 mb-6">
                <div class="flex justify-between py-1.5 border-b border-slate-800">
                  <span class="text-slate-400">Best Season:</span>
                  <span class="font-semibold text-white">${c.bestTime}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-800">
                  <span class="text-slate-400">Lowest Nightly Stay:</span>
                  <span class="font-bold text-emerald-400">${this.planner.formatPrice(c.stats.lowestHotelPrice, currency)}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-800">
                  <span class="text-slate-400">Luxury Nightly Stay:</span>
                  <span class="font-bold text-purple-400">${this.planner.formatPrice(c.stats.highestHotelPrice, currency)}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-800">
                  <span class="text-slate-400">Free Activities:</span>
                  <span class="font-bold text-cyan-400">${c.stats.freeActivitiesCount} of 10</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-800">
                  <span class="text-slate-400">Backpacker 3D/2N:</span>
                  <span class="font-bold text-amber-400">${this.planner.formatPrice(c.stats.sampleBackpackerTotal, currency)}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-slate-800">
                  <span class="text-slate-400">Ultra Luxury 3D/2N:</span>
                  <span class="font-bold text-amber-300">${this.planner.formatPrice(c.stats.sampleLuxuryTotal, currency)}</span>
                </div>
              </div>
            </div>

            <button onclick="GlobeTrotterApp.startPlanning(${c.id})" class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition">
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
        <button onclick="GlobeTrotterState.setModalCity(null)" class="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>

        <div class="relative h-64 sm:h-72 rounded-t-3xl overflow-hidden">
          <img src="${city.heroImage}" alt="${city.name}" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
          <div class="absolute bottom-6 left-6 right-6">
            <div class="flex gap-2 mb-2">
              <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur">
                ${city.region} India • ${city.state} (City #${city.id})
              </span>
              <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-900/80 text-slate-300 backdrop-blur">
                Best Time: ${city.bestTime}
              </span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">${city.name}</h2>
            <p class="text-sm sm:text-base text-amber-200/90 font-medium">${city.tagline}</p>
          </div>
        </div>

        <div class="p-6 sm:p-8 space-y-8">
          <p class="text-sm sm:text-base text-slate-300 leading-relaxed">${city.description}</p>

          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <i data-lucide="hotel" class="w-5 h-5 text-amber-400"></i> GET /api/cities/${city.id}/hotels (${cityHotels.length} Stays)
              </h3>
              <span class="text-xs text-slate-400">Rates per night</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${cityHotels.map((h, i) => `
                <div class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs font-bold text-amber-400">#${h.id}</span>
                      <span class="font-bold text-sm text-white">${h.name}</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5"><span class="text-amber-300">${h.tier}</span> • ${h.location}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">${h.amenities.join(', ')}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-sm font-extrabold text-amber-400 block">${this.planner.formatPrice(h.price_per_night, currency)}</span>
                    <span class="text-[10px] text-slate-400">/ night</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <i data-lucide="compass" class="w-5 h-5 text-emerald-400"></i> GET /api/cities/${city.id}/activities (${cityActs.length} Experiences)
              </h3>
              <span class="text-xs text-slate-400">Estimates per person</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${cityActs.map((a, i) => `
                <div class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-xs font-bold text-emerald-400">#${a.id}</span>
                      <span class="font-bold text-sm text-white">${a.name}</span>
                      <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300">${a.category}</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1 leading-relaxed">${a.description}</p>
                  </div>
                  <div class="text-right shrink-0">
                    ${a.price_per_person === 0 ? `
                      <span class="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40">FREE</span>
                    ` : `
                      <span class="text-sm font-bold text-slate-200 block">${this.planner.formatPrice(a.price_per_person, currency)}</span>
                      <span class="text-[10px] text-slate-400">/ person</span>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="text-xs text-slate-400 text-center sm:text-left">
              Build an API-synced custom itinerary for <strong class="text-white">${city.name}</strong>
            </div>
            <button onclick="GlobeTrotterApp.startPlanning(${city.id})" class="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
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
