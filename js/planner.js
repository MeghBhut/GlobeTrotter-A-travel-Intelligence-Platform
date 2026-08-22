/**
 * GlobeTrotter Planner & Budget Engine (Conforming to API Contract v1)
 */

class GlobeTrotterPlanner {
  static calculateTripBudget(tripPlan, currencyCode = 'INR') {
    const stops = this.getBudgetStops(tripPlan);
    if (!stops.length) return null;

    const adults = Math.max(1, tripPlan.adults || 1);
    const children = Math.max(0, tripPlan.children || 0);
    const totalTravelers = adults + children;
    const roomsCount = Math.ceil(adults / 2);
    const foodRatePerPerson = tripPlan.dailyFoodBudgetPerPerson ?? 1000;
    const transportRatePerDay = tripPlan.dailyLocalTransport ?? 600;
    const currencyInfo = CURRENCIES[currencyCode] || CURRENCIES.INR;
    const rate = currencyInfo.rate;
    const symbol = currencyInfo.symbol;

    const stopBudgets = stops.map((stop, index) => this.calculateStopBudget(stop, {
      adults,
      children,
      totalTravelers,
      roomsCount,
      foodRatePerPerson,
      transportRatePerDay,
      includeTaxes: tripPlan.includeTaxes
    }, index)).filter(Boolean);

    if (!stopBudgets.length) return null;

    const accommodationTotalINR = stopBudgets.reduce((sum, stop) => sum + stop.lineItems.accommodation.totalINR, 0);
    const activitiesTotalINR = stopBudgets.reduce((sum, stop) => sum + stop.lineItems.activities.totalINR, 0);
    const foodTotalINR = stopBudgets.reduce((sum, stop) => sum + stop.lineItems.food.totalINR, 0);
    const transportTotalINR = stopBudgets.reduce((sum, stop) => sum + stop.lineItems.transport.totalINR, 0);
    const taxesTotalINR = stopBudgets.reduce((sum, stop) => sum + stop.lineItems.taxes.totalINR, 0);
    const subtotalINR = accommodationTotalINR + activitiesTotalINR + foodTotalINR + transportTotalINR;
    const grandTotalINR = subtotalINR + taxesTotalINR;
    const perPersonTotalINR = Math.round(grandTotalINR / totalTravelers);
    const nights = stopBudgets.reduce((sum, stop) => sum + stop.nights, 0);
    const activityLineItems = stopBudgets.flatMap(stop => stop.lineItems.activities.items.map(item => ({
      ...item,
      cityName: stop.city.name,
      stopIndex: stop.stopIndex
    })));
    const primaryStop = stopBudgets[tripPlan.activeStopIndex || 0] || stopBudgets[0];

    return {
      city: primaryStop.city,
      hotel: primaryStop.hotel,
      stops: stopBudgets,
      roomsCount,
      nights,
      travelers: {
        adults,
        children,
        total: totalTravelers
      },
      lineItems: {
        accommodation: {
          ratePerNightINR: primaryStop.hotel ? primaryStop.hotel.price_per_night : 0,
          totalINR: accommodationTotalINR,
          convertedTotal: Math.round(accommodationTotalINR * rate),
          percentage: subtotalINR > 0 ? Math.round((accommodationTotalINR / subtotalINR) * 100) : 0
        },
        activities: {
          items: activityLineItems,
          totalINR: activitiesTotalINR,
          convertedTotal: Math.round(activitiesTotalINR * rate),
          count: activityLineItems.length,
          freeCount: activityLineItems.filter(a => a.isFree).length,
          percentage: subtotalINR > 0 ? Math.round((activitiesTotalINR / subtotalINR) * 100) : 0
        },
        food: {
          ratePerPersonPerDayINR: foodRatePerPerson,
          totalINR: foodTotalINR,
          convertedTotal: Math.round(foodTotalINR * rate),
          percentage: subtotalINR > 0 ? Math.round((foodTotalINR / subtotalINR) * 100) : 0
        },
        transport: {
          ratePerDayINR: transportRatePerDay,
          totalINR: transportTotalINR,
          convertedTotal: Math.round(transportTotalINR * rate),
          percentage: subtotalINR > 0 ? Math.round((transportTotalINR / subtotalINR) * 100) : 0
        },
        taxes: {
          applied: tripPlan.includeTaxes,
          effectiveRate: Math.round(stopBudgets.reduce((sum, stop) => sum + stop.lineItems.taxes.effectiveRate, 0) / stopBudgets.length) || 0,
          totalINR: taxesTotalINR,
          convertedTotal: Math.round(taxesTotalINR * rate)
        }
      },
      totals: {
        subtotalINR,
        grandTotalINR,
        perPersonINR: perPersonTotalINR,
        convertedGrandTotal: Math.round(grandTotalINR * rate),
        convertedPerPerson: Math.round(perPersonTotalINR * rate),
        currencyCode,
        currencySymbol: symbol
      }
    };
  }

