/**
 * GlobeTrotter Application Controller (API Contract v1 Compliant)
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
    console.log('🌏 GlobeTrotter API Contract v1 Client Ready');
    this.ui.init();
    this.setupGlobalShortcuts();
    this.setupPlannerFormListeners();
  }

  setupGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.ui.closeCityModal();
      }
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (['explore', 'planner', 'saved', 'comparison'].includes(hash)) {
        this.state.setView(hash);
      }
    });
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

    // Save Trip Button (Calls API POST /api/trips and /api/trips/{id}/stops)
    const saveTripBtn = document.getElementById('btn-save-trip');
    if (saveTripBtn) {
      saveTripBtn.addEventListener('click', async () => {
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
      await this.state.deleteSavedTrip(tripId);
      this.showToast('Trip deleted (DELETE /api/trips/:id)', 'info');
    }
  }

  async pingBackend() {
    this.showToast('Testing connection to http://localhost:8000...', 'info');
    const isLive = await this.api.checkBackendHealth();
    this.ui.renderBackendBadge(isLive);
    if (isLive) {
      this.showToast('Connected to live backend at http://localhost:8000!', 'success');
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
    toast.className = `px-4 py-3 rounded-xl text-xs font-semibold shadow-xl border backdrop-blur-md pointer-events-auto flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${
      type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' :
      type === 'warning' ? 'bg-amber-950/90 border-amber-500/50 text-amber-200' :
      'bg-slate-900/90 border-slate-700 text-slate-200'
    }`;

    toast.innerHTML = `<span>${message}</span>`;
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
