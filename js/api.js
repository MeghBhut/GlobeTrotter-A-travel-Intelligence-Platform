/**
 * GlobeTrotter API Client & Mock Adapter (API Contract v1)
 * Seamlessly interfaces with either http://localhost:8000 or the local mock engine.
 */

class GlobeTrotterAPI {
  constructor() {
    this.BASE_URL = 'http://localhost:8000';
    this.TOKEN_STORAGE_KEY = 'globetrotter_auth_token_v1';
    this.USER_STORAGE_KEY = 'globetrotter_auth_user_v1';
    this.MOCK_TRIPS_KEY = 'globetrotter_mock_trips_v1';
    
    this.token = localStorage.getItem(this.TOKEN_STORAGE_KEY) || 'mock_jwt_token_sample';
    this.currentUser = JSON.parse(localStorage.getItem(this.USER_STORAGE_KEY) || '{"id": 1, "name": "Megh", "email": "megh@example.com"}');
    
    // Auto-detect or default to mock mode
    this.isLiveBackend = false;
    this.initMockDatabase();
  }

  initMockDatabase() {
    if (!localStorage.getItem(this.MOCK_TRIPS_KEY)) {
      const initialMockTrips = [
        {
          id: 1,
          name: "Golden Triangle Explorer",
          description: "Delhi & Jaipur cultural heritage tour",
          start_date: "2026-09-01",
          end_date: "2026-09-07",
          num_people: 2,
          is_public: true,
          share_slug: "golden-triangle-789a",
          cover_photo_url: null,
          destination_count: 2,
          stops: [
            {
              id: 10,
              trip_id: 1,
              city: CITIES_DATA.find(c => c.id === 2),
              start_date: "2026-09-01",
              end_date: "2026-09-04",
              order_index: 0,
              hotel: HOTELS_DATA.find(h => h.id === 2003),
              activities: [
                { id: 55, activity_id: 201, name: "Red Fort & Chandni Chowk Rikshaw Tour", price_per_person: 350, num_people: 2 },
                { id: 56, activity_id: 207, name: "Old Delhi Food Tasting Experience", price_per_person: 600, num_people: 2 }
              ]
            },
            {
              id: 11,
              trip_id: 1,
              city: CITIES_DATA.find(c => c.id === 3),
              start_date: "2026-09-04",
              end_date: "2026-09-07",
              order_index: 1,
              hotel: HOTELS_DATA.find(h => h.id === 3004),
              activities: [
                { id: 57, activity_id: 301, name: "Amber Fort Guided Tour", price_per_person: 200, num_people: 2 },
                { id: 58, activity_id: 309, name: "Rajasthani Thali Cooking Class", price_per_person: 1200, num_people: 2 }
              ]
            }
          ]
        }
      ];
      localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(initialMockTrips));
    }
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : ''
    };
  }

  /**
   * Test backend connectivity
   */
  async checkBackendHealth() {
    try {
      const res = await fetch(`${this.BASE_URL}/api/cities`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      this.isLiveBackend = res.ok;
    } catch (e) {
      this.isLiveBackend = false;
    }
    return this.isLiveBackend;
  }

  // ==================== 1. REFERENCE DATA ====================

  async getCities(search = '', region = 'all') {
    if (this.isLiveBackend) {
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await fetch(`${this.BASE_URL}/api/cities${query}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend fetch failed, falling back to mock reference data');
      }
    }

    // Mock Reference Data
    return CITIES_DATA.filter(c => {
      if (region !== 'all' && c.region.toLowerCase() !== region.toLowerCase()) return false;
      if (search) {
        const s = search.toLowerCase();
        return c.name.toLowerCase().includes(s) || c.state.toLowerCase().includes(s);
      }
      return true;
    });
  }

  async getCityActivities(cityId) {
    const numCityId = parseInt(cityId);
    if (this.isLiveBackend) {
      try {
        const res = await fetch(`${this.BASE_URL}/api/cities/${numCityId}/activities`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend fetch failed, falling back to mock activities');
      }
    }

    return ACTIVITIES_DATA.filter(a => a.city_id === numCityId);
  }

  async getCityHotels(cityId) {
    const numCityId = parseInt(cityId);
    if (this.isLiveBackend) {
      try {
        const res = await fetch(`${this.BASE_URL}/api/cities/${numCityId}/hotels`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend fetch failed, falling back to mock hotels');
      }
    }

    return HOTELS_DATA.filter(h => h.city_id === numCityId);
  }

  // ==================== 2. AUTH ====================

  async signup(name, email, password) {
    if (this.isLiveBackend) {
      const res = await fetch(`${this.BASE_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed');
      this.token = data.token;
      this.currentUser = data.user;
      localStorage.setItem(this.TOKEN_STORAGE_KEY, this.token);
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this.currentUser));
      return data;
    }

    // Mock Signup
    const user = { id: Date.now(), name, email };
    const token = 'mock_jwt_token_' + Date.now();
    this.token = token;
    this.currentUser = user;
    localStorage.setItem(this.TOKEN_STORAGE_KEY, token);
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    return { token, user };
  }

  async login(email, password) {
    if (this.isLiveBackend) {
      const res = await fetch(`${this.BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      this.token = data.token;
      this.currentUser = data.user;
      localStorage.setItem(this.TOKEN_STORAGE_KEY, this.token);
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this.currentUser));
      return data;
    }

    // Mock Login
    const user = { id: 1, name: "Megh", email: email || "megh@example.com" };
    const token = 'mock_jwt_token_' + Date.now();
    this.token = token;
    this.currentUser = user;
    localStorage.setItem(this.TOKEN_STORAGE_KEY, token);
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    return { token, user };
  }

  async getMe() {
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/me`, { headers: this.getAuthHeaders() });
      if (res.ok) {
        this.currentUser = await res.json();
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this.currentUser));
        return this.currentUser;
      }
    }
    return this.currentUser;
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    localStorage.removeItem(this.USER_STORAGE_KEY);
  }

  // ==================== 3. TRIPS ====================

  async getTrips() {
    if (this.isLiveBackend) {
      const res = await fetch(`${this.BASE_URL}/api/trips`, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    return mockTrips;
  }

  async getTrip(tripId) {
    const numId = parseInt(tripId);
    if (this.isLiveBackend) {
      const res = await fetch(`${this.BASE_URL}/api/trips/${numId}`, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const trip = mockTrips.find(t => t.id === numId);
    if (!trip) throw new Error('Trip not found');
    return trip;
  }

  async createTrip(tripData) {
    if (this.isLiveBackend) {
      const res = await fetch(`${this.BASE_URL}/api/trips`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tripData)
      });
      if (res.ok) return await res.json();
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const newTrip = {
      id: Date.now(),
      name: tripData.name || "My Indian Adventure",
      description: tripData.description || "",
      start_date: tripData.start_date || new Date().toISOString().split('T')[0],
      end_date: tripData.end_date || new Date(Date.now() + 3*86400000).toISOString().split('T')[0],
      num_people: tripData.num_people || 2,
      is_public: tripData.is_public || false,
      share_slug: 'trip-' + Math.random().toString(36).substring(2, 8),
      cover_photo_url: null,
      destination_count: 0,
      stops: []
    };

    mockTrips.unshift(newTrip);
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(mockTrips));
    return newTrip;
  }

  async updateTrip(tripId, updateData) {
    const numId = parseInt(tripId);
    if (this.isLiveBackend) {
      const res = await fetch(`${this.BASE_URL}/api/trips/${numId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      if (res.ok) return await res.json();
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const tripIndex = mockTrips.findIndex(t => t.id === numId);
    if (tripIndex === -1) throw new Error('Trip not found');

    mockTrips[tripIndex] = { ...mockTrips[tripIndex], ...updateData };
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(mockTrips));
    return mockTrips[tripIndex];
  }

  async deleteTrip(tripId) {
    const numId = parseInt(tripId);
    if (this.isLiveBackend) {
      await fetch(`${this.BASE_URL}/api/trips/${numId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      return;
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const filtered = mockTrips.filter(t => t.id !== numId);
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(filtered));
  }

  // ==================== 4. STOPS ====================

  async addStop(tripId, stopData) {
    const numTripId = parseInt(tripId);
    const city = CITIES_DATA.find(c => c.id === parseInt(stopData.city_id));
    const hotel = stopData.hotel_id ? HOTELS_DATA.find(h => h.id === parseInt(stopData.hotel_id)) : null;

    if (this.isLiveBackend) {
      const res = await fetch(`${this.BASE_URL}/api/trips/${numTripId}/stops`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(stopData)
      });
      if (res.ok) return await res.json();
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const trip = mockTrips.find(t => t.id === numTripId);
    if (!trip) throw new Error('Trip not found');

    const newStop = {
      id: Date.now(),
      trip_id: numTripId,
      city: city || { id: stopData.city_id, name: "City" },
      start_date: stopData.start_date,
      end_date: stopData.end_date,
      order_index: trip.stops ? trip.stops.length : 0,
      hotel: hotel || null,
      activities: []
    };

    if (!trip.stops) trip.stops = [];
    trip.stops.push(newStop);
    trip.destination_count = trip.stops.length;
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(mockTrips));
    return newStop;
  }

  async deleteStop(stopId) {
    const numStopId = parseInt(stopId);
    if (this.isLiveBackend) {
      await fetch(`${this.BASE_URL}/api/stops/${numStopId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      return;
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    mockTrips.forEach(trip => {
      if (trip.stops) {
        trip.stops = trip.stops.filter(s => s.id !== numStopId);
        trip.destination_count = trip.stops.length;
      }
    });
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(mockTrips));
  }

  // ==================== 5. ACTIVITIES IN STOPS ====================

  async addStopActivity(stopId, { activity_id, num_people = 2 }) {
    const numStopId = parseInt(stopId);
    const numActId = parseInt(activity_id);
    const activityRef = ACTIVITIES_DATA.find(a => a.id === numActId);

    if (this.isLiveBackend) {
      const res = await fetch(`${this.BASE_URL}/api/stops/${numStopId}/activities`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ activity_id: numActId, num_people })
      });
      if (res.ok) return await res.json();
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    let createdActLine = null;

    mockTrips.forEach(trip => {
      if (trip.stops) {
        const stop = trip.stops.find(s => s.id === numStopId);
        if (stop) {
          if (!stop.activities) stop.activities = [];
          createdActLine = {
            id: Date.now(),
            activity_id: numActId,
            name: activityRef ? activityRef.name : "Activity",
            price_per_person: activityRef ? activityRef.price_per_person : 0,
            num_people: num_people
          };
          stop.activities.push(createdActLine);
        }
      }
    });

    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(mockTrips));
    return createdActLine;
  }

  async removeStopActivity(stopActivityId) {
    const numId = parseInt(stopActivityId);
    if (this.isLiveBackend) {
      await fetch(`${this.BASE_URL}/api/stop-activities/${numId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      return;
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    mockTrips.forEach(trip => {
      if (trip.stops) {
        trip.stops.forEach(stop => {
          if (stop.activities) {
            stop.activities = stop.activities.filter(a => a.id !== numId);
          }
        });
      }
    });
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(mockTrips));
  }

  // ==================== 6. BUDGET ====================

  async getTripBudget(tripId) {
    const numTripId = parseInt(tripId);
    if (this.isLiveBackend) {
      const res = await fetch(`${this.BASE_URL}/api/trips/${numTripId}/budget`, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
    }

    const trip = await this.getTrip(numTripId);
    let activitiesTotal = 0;
    let hotelsTotal = 0;
    const numPeople = trip.num_people || 2;

    if (trip.stops) {
      trip.stops.forEach(stop => {
        // Activities
        if (stop.activities) {
          stop.activities.forEach(a => {
            activitiesTotal += (a.price_per_person || 0) * (a.num_people || numPeople);
          });
        }
        // Hotels
        if (stop.hotel) {
          const nights = stop.start_date && stop.end_date ? Math.max(1, Math.round((new Date(stop.end_date) - new Date(stop.start_date)) / (1000 * 60 * 60 * 24))) : 3;
          hotelsTotal += (stop.hotel.price_per_night || 0) * nights * Math.ceil(numPeople / 2);
        }
      });
    }

    const mealsTotal = numPeople * 1000 * 3;
    const transportTotal = 600 * 3;
    const grandTotal = activitiesTotal + hotelsTotal + mealsTotal + transportTotal;

    return {
      trip_id: numTripId,
      currency: "INR",
      total: grandTotal,
      breakdown: {
        hotels: hotelsTotal,
        activities: activitiesTotal,
        meals: mealsTotal,
        transport: transportTotal
      },
      per_day: [
        { date: trip.start_date || "2026-09-01", amount: Math.round(grandTotal / 3) }
      ],
      average_per_day: Math.round(grandTotal / 3)
    };
  }

  // ==================== 7. PUBLIC SHARE ====================

  async getPublicTrip(shareSlug) {
    if (this.isLiveBackend) {
      const res = await fetch(`${this.BASE_URL}/api/public/${shareSlug}`);
      if (res.ok) return await res.json();
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const trip = mockTrips.find(t => t.share_slug === shareSlug);
    if (!trip) throw new Error('Public trip not found');
    return trip;
  }
}

// Global API instance
window.GlobeTrotterAPI = new GlobeTrotterAPI();
