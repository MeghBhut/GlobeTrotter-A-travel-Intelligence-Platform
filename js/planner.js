/**
 * GlobeTrotter Planner & Budget Engine (Conforming to API Contract v1)
 */

class GlobeTrotterPlanner {
  static calculateTripBudget(tripPlan, currencyCode = 'INR') {
    const cityId = parseInt(tripPlan.cityId);
    const city = CITIES_DATA.find(c => c.id === cityId);
    if (!city) return null;

    const cityHotels = HOTELS_DATA.filter(h => h.city_id === cityId);
    const cityActs = ACTIVITIES_DATA.filter(a => a.city_id === cityId);

    const nights = Math.max(1, tripPlan.nights || 1);
    const adults = Math.max(1, tripPlan.adults || 1);
    const children = Math.max(0, tripPlan.children || 0);
    const totalTravelers = adults + children;
    const roomsCount = Math.ceil(adults / 2);

    // 1. Hotel Cost
    const selectedHotel = cityHotels.find(h => h.id === parseInt(tripPlan.hotelId)) || cityHotels[0];
    const nightlyHotelRate = selectedHotel ? selectedHotel.price_per_night : 0;
    const accommodationTotalINR = nightlyHotelRate * nights * roomsCount;

    // 2. Activities Cost
    const selectedActivities = cityActs.filter(a => tripPlan.activityIds.map(Number).includes(a.id));
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
    const foodRatePerPerson = tripPlan.dailyFoodBudgetPerPerson ?? 1000;
    const foodTotalINR = foodRatePerPerson * totalTravelers * nights;

    // 4. Daily Local Transport
    const transportRatePerDay = tripPlan.dailyLocalTransport ?? 600;
    const transportTotalINR = transportRatePerDay * nights;

    // Subtotal
    const subtotalINR = accommodationTotalINR + activitiesTotalINR + foodTotalINR + transportTotalINR;

    // 5. Taxes (18% for luxury hotel stays >= 7500, 12% standard)
    let taxRate = 0;
    if (tripPlan.includeTaxes) {
      if (nightlyHotelRate >= 7500) {
        taxRate = 0.18;
      } else if (nightlyHotelRate > 1000) {
        taxRate = 0.12;
      } else {
        taxRate = 0.05;
      }
    }
    const taxesTotalINR = tripPlan.includeTaxes ? Math.round(accommodationTotalINR * taxRate) : 0;

    // Grand Totals
    const grandTotalINR = subtotalINR + taxesTotalINR;
    const perPersonTotalINR = Math.round(grandTotalINR / totalTravelers);

    // Currency Conversion
    const currencyInfo = CURRENCIES[currencyCode] || CURRENCIES.INR;
    const rate = currencyInfo.rate;
    const symbol = currencyInfo.symbol;

    return {
      city,
      hotel: selectedHotel,
      roomsCount,
      nights,
      travelers: {
        adults,
        children,
        total: totalTravelers
      },
      lineItems: {
        accommodation: {
          ratePerNightINR: nightlyHotelRate,
          totalINR: accommodationTotalINR,
          convertedTotal: Math.round(accommodationTotalINR * rate),
          percentage: subtotalINR > 0 ? Math.round((accommodationTotalINR / subtotalINR) * 100) : 0
        },
        activities: {
          items: activityLineItems,
          totalINR: activitiesTotalINR,
          convertedTotal: Math.round(activitiesTotalINR * rate),
          count: selectedActivities.length,
          freeCount: selectedActivities.filter(a => a.price_per_person === 0).length,
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
          effectiveRate: Math.round(taxRate * 100),
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