  static getBudgetStops(tripPlan) {
    if (Array.isArray(tripPlan.stops) && tripPlan.stops.length) {
      return tripPlan.stops.map(stop => ({
        cityId: stop.cityId || stop.city?.id || tripPlan.cityId,
        hotelId: stop.hotelId || stop.hotel?.id || tripPlan.hotelId,
        activityIds: stop.activityIds || (stop.activities || []).map(a => a.activity_id || a.id),
        nights: stop.nights || this.getNights(stop.start_date, stop.end_date) || tripPlan.nights || 1,
        start_date: stop.start_date,
        end_date: stop.end_date,
        daySchedule: stop.daySchedule || {}
      }));
    }
    return [{
      cityId: tripPlan.cityId,
      hotelId: tripPlan.hotelId,
      activityIds: tripPlan.activityIds || [],
      nights: tripPlan.nights || 1,
      start_date: tripPlan.start_date,
      end_date: tripPlan.end_date,
      daySchedule: tripPlan.daySchedule || {}
    }];
  }

  static getNights(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    return Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000));
  }

  static calculateStopBudget(stop, tripMeta, index = 0) {
    const cityId = parseInt(stop.cityId);
    const city = CITIES_DATA.find(c => c.id === cityId);
    if (!city) return null;

    const cityHotels = HOTELS_DATA.filter(h => h.city_id === cityId);
    const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === cityId);

    const nights = Math.max(1, stop.nights || 1);
    const totalTravelers = tripMeta.totalTravelers;
    const roomsCount = tripMeta.roomsCount;

    // 1. Hotel Cost
    const selectedHotel = cityHotels.find(h => h.id === parseInt(stop.hotelId)) || cityHotels[0];
    const nightlyHotelRate = selectedHotel ? selectedHotel.price_per_night : 0;
    const accommodationTotalINR = nightlyHotelRate * nights * roomsCount;

    // 2. Activities Cost
    const selectedActivities = cityActs.filter(a => (stop.activityIds || []).map(Number).includes(a.id));
    const activityLineItems = selectedActivities.map(act => {
      const lineCost = act.price_per_person * totalTravelers;
      return {
        id: act.id,
        name: act.name,
        category: act.category,
        pricePerPersonINR: act.price_per_person,
        totalCostINR: lineCost,
        isFree: act.price_per_person === 0
      };
    });

    const activitiesTotalINR = activityLineItems.reduce((acc, item) => acc + item.totalCostINR, 0);

    // 3. Daily Food Allowance
    const foodRatePerPerson = tripMeta.foodRatePerPerson;
    const foodTotalINR = foodRatePerPerson * totalTravelers * nights;

    // 4. Daily Local Transport
    const transportRatePerDay = tripMeta.transportRatePerDay;
    const transportTotalINR = transportRatePerDay * nights;

    // Subtotal
    const subtotalINR = accommodationTotalINR + activitiesTotalINR + foodTotalINR + transportTotalINR;

    // 5. Taxes (18% for luxury hotel stays >= 7500, 12% standard)
    let taxRate = 0;
    if (tripMeta.includeTaxes) {
      if (nightlyHotelRate >= 7500) {
        taxRate = 0.18;
      } else if (nightlyHotelRate > 1000) {
        taxRate = 0.12;
      } else {
        taxRate = 0.05;
      }
    }
    const taxesTotalINR = tripMeta.includeTaxes ? Math.round(accommodationTotalINR * taxRate) : 0;

    // Grand Totals
    const grandTotalINR = subtotalINR + taxesTotalINR;
    const perPersonTotalINR = Math.round(grandTotalINR / totalTravelers);

    return {
      city,
      hotel: selectedHotel,
      stopIndex: index,
      start_date: stop.start_date,
      end_date: stop.end_date,
      daySchedule: stop.daySchedule,
      roomsCount,
      nights,
      travelers: {
        adults: tripMeta.adults,
        children: tripMeta.children,
        total: totalTravelers
      },
      lineItems: {
        accommodation: {
          ratePerNightINR: nightlyHotelRate,
          totalINR: accommodationTotalINR,
          convertedTotal: accommodationTotalINR,
          percentage: subtotalINR > 0 ? Math.round((accommodationTotalINR / subtotalINR) * 100) : 0
        },
        activities: {
          items: activityLineItems,
          totalINR: activitiesTotalINR,
          convertedTotal: activitiesTotalINR,
          count: selectedActivities.length,
          freeCount: selectedActivities.filter(a => a.price_per_person === 0).length,
          percentage: subtotalINR > 0 ? Math.round((activitiesTotalINR / subtotalINR) * 100) : 0
        },
        food: {
          ratePerPersonPerDayINR: foodRatePerPerson,
          totalINR: foodTotalINR,
          convertedTotal: foodTotalINR,
          percentage: subtotalINR > 0 ? Math.round((foodTotalINR / subtotalINR) * 100) : 0
        },
        transport: {
          ratePerDayINR: transportRatePerDay,
          totalINR: transportTotalINR,
          convertedTotal: transportTotalINR,
          percentage: subtotalINR > 0 ? Math.round((transportTotalINR / subtotalINR) * 100) : 0
        },
        taxes: {
          applied: tripMeta.includeTaxes,
          effectiveRate: Math.round(taxRate * 100),
          totalINR: taxesTotalINR,
          convertedTotal: taxesTotalINR
        }
      },
      totals: {
        subtotalINR,
        grandTotalINR,
        perPersonINR: perPersonTotalINR,
        convertedGrandTotal: grandTotalINR,
        convertedPerPerson: perPersonTotalINR
      }
    };
  }

  static formatPrice(amountINR, currencyCode = 'INR') {
    const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;
    const converted = Math.round(amountINR * currency.rate);

    if (currencyCode === 'INR') {
      return '₹' + converted.toLocaleString('en-IN');
    }
    return currency.symbol + converted.toLocaleString('en-US');
  }

  static getBudgetInsights(calculatedBudget) {
    const insights = [];
    const city = calculatedBudget.city;
    const hotel = calculatedBudget.hotel;
    const hotelPct = calculatedBudget.lineItems.accommodation.percentage;
    const activities = calculatedBudget.lineItems.activities.items;

    const cityHotels = HOTELS_DATA.filter(h => h.city_id === city.id);
    const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === city.id);

    if (hotelPct > 65) {
      const cheaperHotel = cityHotels.find(h => h.price_per_night < hotel.price_per_night * 0.6);
      if (cheaperHotel) {
        insights.push({
          type: 'warning',
          icon: 'trending-down',
          title: 'High Accommodation Overhead',
          message: `Hotels account for ${hotelPct}% of your total cost. Switching to ${cheaperHotel.name} (${cheaperHotel.tier}) could save you up to ${this.formatPrice((hotel.price_per_night - cheaperHotel.price_per_night) * calculatedBudget.nights * calculatedBudget.roomsCount, calculatedBudget.totals.currencyCode)}.`,
          actionHotelId: cheaperHotel.id
        });
      }
    }

    const unselectedFree = cityActs.filter(a => a.price_per_person === 0 && !activities.some(sel => sel.id === a.id));
    if (unselectedFree.length > 0) {
      insights.push({
        type: 'tip',
        icon: 'sparkles',
        title: 'Free Iconic Experiences Available',
        message: `You haven't added "${unselectedFree[0].name}" yet. It costs ₹0 and has top reviews!`,
        actionActivityId: unselectedFree[0].id
      });
    }

    if (hotelPct >= 30 && hotelPct <= 55 && activities.length >= 3) {
      insights.push({
        type: 'success',
        icon: 'check-circle',
        title: 'Optimal Budget Balance',
        message: `Your trip has a great balance between accommodation, tours, and local dining.`
      });
    }

    return insights;
  }

  static compareDestinations(cityIds, nights = 3, travelers = 2) {
    return cityIds.map(id => {
      const numId = parseInt(id);
      const city = CITIES_DATA.find(c => c.id === numId);
      if (!city) return null;

      const hotels = HOTELS_DATA.filter(h => h.city_id === numId);
      const acts = ACTIVITIES_DATA.filter(a => a.city_id === numId);

      const lowestHotel = hotels[0] || { price_per_night: 0 };
      const highestHotel = hotels[hotels.length - 1] || { price_per_night: 0 };
      const avgHotel = hotels.length ? Math.round(hotels.reduce((sum, h) => sum + h.price_per_night, 0) / hotels.length) : 0;
      
      const freeActivities = acts.filter(a => a.price_per_person === 0).length;

      const budgetSample = this.calculateTripBudget({
        cityId: numId,
        hotelId: lowestHotel.id,
        activityIds: acts.slice(0, 4).map(a => a.id),
        nights,
        adults: travelers,
        children: 0,
        includeTaxes: false,
        dailyFoodBudgetPerPerson: 600,
        dailyLocalTransport: 400
      });

      const luxurySample = this.calculateTripBudget({
        cityId: numId,
        hotelId: highestHotel.id,
        activityIds: acts.filter(a => a.highlight).map(a => a.id),
        nights,
        adults: travelers,
        children: 0,
        includeTaxes: true,
        dailyFoodBudgetPerPerson: 3000,
        dailyLocalTransport: 2500
      });

      return {
        id: city.id,
        name: city.name,
        state: city.state,
        region: city.region,
        tagline: city.tagline,
        heroImage: city.heroImage,
        tags: city.tags,
        bestTime: city.bestTime,
        stats: {
          lowestHotelPrice: lowestHotel.price_per_night,
          highestHotelPrice: highestHotel.price_per_night,
          averageHotelPrice: avgHotel,
          freeActivitiesCount: freeActivities,
          totalActivitiesCount: acts.length,
          sampleBackpackerTotal: budgetSample ? budgetSample.totals.grandTotalINR : 0,
          sampleLuxuryTotal: luxurySample ? luxurySample.totals.grandTotalINR : 0
        }
      };
    }).filter(Boolean);
  }
}

window.GlobeTrotterPlanner = GlobeTrotterPlanner;
