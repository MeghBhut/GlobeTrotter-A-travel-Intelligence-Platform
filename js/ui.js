/**
 * GlobeTrotter UI Rendering Controller (Cyanotype Theme & v2 Tasks Compliant)
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
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        if (view) {
          // Auth Gate for Saved Trips / Profile
          if (view === 'saved' && !this.state.isAuthenticated()) {
            this.openAuthModal('login');
            if (window.GlobeTrotterApp) {
              window.GlobeTrotterApp.showToast('Please log in to view and manage your trips', 'warning');
            }
            return;
          }
          this.state.setView(view);
        }
      });
    });

    // Profile Pill Button Click
    const profileBtn = document.getElementById('user-profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        if (this.state.isAuthenticated()) {
          this.state.setView('profile');
        } else {
          this.openAuthModal('login');
        }
      });
    }

    // Backend Badge Click (Safe binding)
    const backendBadge = document.getElementById('backend-status-badge');
    if (backendBadge) {
      backendBadge.addEventListener('click', () => {
        if (window.GlobeTrotterApp) {
          window.GlobeTrotterApp.pingBackend();
        }
      });
    }

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

    // City Modal Close
    const modalBackdrop = document.getElementById('city-modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
          this.closeCityModal();
        }
      });
    }

    // Auth Modal Close
    const authBackdrop = document.getElementById('auth-modal-backdrop');
    if (authBackdrop) {
      authBackdrop.addEventListener('click', (e) => {
        if (e.target === authBackdrop) {
          this.closeAuthModal();
        }
      });
    }

    // Planner View Toggle (List vs Calendar)
    const btnListView = document.getElementById('btn-view-list');
    const btnCalView = document.getElementById('btn-view-calendar');
    if (btnListView && btnCalView) {
      btnListView.addEventListener('click', () => this.state.setPlannerViewMode('list'));
      btnCalView.addEventListener('click', () => this.state.setPlannerViewMode('calendar'));
    }
  }

  handleStateUpdate(state, action, payload) {
    switch (action) {
      case 'VIEW_CHANGED':
        this.renderView(state.currentView, payload.params);
        break;
      case 'PLANNER_VIEW_MODE_CHANGED':
        this.renderPlanner();
        break;
      case 'AUTH_STATE_CHANGED':
        this.renderProfilePill();
        this.renderProfileView();
        this.renderSavedTrips();
        break;
      case 'AUTH_MODAL_CHANGED':
        if (payload.isOpen) {
          this.renderAuthModal(payload.mode);
        } else {
          this.closeAuthModal();
        }
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
      case 'ACTIVE_STOP_CHANGED':
      case 'STOPS_CHANGED':
      case 'DURATION_CHANGED':
      case 'DATES_CHANGED':
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
      case 'TRIP_UPDATED':
        this.renderSavedTrips();
        break;
      case 'PUBLIC_TRIP_LOADED':
        this.renderPublicTripView(state.publicTrip);
        break;
      case 'PUBLIC_TRIP_ERROR':
        this.renderPublicTripError(payload);
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
    this.renderProfilePill();
    this.renderDestinationsGrid();
    this.renderPlanner();
    this.renderBudgetSidebar();
    this.renderSavedTrips();
    this.renderComparison();
    this.renderProfileView();
    this.renderView(this.state.getState().currentView);
    if (window.lucide) window.lucide.createIcons();
  }

  renderView(viewName, params = {}) {
    const views = ['explore', 'planner', 'saved', 'comparison', 'profile', 'public'];
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

  // ==================== AUTH & PROFILE UI ====================

  renderProfilePill() {
    const user = this.state.getState().currentUser;
    const profileBtn = document.getElementById('user-profile-btn');
    if (!profileBtn) return;

    if (user && user.name) {
      const initial = user.name.charAt(0).toUpperCase();
      profileBtn.innerHTML = `
        <div class="w-5 h-5 rounded-full bg-[var(--cyan)] text-[var(--surface-2)] font-semibold flex items-center justify-center text-[10px]">
          ${initial}
        </div>
        <span class="hidden md:inline font-medium text-[var(--ink)]">${user.name}</span>
      `;
      profileBtn.className = "flex items-center gap-1.5 surface-inset px-2.5 py-1 rounded-[var(--radius-control)] text-xs cursor-pointer hover:border-[var(--cyan)] border border-transparent";
    } else {
      profileBtn.innerHTML = `
        <i data-lucide="user" class="w-3.5 h-3.5 text-[var(--cyan)]"></i>
        <span class="font-medium text-[var(--cyan)]">Log In</span>
      `;
      profileBtn.className = "btn-secondary text-xs py-1 px-2.5";
    }
    if (window.lucide) window.lucide.createIcons();
  }

  openAuthModal(mode = 'login') {
    this.state.openAuthModal(mode);
  }

  closeAuthModal() {
    const modal = document.getElementById('auth-modal-backdrop');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  renderAuthModal(mode = 'login') {
    const modalBackdrop = document.getElementById('auth-modal-backdrop');
    const modalContent = document.getElementById('auth-modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="p-6 sm:p-8 space-y-6">
        <div class="flex justify-between items-center pb-3 border-b border-[var(--line)]">
          <div>
            <p class="eyebrow">Authentication</p>
            <h3 class="text-xl font-bold text-primary">${mode === 'signup' ? 'Create an Account' : mode === 'forgot' ? 'Reset Password' : 'Log In to GlobeTrotter'}</h3>
          </div>
          <button onclick="GlobeTrotterUI.closeAuthModal()" class="theme-toggle" aria-label="Close modal">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div id="auth-error-alert" class="hidden p-3 rounded-[var(--radius-control)] surface-inset border border-rose-500/50 text-rose-500 text-xs font-medium"></div>

        ${mode === 'login' ? `
          <form id="form-auth-login" class="space-y-4" onsubmit="event.preventDefault(); GlobeTrotterApp.handleLogin(this);">
            <div>
              <label class="block text-dim text-xs mb-1 font-medium">Email Address:</label>
              <input name="email" type="email" required placeholder="megh@example.com" value="megh@example.com" class="input w-full" />
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="text-dim text-xs font-medium">Password:</label>
                <button type="button" onclick="GlobeTrotterUI.renderAuthModal('forgot')" class="text-xs text-[var(--cyan)] hover:underline">Forgot password?</button>
              </div>
              <input name="password" type="password" required placeholder="••••••••" value="secret123" class="input w-full" />
            </div>
            <button type="submit" class="btn-primary w-full py-2.5 text-sm font-semibold">
              <i data-lucide="log-in" class="w-4 h-4"></i> Log In
            </button>
            <div class="text-center pt-2 text-xs text-dim">
              Don't have an account yet?
              <button type="button" onclick="GlobeTrotterUI.renderAuthModal('signup')" class="text-[var(--cyan)] font-semibold hover:underline ml-1">Sign Up</button>
            </div>
          </form>
        ` : mode === 'signup' ? `
          <form id="form-auth-signup" class="space-y-4" onsubmit="event.preventDefault(); GlobeTrotterApp.handleSignup(this);">
            <div>
              <label class="block text-dim text-xs mb-1 font-medium">Full Name:</label>
              <input name="name" type="text" required placeholder="Megh Sharma" class="input w-full" />
            </div>
            <div>
              <label class="block text-dim text-xs mb-1 font-medium">Email Address:</label>
              <input name="email" type="email" required placeholder="megh@example.com" class="input w-full" />
            </div>
            <div>
              <label class="block text-dim text-xs mb-1 font-medium">Password:</label>
              <input name="password" type="password" required minlength="6" placeholder="Choose a secure password" class="input w-full" />
            </div>
            <button type="submit" class="btn-primary w-full py-2.5 text-sm font-semibold">
              <i data-lucide="user-plus" class="w-4 h-4"></i> Create Account
            </button>
            <div class="text-center pt-2 text-xs text-dim">
              Already have an account?
              <button type="button" onclick="GlobeTrotterUI.renderAuthModal('login')" class="text-[var(--cyan)] font-semibold hover:underline ml-1">Log In</button>
            </div>
          </form>
        ` : `
          <div class="space-y-4">
            <p class="text-xs text-dim leading-relaxed">Enter your registered email address and we'll send password recovery instructions.</p>
            <div>
              <label class="block text-dim text-xs mb-1 font-medium">Email Address:</label>
              <input type="email" placeholder="megh@example.com" class="input w-full" />
            </div>
            <button type="button" onclick="GlobeTrotterApp.showToast('Password reset link sent to email (Demo)', 'info'); GlobeTrotterUI.renderAuthModal('login');" class="btn-primary w-full py-2.5 text-sm">
              Send Reset Instructions
            </button>
            <div class="text-center pt-2 text-xs">
              <button type="button" onclick="GlobeTrotterUI.renderAuthModal('login')" class="text-[var(--cyan)] font-semibold hover:underline">Back to Login</button>
            </div>
          </div>
        `}
      </div>
    `;

    modalBackdrop.classList.remove('hidden');
    modalBackdrop.classList.add('flex', 'animate-fade-in');
    if (window.lucide) window.lucide.createIcons();
  }

  renderProfileView() {
    const container = document.getElementById('profile-content-container');
    if (!container) return;

    const user = this.state.getState().currentUser;
    const savedTrips = this.state.getState().savedTrips;

    if (!user) {
      container.innerHTML = `
        <div class="text-center py-16 text-dim col-span-full">
          <i data-lucide="lock" class="w-12 h-12 mx-auto mb-3 text-dim"></i>
          <h3 class="text-lg font-bold text-primary">Sign in to view your profile</h3>
          <p class="text-sm mt-1">Manage your custom trips, saved preferences, and account settings.</p>
          <button onclick="GlobeTrotterUI.openAuthModal('login')" class="btn-primary mt-4">
            Log In / Sign Up
          </button>
        </div>
      `;
      return;
    }

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- User Info Card (4 cols) -->
        <div class="md:col-span-4 space-y-4">
          <div class="surface-elevated p-6 text-center">
            <div class="w-20 h-20 rounded-full bg-[var(--cyan)] text-[var(--surface-2)] text-2xl font-bold flex items-center justify-center mx-auto mb-3 shadow-md">
              ${initial}
            </div>
            <h3 class="text-xl font-bold text-primary">${user.name}</h3>
            <p class="text-xs text-dim mt-0.5">${user.email}</p>
            <span class="chip text-[10px] mt-2 active">User ID: #${user.id}</span>

            <div class="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-[var(--line)] text-left">
              <div class="surface-inset p-2.5 rounded-[var(--radius-control)]">
                <span class="text-dim text-[10px] uppercase font-semibold block">My Trips</span>
                <span class="stat-mono text-base font-bold text-[var(--cyan)]">${savedTrips.length}</span>
              </div>
              <div class="surface-inset p-2.5 rounded-[var(--radius-control)]">
                <span class="text-dim text-[10px] uppercase font-semibold block">Destinations</span>
                <span class="stat-mono text-base font-bold text-[var(--sun)]">10 Hubs</span>
              </div>
            </div>

            <button onclick="GlobeTrotterApp.handleLogout()" class="btn-secondary w-full text-xs mt-6 text-rose-500 hover:border-rose-500">
              <i data-lucide="log-out" class="w-3.5 h-3.5"></i> Log Out
            </button>
          </div>
        </div>

        <!-- Settings & Preferences (8 cols) -->
        <div class="md:col-span-8 space-y-4">
          <div class="surface p-6 space-y-5">
            <h4 class="text-sm font-bold uppercase tracking-wider text-[var(--cyan)] flex items-center gap-2">
              <i data-lucide="settings" class="w-4 h-4"></i> User Preferences & Settings
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block text-dim font-medium mb-1">Display Language:</label>
                <select class="select-control w-full">
                  <option value="en" selected>English (India / Global)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div>
                <label class="block text-dim font-medium mb-1">Default Currency:</label>
                <select id="profile-currency-select" onchange="GlobeTrotterState.setCurrency(this.value)" class="select-control w-full">
                  <option value="INR" ${this.state.state.currency === 'INR' ? 'selected' : ''}>INR (₹) - Indian Rupee</option>
                  <option value="USD" ${this.state.state.currency === 'USD' ? 'selected' : ''}>USD ($) - US Dollar</option>
                  <option value="EUR" ${this.state.state.currency === 'EUR' ? 'selected' : ''}>EUR (€) - Euro</option>
                  <option value="GBP" ${this.state.state.currency === 'GBP' ? 'selected' : ''}>GBP (£) - British Pound</option>
                </select>
              </div>
            </div>

            <div class="pt-4 border-t border-[var(--line)] flex justify-between items-center">
              <div>
                <span class="font-bold text-xs text-primary block">Color Theme</span>
                <span class="text-dim text-[11px]">Toggle Cyanotype Light / Dark modes</span>
              </div>
              <button onclick="window.CyanotypeTheme.toggle()" class="btn-secondary text-xs">
                <i data-lucide="sun" class="w-3.5 h-3.5"></i> Switch Mode
              </button>
            </div>

            <!-- Danger Zone -->
            <div class="pt-4 border-t border-[var(--line)]">
              <span class="eyebrow text-rose-500 block mb-1">Danger Zone</span>
              <div class="flex justify-between items-center">
                <span class="text-xs text-dim">Delete account and all stored itineraries</span>
                <button onclick="alert('Account deletion request placeholder (v2)');" class="btn-secondary text-xs text-rose-500 hover:border-rose-500">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  // ==================== EXPLORE & PLANNER UI ====================

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
    this.state.ensureStops();
    const currentCity = this.state.getCurrentCity();
    const tripPlan = this.state.getState().tripPlan;
    const activeStop = this.state.getActiveStop();
    const stops = tripPlan.stops || [];
    const viewMode = this.state.getState().plannerViewMode;
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
                Stop ${tripPlan.activeStopIndex + 1} of ${stops.length} • ${currentCity.region} India • Best: ${currentCity.bestTime} (ID: ${currentCity.id})
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

    this.renderStopsManager();

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
    if (nightsInput) nightsInput.value = activeStop.nights;

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

    // Update List vs Calendar toggle button styles
    const btnListView = document.getElementById('btn-view-list');
    const btnCalView = document.getElementById('btn-view-calendar');
    if (btnListView && btnCalView) {
      if (viewMode === 'calendar') {
        btnCalView.classList.add('active');
        btnListView.classList.remove('active');
      } else {
        btnListView.classList.add('active');
        btnCalView.classList.remove('active');
      }
    }

    // Render Schedule (List or Calendar)
    this.renderDayScheduler(viewMode);
  }

  renderStopsManager() {
    const container = document.getElementById('planner-stops-manager');
    if (!container) return;

    const tripPlan = this.state.getState().tripPlan;
    const stops = tripPlan.stops || [];
    const activeIndex = tripPlan.activeStopIndex || 0;

    container.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="eyebrow">POST /api/trips/{id}/stops</span>
          <h3 class="text-sm font-bold uppercase tracking-wider text-[var(--cyan)] flex items-center gap-2">
            <i data-lucide="route" class="w-4 h-4"></i> Multi-City Trip Stops
          </h3>
        </div>
        <button onclick="GlobeTrotterState.addTripStop()" class="btn-primary text-xs">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add City Stop
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        ${stops.map((stop, index) => {
          const city = CITIES_DATA.find(c => c.id === stop.cityId) || CITIES_DATA[0];
          const actCount = (stop.activityIds || []).length;
          return `
            <div class="p-3 rounded-[var(--radius-control)] border ${index === activeIndex ? 'surface-elevated border-[var(--cyan)]' : 'surface-inset border-[var(--line)]'}">
              <button onclick="GlobeTrotterState.setActiveStop(${index})" class="w-full text-left">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span class="eyebrow">Stop ${index + 1}</span>
                    <h4 class="font-bold text-primary text-sm">${city.name}</h4>
                    <p class="text-[11px] text-dim">${stop.start_date || 'Start'} to ${stop.end_date || 'End'} • ${stop.nights || 1} nts • ${actCount} tours</p>
                  </div>
                  <span class="chip text-[10px] ${index === activeIndex ? 'active' : ''}">${index === activeIndex ? 'Editing' : 'Select'}</span>
                </div>
              </button>
              <div class="grid grid-cols-2 gap-2 mt-3">
                <input id="stop-start-${index}" type="date" value="${stop.start_date || ''}" onchange="GlobeTrotterState.setActiveStop(${index}); GlobeTrotterState.setTripDates(this.value, document.getElementById('stop-end-${index}').value)" class="input text-[11px] py-1.5" />
                <input id="stop-end-${index}" type="date" value="${stop.end_date || ''}" onchange="GlobeTrotterState.setActiveStop(${index}); GlobeTrotterState.setTripDates(document.getElementById('stop-start-${index}')?.value || '${stop.start_date || ''}', this.value)" class="input text-[11px] py-1.5" />
              </div>
              <div class="flex justify-between items-center mt-3 pt-2 border-t border-[var(--line)]">
                <div class="flex gap-1">
                  <button onclick="GlobeTrotterState.moveTripStop(${index}, -1)" class="theme-toggle" title="Move earlier" ${index === 0 ? 'disabled' : ''}>
                    <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="GlobeTrotterState.moveTripStop(${index}, 1)" class="theme-toggle" title="Move later" ${index === stops.length - 1 ? 'disabled' : ''}>
                    <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
                <button onclick="GlobeTrotterState.removeTripStop(${index})" class="text-dim hover:text-rose-500 transition p-1" title="Remove stop" ${stops.length <= 1 ? 'disabled' : ''}>
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderDayScheduler(viewMode = 'list') {
    const container = document.getElementById('planner-schedule-container');
    if (!container) return;

    const currentCity = this.state.getCurrentCity();
    const state = this.state.getState();
    const nights = state.tripPlan.nights;
    const schedule = state.tripPlan.daySchedule;
    const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === currentCity.id);
    const selectedActs = cityActs.filter(a => state.tripPlan.activityIds.includes(a.id));

    if (viewMode === 'calendar') {
      // Timeline / Calendar Mode
      let calHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      `;
      for (let day = 1; day <= nights; day++) {
        const daySlots = schedule[day] || { morning: null, afternoon: null, evening: null };
        calHTML += `
          <div class="surface-inset p-3.5 rounded-[var(--radius-card)] border border-[var(--line)] space-y-2">
            <div class="flex justify-between items-center border-b border-[var(--line)] pb-1.5">
              <span class="eyebrow">Day ${day}</span>
              <span class="stat-mono text-[10px] text-dim">${this.formatStopDayDate(state.tripPlan.start_date, day)}</span>
            </div>
            <div class="space-y-1.5 text-xs">
              <div class="p-1.5 rounded-[var(--radius-control)] bg-[var(--surface)]">
                <span class="text-[9px] uppercase font-bold text-[var(--cyan)] block">AM:</span>
                <span class="font-medium text-primary text-[11px] truncate block">${daySlots.morning ? (cityActs.find(a => a.id === parseInt(daySlots.morning))?.name || 'Assigned') : '— Free —'}</span>
              </div>
              <div class="p-1.5 rounded-[var(--radius-control)] bg-[var(--surface)]">
                <span class="text-[9px] uppercase font-bold text-[var(--cyan)] block">AFT:</span>
                <span class="font-medium text-primary text-[11px] truncate block">${daySlots.afternoon ? (cityActs.find(a => a.id === parseInt(daySlots.afternoon))?.name || 'Assigned') : '— Free —'}</span>
              </div>
              <div class="p-1.5 rounded-[var(--radius-control)] bg-[var(--surface)]">
                <span class="text-[9px] uppercase font-bold text-[var(--cyan)] block">EVE:</span>
                <span class="font-medium text-primary text-[11px] truncate block">${daySlots.evening ? (cityActs.find(a => a.id === parseInt(daySlots.evening))?.name || 'Assigned') : '— Free —'}</span>
              </div>
            </div>
          </div>
        `;
      }
      calHTML += `</div>`;
      container.innerHTML = calHTML;
      return;
    }

    // List Mode
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

  formatStopDayDate(startDate, day) {
    if (!startDate) return `Day ${day}`;
    const date = new Date(new Date(startDate).getTime() + (day - 1) * 86400000);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
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

  // ==================== SAVED TRIPS & PUBLIC VIEW ====================

  renderSavedTrips() {
    const container = document.getElementById('saved-trips-container');
    if (!container) return;

    const saved = this.state.getState().savedTrips;
    const currency = this.state.getState().currency;

    if (!this.state.isAuthenticated()) {
      container.innerHTML = `
        <div class="text-center py-16 text-dim col-span-full">
          <i data-lucide="lock" class="w-12 h-12 mx-auto mb-3 text-dim"></i>
          <h3 class="text-lg font-bold text-primary">Log in to view saved trips</h3>
          <p class="text-sm mt-1">Access your saved itineraries stored securely in your account.</p>
          <button onclick="GlobeTrotterUI.openAuthModal('login')" class="btn-primary mt-4">
            Log In / Sign Up
          </button>
        </div>
      `;
      return;
    }

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
      const stops = (trip.stops || []).slice().sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      const routeCities = stops.map(stop => stop.city?.name).filter(Boolean);
      const city = stops[0] && stops[0].city ? stops[0].city : CITIES_DATA[0];
      const actCount = stops.reduce((sum, stop) => sum + ((stop.activities || []).length), 0);
      const routeLabel = routeCities.length ? routeCities.join(' → ') : `${city.name || 'Trip'}, ${city.state || ''}`;

      return `
        <div class="surface-elevated p-5 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="eyebrow">${routeLabel}</p>
                <h4 class="text-xl font-bold text-primary mt-0.5">${trip.name}</h4>
              </div>
              <button onclick="GlobeTrotterApp.deleteTrip(${trip.id})" class="text-dim hover:text-rose-500 p-1 transition cursor-pointer" title="Delete Trip">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
            
            <p class="text-xs text-dim mb-3">
              ${trip.start_date || '2026-09-01'} to ${trip.end_date || '2026-09-04'} • ${trip.destination_count || stops.length || 1} Stops • ${actCount} Activities
            </p>

            <div class="p-3 rounded-[var(--radius-control)] surface-inset mb-4 text-xs space-y-2">
              <div class="flex justify-between text-dim">
                <span>Visibility:</span>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" ${trip.is_public ? 'checked' : ''} onchange="GlobeTrotterApp.handleTogglePublic(${trip.id}, this.checked)" class="custom-checkbox" />
                  <span class="font-medium ${trip.is_public ? 'text-[var(--cyan)] font-bold' : 'text-dim'}">${trip.is_public ? 'Public' : 'Private'}</span>
                </label>
              </div>

              ${trip.is_public && trip.share_slug ? `
                <div class="flex justify-between items-center text-dim border-t border-[var(--line)] pt-1.5">
                  <span>Public Link:</span>
                  <button onclick="GlobeTrotterApp.openPublicTrip('${trip.share_slug}')" class="text-[var(--cyan)] font-semibold hover:underline flex items-center gap-1">
                    <i data-lucide="external-link" class="w-3 h-3"></i> View Shared
                  </button>
                </div>
              ` : ''}
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

  renderPublicTripView(trip) {
    const container = document.getElementById('public-trip-container');
    if (!container) return;

    if (!trip) {
      container.innerHTML = `<p class="text-center text-dim py-16">Loading public itinerary...</p>`;
      return;
    }

    const stops = trip.stops || [];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Postcard Banner -->
        <div class="surface-elevated overflow-hidden">
          <div class="postcard-placeholder h-48 sm:h-56">
            <span class="sun"></span>
          </div>
          <div class="p-6 sm:p-8 space-y-3">
            <div class="flex justify-between items-start">
              <div>
                <span class="chip text-xs active">Public Itinerary</span>
                <h2 class="text-3xl sm:text-4xl font-extrabold text-primary mt-1">${trip.name}</h2>
                <p class="text-dim text-sm mt-1">${trip.description || 'Shared Indian Travel Itinerary'}</p>
              </div>
              <div class="text-right">
                <span class="stat-mono text-xs text-dim block">${trip.start_date || ''} — ${trip.end_date || ''}</span>
                <span class="chip text-[11px] mt-1">${stops.length} Stops</span>
              </div>
            </div>

            <!-- Social Share Bar -->
            <div class="pt-4 border-t border-[var(--line)] flex flex-wrap gap-2 items-center justify-between">
              <div class="flex gap-2">
                <button onclick="GlobeTrotterApp.copyPublicLink('${trip.share_slug}')" class="btn-secondary text-xs">
                  <i data-lucide="link" class="w-3.5 h-3.5"></i> Copy Public Link
                </button>
                <a href="https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this trip to India: ' + window.location.href)}" target="_blank" class="btn-secondary text-xs">
                  <i data-lucide="message-circle" class="w-3.5 h-3.5 text-emerald-500"></i> WhatsApp
                </a>
              </div>
              <button onclick="GlobeTrotterApp.copyTripToMyAccount(${trip.id})" class="btn-primary text-xs">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy to My Account
              </button>
            </div>
          </div>
        </div>

        <!-- Stops & Activities -->
        <div class="space-y-4">
          <h3 class="text-lg font-bold text-primary flex items-center gap-2">
            <i data-lucide="map-pin" class="w-4 h-4 text-[var(--cyan)]"></i> Trip Stops & Included Activities
          </h3>

          ${stops.map((stop, idx) => `
            <div class="surface p-5 space-y-3">
              <div class="flex justify-between items-center pb-2 border-b border-[var(--line)]">
                <div>
                  <span class="eyebrow">Stop #${idx + 1}</span>
                  <h4 class="text-lg font-bold text-primary">${stop.city?.name}, ${stop.city?.state}</h4>
                </div>
                <span class="stat-mono text-xs text-dim">${stop.start_date || ''} to ${stop.end_date || ''}</span>
              </div>

              <div class="space-y-1.5">
                <span class="text-xs text-dim font-medium uppercase">Experiences:</span>
                ${stop.activities && stop.activities.length ? stop.activities.map(a => `
                  <div class="surface-inset p-2.5 rounded-[var(--radius-control)] flex justify-between items-center text-xs">
                    <span class="font-medium text-primary">${a.name}</span>
                    <span class="price font-medium">₹${(a.price_per_person * a.num_people).toLocaleString()} (${a.num_people} Pax)</span>
                  </div>
                `).join('') : '<p class="text-xs text-dim italic">No specific activities attached to this stop</p>'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  renderPublicTripError(msg) {
    const container = document.getElementById('public-trip-container');
    if (!container) return;
    container.innerHTML = `
      <div class="text-center py-16 text-dim max-w-md mx-auto">
        <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-3 text-rose-500"></i>
        <h3 class="text-lg font-bold text-primary">Public Trip Not Found</h3>
        <p class="text-sm mt-1">${msg || 'The shared itinerary link may be private or invalid.'}</p>
        <button onclick="GlobeTrotterState.setView('explore')" class="btn-primary mt-4">
          Browse Destinations
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  // ==================== COMPARISON & MODALS ====================

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
