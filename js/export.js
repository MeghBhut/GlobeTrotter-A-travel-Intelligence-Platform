/**
 * GlobeTrotter Export & Print Engine (API Contract v1)
 */

class GlobeTrotterExport {
  static printItinerary() {
    const state = window.GlobeTrotterState.getState();
    const budget = window.GlobeTrotterPlanner.calculateTripBudget(state.tripPlan, state.currency);
    if (!budget) return;

    const city = budget.city;
    const hotel = budget.hotel;
    const schedule = state.tripPlan.daySchedule;
    const printContainer = document.getElementById('print-container');
    if (!printContainer) return;

    const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === city.id);

    let scheduleHTML = '';
    for (let day = 1; day <= budget.nights; day++) {
      const daySlots = schedule[day] || { morning: null, afternoon: null, evening: null };
      
      const getActName = (id) => {
        if (!id) return '<span class="text-gray-400 italic">Free exploration time</span>';
        const act = cityActs.find(a => a.id === parseInt(id));
        return act ? `<strong>${act.name}</strong> (${act.category}, ${window.GlobeTrotterPlanner.formatPrice(act.price_per_person, state.currency)}/pax)` : 'None';
      };

      scheduleHTML += `
        <div class="mb-4 p-4 border rounded-lg bg-gray-50 print-page-break">
          <h4 class="font-bold text-base text-gray-900 border-b pb-1 mb-2">Day ${day} Itinerary</h4>
          <div class="grid grid-cols-3 gap-2 text-sm">
            <div><span class="text-xs font-semibold text-amber-700 block uppercase">Morning:</span> ${getActName(daySlots.morning)}</div>
            <div><span class="text-xs font-semibold text-blue-700 block uppercase">Afternoon:</span> ${getActName(daySlots.afternoon)}</div>
            <div><span class="text-xs font-semibold text-purple-700 block uppercase">Evening:</span> ${getActName(daySlots.evening)}</div>
          </div>
        </div>
      `;
    }

    let activitiesHTML = budget.lineItems.activities.items.map((act, i) => `
      <tr class="border-b text-sm">
        <td class="py-2">${i + 1}. ${act.name}</td>
        <td class="py-2 text-center">${act.category}</td>
        <td class="py-2 text-right">${act.isFree ? '<span class="text-green-600 font-semibold">FREE (₹0)</span>' : window.GlobeTrotterPlanner.formatPrice(act.pricePerPersonINR, state.currency)}</td>
        <td class="py-2 text-right font-medium">${window.GlobeTrotterPlanner.formatPrice(act.totalCostINR, state.currency)}</td>
      </tr>
    `).join('');

