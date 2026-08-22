/**
 * GlobeTrotter API Client & Dual-Mode Adapter (API Contract v1 & v2)
 * Interfaces directly with FastAPI backend at http://localhost:8000 (when live)
 * or seamlessly falls back to persistent in-browser mock engine.
 */

class GlobeTrotterAPI {
  constructor() {
    this.BASE_URL = 'http://localhost:8000';
    this.TOKEN_STORAGE_KEY = 'globetrotter_auth_token_v1';
    this.USER_STORAGE_KEY = 'globetrotter_auth_user_v1';
    this.MOCK_TRIPS_KEY = 'globetrotter_mock_trips_v1';
    
    this.token = localStorage.getItem(this.TOKEN_STORAGE_KEY) || null;
    this.currentUser = this.loadStoredUser();
    this.isLiveBackend = false;

    this.initMockDatabase();
  }

  loadStoredUser() {
    try {
      const data = localStorage.getItem(this.USER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  isAuthenticated() {
    return !!this.token;
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
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Health check for backend
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

  async getCities(search = '') {
    if (this.isLiveBackend) {
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await fetch(`${this.BASE_URL}/api/cities${query}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend getCities failed, falling back to mock reference data');
      }
    }

    return CITIES_DATA.filter(c => {
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
        console.warn('Backend getCityActivities failed, using mock data');
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
        console.warn('Backend getCityHotels failed, using mock data');
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
      if (!res.ok) throw new Error(data.detail || 'Invalid email or password');
      this.token = data.token;
      this.currentUser = data.user;
      localStorage.setItem(this.TOKEN_STORAGE_KEY, this.token);
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this.currentUser));
      return data;
    }

    // Mock Login
    const name = email.split('@')[0];
    const user = { id: 1, name: name.charAt(0).toUpperCase() + name.slice(1), email };
    const token = 'mock_jwt_token_' + Date.now();
    this.token = token;
    this.currentUser = user;
    localStorage.setItem(this.TOKEN_STORAGE_KEY, token);
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    return { token, user };
  }

  async getMe() {
    if (this.isLiveBackend && this.token) {
      try {
        const res = await fetch(`${this.BASE_URL}/api/me`, { headers: this.getAuthHeaders() });
        if (res.ok) {
          this.currentUser = await res.json();
          localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this.currentUser));
          return this.currentUser;
        } else if (res.status === 401) {
          this.logout();
          return null;
        }
      } catch (e) {
        console.warn('Backend getMe failed');
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
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/trips`, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
      if (res.status === 401) throw new Error('Unauthorized');
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    return mockTrips;
  }

  async getTrip(tripId) {
    const numId = parseInt(tripId);
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/trips/${numId}`, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.detail || 'Trip not found');
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const trip = mockTrips.find(t => t.id === numId);
    if (!trip) throw new Error('Trip not found');
    return trip;
  }

  async createTrip(tripData) {
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/trips`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          name: tripData.name,
          description: tripData.description || "",
          start_date: tripData.start_date || null,
          end_date: tripData.end_date || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to create trip');
      return data;
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const newTrip = {
      id: Date.now(),
      name: tripData.name || "My Indian Adventure",
      description: tripData.description || "",
      start_date: tripData.start_date || new Date().toISOString().split('T')[0],
      end_date: tripData.end_date || new Date(Date.now() + 3*86400000).toISOString().split('T')[0],
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
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/trips/${numId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update trip');
      return data;
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const tripIndex = mockTrips.findIndex(t => t.id === numId);
    if (tripIndex === -1) throw new Error('Trip not found');

    if (updateData.is_public && !mockTrips[tripIndex].share_slug) {
      mockTrips[tripIndex].share_slug = 'trip-' + Math.random().toString(36).substring(2, 8);
    }

    mockTrips[tripIndex] = { ...mockTrips[tripIndex], ...updateData };
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(mockTrips));
    return mockTrips[tripIndex];
  }

  async deleteTrip(tripId) {
    const numId = parseInt(tripId);
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/trips/${numId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to delete trip');
      }
      return;
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const filtered = mockTrips.filter(t => t.id !== numId);
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(filtered));
  }

  // ==================== 4. STOPS ====================

  async addStop(tripId, stopData) {
    const numTripId = parseInt(tripId);
    const numCityId = parseInt(stopData.city_id);

    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/trips/${numTripId}/stops`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          city_id: numCityId,
          start_date: stopData.start_date || null,
          end_date: stopData.end_date || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to add stop');
      return data;
    }

    const city = CITIES_DATA.find(c => c.id === numCityId);
    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const trip = mockTrips.find(t => t.id === numTripId);
    if (!trip) throw new Error('Trip not found');

    const newStop = {
      id: Date.now(),
      city: city || { id: numCityId, name: "City", state: "", country: "India" },
      start_date: stopData.start_date || null,
      end_date: stopData.end_date || null,
      order_index: trip.stops ? trip.stops.length : 0,
      activities: []
    };

    if (!trip.stops) trip.stops = [];
    trip.stops.push(newStop);
    trip.destination_count = trip.stops.length;
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(mockTrips));
    return newStop;
  }

  async updateStop(stopId, updateData) {
    const numStopId = parseInt(stopId);
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/stops/${numStopId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update stop');
      return data;
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    let updatedStop = null;
    mockTrips.forEach(trip => {
      if (trip.stops) {
        const stop = trip.stops.find(s => s.id === numStopId);
        if (stop) {
          Object.assign(stop, updateData);
          updatedStop = stop;
        }
      }
    });
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(mockTrips));
    return updatedStop;
  }

  async deleteStop(stopId) {
    const numStopId = parseInt(stopId);
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/stops/${numStopId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to delete stop');
      }
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

  async addStopActivity(stopId, { activity_id, num_people = 1 }) {
    const numStopId = parseInt(stopId);
    const numActId = parseInt(activity_id);

    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/stops/${numStopId}/activities`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ activity_id: numActId, num_people })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to add activity');
      return data;
    }

    const activityRef = ACTIVITIES_DATA.find(a => a.id === numActId);
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
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/stop-activities/${numId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to remove activity');
      }
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
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/trips/${numTripId}/budget`, {
        headers: this.getAuthHeaders()
      });
      if (res.ok) return await res.json();
    }

    const trip = await this.getTrip(numTripId);
    let activitiesTotal = 0;
    const perDayMap = {};

    if (trip.stops) {
      trip.stops.forEach(stop => {
        let stopCost = 0;
        if (stop.activities) {
          stop.activities.forEach(a => {
            stopCost += (a.price_per_person || 0) * (a.num_people || 1);
          });
        }
        activitiesTotal += stopCost;

        if (stop.start_date && stop.end_date) {
          const d1 = new Date(stop.start_date);
          const d2 = new Date(stop.end_date);
          const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
          const share = Math.floor(stopCost / diffDays);
          for (let i = 0; i < diffDays; i++) {
            const curD = new Date(d1.getTime() + i * 86400000).toISOString().split('T')[0];
            perDayMap[curD] = (perDayMap[curD] || 0) + share;
          }
        }
      });
    }

    const perDayList = Object.keys(perDayMap).sort().map(d => ({ date: d, amount: perDayMap[d] }));
    const avgPerDay = perDayList.length ? Math.round(activitiesTotal / perDayList.length) : activitiesTotal;

    return {
      trip_id: numTripId,
      currency: "INR",
      total: activitiesTotal,
      breakdown: {
        activities: activitiesTotal,
        hotels: 0,
        transport: 0,
        meals: 0
      },
      per_day: perDayList,
      average_per_day: avgPerDay
    };
  }

  // ==================== 7. PUBLIC SHARE ====================

  async getPublicTrip(shareSlug) {
    if (this.isLiveBackend) {
      const res = await fetch(`${this.BASE_URL}/api/public/${shareSlug}`);
      if (res.ok) return await res.json();
      const data = await res.json();
      throw new Error(data.detail || 'Public trip not found');
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const trip = mockTrips.find(t => t.share_slug === shareSlug && t.is_public);
    if (!trip) throw new Error('Public trip not found or trip is not marked public');
    return trip;
  }
}

// Global API instance
window.GlobeTrotterAPI = new GlobeTrotterAPI();
