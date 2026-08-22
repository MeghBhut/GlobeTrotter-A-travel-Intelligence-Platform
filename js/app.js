/**
 * GlobeTrotter Application Controller (v2 Tasks & API Contract Compliant)
 */

class GlobeTrotterApp {
  constructor() {
    this.state = window.GlobeTrotterState;
    this.ui = window.GlobeTrotterUI;
    this.planner = window.GlobeTrotterPlanner;
    this.exportEngine = window.GlobeTrotterExport;
    this.api = window.GlobeTrotterAPI;
  }

  init() {
    console.log('🌏 GlobeTrotter App v2 Ready');
    this.ui.init();
    this.setupGlobalShortcuts();
    this.setupPlannerFormListeners();
    this.handleRouteFromHash();
  }

  setupGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.ui.closeCityModal();
        this.ui.closeAuthModal();
      }
    });

    window.addEventListener('hashchange', () => {
      this.handleRouteFromHash();
    });
  }

  handleRouteFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('public/')) {
      const slug = hash.replace('public/', '');
      this.state.setView('public', { slug });
    } else if (['explore', 'planner', 'saved', 'comparison', 'profile'].includes(hash)) {
      this.state.setView(hash);
    }
  }

  setupPlannerFormListeners() {
    const destSelect = document.getElementById('planner-destination-select');
    if (destSelect) {
      destSelect.addEventListener('change', (e) => {
        this.state.setCity(e.target.value, true);
        this.showToast(`Selected ${this.state.getCurrentCity().name} (City ID: ${e.target.value})`, 'info');
      });
    }

    const nightsInput = document.getElementById('input-nights');
    if (nightsInput) {
      nightsInput.addEventListener('change', (e) => {
        this.state.setTripDuration(e.target.value);
      });
    }

    const adultsInput = document.getElementById('input-adults');
    if (adultsInput) {
      adultsInput.addEventListener('change', (e) => {
        const children = document.getElementById('input-children')?.value || 0;
        this.state.setTravelers(e.target.value, children);
      });
    }

    const childrenInput = document.getElementById('input-children');
    if (childrenInput) {
      childrenInput.addEventListener('change', (e) => {
        const adults = document.getElementById('input-adults')?.value || 2;
        this.state.setTravelers(adults, e.target.value);
      });
    }

    const taxToggle = document.getElementById('toggle-taxes');
    if (taxToggle) {
      taxToggle.addEventListener('change', (e) => {
        this.state.setIncludeTaxes(e.target.checked);
      });
    }

    const foodInput = document.getElementById('input-food-rate');
    const transportInput = document.getElementById('input-transport-rate');
    const updateAllowances = () => {
      if (foodInput && transportInput) {
        this.state.setDailyAllowances(foodInput.value, transportInput.value);
      }
    };
    if (foodInput) foodInput.addEventListener('input', updateAllowances);
    if (transportInput) transportInput.addEventListener('input', updateAllowances);

    // Save Trip Button
    const saveTripBtn = document.getElementById('btn-save-trip');
    if (saveTripBtn) {
      saveTripBtn.addEventListener('click', async () => {
        if (!this.state.isAuthenticated()) {
          this.ui.openAuthModal('login');
          this.showToast('Please log in to save trips to your account', 'warning');
          return;
        }

        const currentTitle = this.state.state.tripPlan.title;
        const customTitle = prompt("Enter a title for this trip:", currentTitle);
        if (customTitle !== null) {
          try {
            const trip = await this.state.saveCurrentTrip(customTitle.trim() || currentTitle);
            this.showToast(`Saved "${trip.name}" via API (Trip ID: ${trip.id})!`, 'success');
          } catch (e) {
            this.showToast(`Error saving trip: ${e.message}`, 'warning');
          }
        }
      });
    }

    const printBtn = document.getElementById('btn-print-trip');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.exportEngine.printItinerary();
      });
    }

    const exportJsonBtn = document.getElementById('btn-export-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        this.exportEngine.exportJSON();
        this.showToast('Itinerary JSON exported!', 'success');
      });
    }

    const shareBtn = document.getElementById('btn-share-trip');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.exportEngine.copyShareableSummary();
      });
    }
  }

  // ==================== AUTH HANDLERS ====================

  async handleLogin(form) {
    const email = form.email.value;
    const password = form.password.value;
    const errorAlert = document.getElementById('auth-error-alert');

    try {
      if (errorAlert) errorAlert.classList.add('hidden');
      const res = await this.state.login(email, password);
      this.showToast(`Welcome back, ${res.user.name}!`, 'success');
    } catch (err) {
      if (errorAlert) {
        errorAlert.textContent = err.message || 'Login failed';
        errorAlert.classList.remove('hidden');
      } else {
        this.showToast(err.message || 'Login failed', 'warning');
      }
    }
  }

  async handleSignup(form) {
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const errorAlert = document.getElementById('auth-error-alert');

    try {
      if (errorAlert) errorAlert.classList.add('hidden');
      const res = await this.state.signup(name, email, password);
      this.showToast(`Account created! Welcome, ${res.user.name}`, 'success');
    } catch (err) {
      if (errorAlert) {
        errorAlert.textContent = err.message || 'Signup failed';
        errorAlert.classList.remove('hidden');
      } else {
        this.showToast(err.message || 'Signup failed', 'warning');
      }
    }
  }

  handleLogout() {
    this.state.logout();
    this.state.setView('explore');
    this.showToast('You have been logged out', 'info');
  }

  // ==================== TRIP ACTIONS ====================

  startPlanning(cityId) {
    this.ui.closeCityModal();
    this.state.setCity(cityId, true);
    this.state.setView('planner');
    this.showToast(`Configured itinerary for ${this.state.getCurrentCity().name}`, 'success');
  }

  async loadAndOpenTrip(tripId) {
    const success = await this.state.loadSavedTrip(tripId);
    if (success) {
      this.state.setView('planner');
      this.showToast('Loaded trip details via API!', 'success');
    }
  }

  async deleteTrip(tripId) {
    if (confirm('Are you sure you want to delete this trip?')) {
      try {
        await this.state.deleteSavedTrip(tripId);
        this.showToast('Trip deleted (DELETE /api/trips/:id)', 'info');
      } catch (e) {
        this.showToast(`Error deleting trip: ${e.message}`, 'warning');
      }
    }
  }

  async handleTogglePublic(tripId, isPublic) {
    try {
      const updated = await this.state.toggleTripPublic(tripId, isPublic);
      this.showToast(`Trip marked ${isPublic ? 'Public (share link created)' : 'Private'}`, 'info');
    } catch (e) {
      this.showToast(`Error updating trip visibility: ${e.message}`, 'warning');
    }
  }

  openPublicTrip(slug) {
    window.location.hash = `public/${slug}`;
  }

  copyPublicLink(slug) {
    const url = window.location.origin + window.location.pathname + '#public/' + slug;
    navigator.clipboard.writeText(url).then(() => {
      this.showToast('Public trip URL copied to clipboard!', 'success');
    });
  }

  async copyTripToMyAccount(tripId) {
    if (!this.state.isAuthenticated()) {
      this.ui.openAuthModal('login');
      this.showToast('Please log in to copy this trip to your account', 'warning');
      return;
    }

    try {
      const currentPublic = this.state.state.publicTrip;
      if (currentPublic) {
        const trip = await this.state.saveCurrentTrip(`Copy of ${currentPublic.name}`);
        this.showToast('Trip copied to your saved trips!', 'success');
        this.state.setView('saved');
      }
    } catch (e) {
      this.showToast(`Error copying trip: ${e.message}`, 'warning');
    }
  }

  // ==================== BACKEND CONNECTION PING ====================

  async pingBackend() {
    this.showToast('Testing connection to http://localhost:8000...', 'info');
    const isLive = await this.api.checkBackendHealth();
    this.ui.renderBackendBadge(isLive);
    if (isLive) {
      this.showToast('Connected to live backend at http://localhost:8000!', 'success');
      // Refresh current user if token exists
      if (this.state.isAuthenticated()) {
        await this.state.initUser();
      }
    } else {
      this.showToast('Backend offline. Operating smoothly in mock mode with contract v1 data.', 'warning');
    }
  }

  showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'surface-elevated px-4 py-3 text-xs font-medium border border-[var(--line)] shadow-lg pointer-events-auto flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 text-[var(--ink)]';

    toast.innerHTML = `
      <span class="w-2 h-2 rounded-full ${type === 'success' ? 'bg-[var(--cyan)]' : type === 'warning' ? 'bg-[var(--sun)]' : 'bg-[var(--ink-dim)]'}"></span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

window.GlobeTrotterApp = new GlobeTrotterApp();
document.addEventListener('DOMContentLoaded', () => {
  window.GlobeTrotterApp.init();
});