    printContainer.innerHTML = `
      <div class="p-8 max-w-4xl mx-auto bg-white text-gray-900 font-sans">
        <div class="flex justify-between items-start border-b-2 border-amber-500 pb-4 mb-6">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-2xl font-black text-amber-600 tracking-tight">GLOBETROTTER</span>
              <span class="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase">Official Itinerary</span>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mt-1">${state.tripPlan.title || city.name + ' Tour'}</h1>
            <p class="text-sm text-gray-600">${city.name}, ${city.state} • ${city.tagline}</p>
          </div>
          <div class="text-right text-xs text-gray-500">
            <p>Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
            <p>Duration: <strong>${budget.nights} Nights</strong></p>
            <p>Travelers: <strong>${budget.travelers.total} Persons</strong> (${budget.travelers.adults} Adults, ${budget.travelers.children} Children)</p>
          </div>
        </div>

        <div class="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <h3 class="font-bold text-sm text-amber-900 uppercase tracking-wide mb-2">Selected Accommodation</h3>
          <div class="flex justify-between items-center text-sm">
            <div>
              <p class="font-bold text-base text-gray-900">${hotel.name} <span class="text-xs font-normal text-gray-600">(${hotel.tier})</span></p>
              <p class="text-gray-600 text-xs">${hotel.location} • Rating: ${hotel.rating} ★</p>
              <p class="text-gray-500 text-xs mt-1">Amenities: ${hotel.amenities.join(', ')}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500">Rate / Night: ${window.GlobeTrotterPlanner.formatPrice(hotel.price_per_night, state.currency)}</p>
              <p class="font-bold text-base text-gray-900">${budget.roomsCount} Room(s) × ${budget.nights} Nights</p>
              <p class="text-amber-700 font-bold text-lg">${window.GlobeTrotterPlanner.formatPrice(budget.lineItems.accommodation.totalINR, state.currency)}</p>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="font-bold text-sm text-gray-800 uppercase tracking-wide mb-3">Day-by-Day Schedule</h3>
          ${scheduleHTML}
        </div>

        <div class="mb-6">
          <h3 class="font-bold text-sm text-gray-800 uppercase tracking-wide mb-2">Activities & Experiences Included</h3>
          <table class="w-full text-left">
            <thead>
              <tr class="border-b-2 text-xs font-bold text-gray-500 uppercase">
                <th class="py-2">Activity</th>
                <th class="py-2 text-center">Category</th>
                <th class="py-2 text-right">Price / Person</th>
                <th class="py-2 text-right">Group Total (${budget.travelers.total} Pax)</th>
              </tr>
            </thead>
            <tbody>
              ${activitiesHTML || '<tr><td colspan="4" class="py-4 text-center text-gray-400">No activities selected</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="border-t-2 border-gray-300 pt-4">
          <h3 class="font-bold text-sm text-gray-800 uppercase tracking-wide mb-3">Complete Budget Breakdown</h3>
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-1.5 text-sm text-gray-600">
              <div class="flex justify-between">
                <span>Accommodation Total:</span>
                <span class="font-medium text-gray-800">${window.GlobeTrotterPlanner.formatPrice(budget.lineItems.accommodation.totalINR, state.currency)}</span>
              </div>
              <div class="flex justify-between">
                <span>Activities (${budget.lineItems.activities.count} items):</span>
                <span class="font-medium text-gray-800">${window.GlobeTrotterPlanner.formatPrice(budget.lineItems.activities.totalINR, state.currency)}</span>
              </div>
              <div class="flex justify-between">
                <span>Est. Meals & Dining (${budget.nights} days):</span>
                <span class="font-medium text-gray-800">${window.GlobeTrotterPlanner.formatPrice(budget.lineItems.food.totalINR, state.currency)}</span>
              </div>
              <div class="flex justify-between">
                <span>Est. Local Transport:</span>
                <span class="font-medium text-gray-800">${window.GlobeTrotterPlanner.formatPrice(budget.lineItems.transport.totalINR, state.currency)}</span>
              </div>
              ${budget.lineItems.taxes.applied ? `
                <div class="flex justify-between text-gray-500">
                  <span>Taxes & GST (${budget.lineItems.taxes.effectiveRate}%):</span>
                  <span class="font-medium">${window.GlobeTrotterPlanner.formatPrice(budget.lineItems.taxes.totalINR, state.currency)}</span>
                </div>
              ` : ''}
            </div>

            <div class="p-4 rounded-lg bg-gray-900 text-white flex flex-col justify-center items-end">
              <span class="text-xs text-gray-400 uppercase tracking-wider">Estimated Grand Total</span>
              <span class="text-3xl font-black text-amber-400 my-1">${window.GlobeTrotterPlanner.formatPrice(budget.totals.grandTotalINR, state.currency)}</span>
              <span class="text-xs text-gray-300">Approx. <strong>${window.GlobeTrotterPlanner.formatPrice(budget.totals.perPersonINR, state.currency)}</strong> per traveler</span>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-4 border-t text-center text-xs text-gray-400">
          <p>GlobeTrotter Travel Intelligence Platform • API Contract v1 Compliant</p>
        </div>
      </div>
    `;

    window.print();
  }

  static exportJSON() {
    const state = window.GlobeTrotterState.getState();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.tripPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `globetrotter_city${state.tripPlan.cityId}_trip_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  static copyShareableSummary() {
    const state = window.GlobeTrotterState.getState();
    const budget = window.GlobeTrotterPlanner.calculateTripBudget(state.tripPlan, state.currency);
    if (!budget) return;

    const city = budget.city;
    const hotel = budget.hotel;
    
    const summaryText = `🧳 My GlobeTrotter Trip Plan to ${city.name}, ${city.state}!\n\n` +
      `📅 Duration: ${budget.nights} Nights | 👥 Travelers: ${budget.travelers.total}\n` +
      `🏨 Stay: ${hotel.name} (${hotel.tier}) - ${window.GlobeTrotterPlanner.formatPrice(hotel.price_per_night, state.currency)}/night\n` +
      `🎯 Activities (${budget.lineItems.activities.count}): ${budget.lineItems.activities.items.map(a => a.name).join(', ')}\n` +
      `💰 Est. Total Budget: ${window.GlobeTrotterPlanner.formatPrice(budget.totals.grandTotalINR, state.currency)} (${window.GlobeTrotterPlanner.formatPrice(budget.totals.perPersonINR, state.currency)} per person)\n\n` +
      `API Contract v1 Verified.`;

    navigator.clipboard.writeText(summaryText).then(() => {
      if (window.GlobeTrotterApp) {
        window.GlobeTrotterApp.showToast('📋 Trip summary copied to clipboard!', 'success');
      }
    }).catch(err => {
      console.warn('Clipboard write failed:', err);
    });
  }
}

window.GlobeTrotterExport = GlobeTrotterExport;
