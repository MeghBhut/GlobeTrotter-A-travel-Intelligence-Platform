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
    this.currentUser = null; // Stored user is unverified until validated via GET /api/me
    this.isLiveBackend = false;

    this.initMockDatabase();
  }

  isAuthenticated() {
    return !!this.token && !!this.currentUser;
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
          visibility: "public",
          status: "upcoming",
          owner: { id: 1, name: "Demo Traveler" },
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

    // Mock Signup (offline mode)
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

    // Mock Login (offline mode)
    const name = email.split('@')[0];
    const user = { id: 1, name: name.charAt(0).toUpperCase() + name.slice(1), email };
    const token = 'mock_jwt_token_' + Date.now();
    this.token = token;
    this.currentUser = user;
    localStorage.setItem(this.TOKEN_STORAGE_KEY, token);
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    return { token, user };
  }

  /**
   * Validate token against GET /api/me.
   * If invalid, expired, or backend rejects (401), clears token and stored user.
   */
  async getMe() {
    if (!this.token) {
      this.logout();
      return null;
    }

    if (this.isLiveBackend) {
      try {
        const res = await fetch(`${this.BASE_URL}/api/me`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (res.ok) {
          this.currentUser = await res.json();
          localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this.currentUser));
          return this.currentUser;
        } else {
          // Token is invalid/expired (e.g. 401 Unauthorized) -> clear immediately
          this.logout();
          return null;
        }
      } catch (e) {
        console.warn('Backend getMe network error:', e);
        this.logout();
        return null;
      }
    } else {
      // In offline / mock mode: if a mock user was stored, load it, otherwise null
      const stored = localStorage.getItem(this.USER_STORAGE_KEY);
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
          return this.currentUser;
        } catch (e) {
          this.logout();
          return null;
        }
      }
      this.logout();
      return null;
    }
  }

  /**
   * Clear both auth token and stored user
   */
  logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    localStorage.removeItem(this.USER_STORAGE_KEY);
  }

  // ==================== 3. TRIPS ====================

  async getTrips(status = '') {
    if (this.isLiveBackend && this.token) {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      const res = await fetch(`${this.BASE_URL}/api/trips${query}`, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
      if (res.status === 401) {
        this.logout();
        throw new Error('Unauthorized');
      }
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    return status ? mockTrips.filter(t => (t.status || this.computeMockTripStatus(t)) === status) : mockTrips;
  }

  computeMockTripStatus(trip) {
    const today = new Date().toISOString().split('T')[0];
    if (!trip.start_date || trip.start_date > today) return "upcoming";
    if (trip.end_date && trip.end_date < today) return "completed";
    return "ongoing";
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
          end_date: tripData.end_date || null,
          daily_meal_estimate: tripData.daily_meal_estimate || 0,
          visibility: tripData.visibility || (tripData.is_public ? "public" : "private")
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
      visibility: tripData.visibility || (tripData.is_public ? "public" : "private"),
      status: "upcoming",
      owner: this.currentUser ? { id: this.currentUser.id, name: this.currentUser.name } : { id: 1, name: "Demo Traveler" },
      daily_meal_estimate: tripData.daily_meal_estimate || 0,
      share_slug: (tripData.visibility === "public" || tripData.is_public) ? 'trip-' + Math.random().toString(36).substring(2, 8) : null,
      cover_photo_url: null,
      destination_count: 0,
      stops: [],
      legs: []
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

    if (updateData.visibility) {
      updateData.is_public = updateData.visibility === "public";
    }
    if ((updateData.is_public || updateData.visibility === "public") && !mockTrips[tripIndex].share_slug) {
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
      hotel: stopData.hotel_id ? HOTELS_DATA.find(h => h.id === parseInt(stopData.hotel_id)) || null : null,
      activities: []
      , hotels: []
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

  async addStopHotel(stopId, { hotel_id, nights = null }) {
    const numStopId = parseInt(stopId);
    const numHotelId = parseInt(hotel_id);
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/stops/${numStopId}/hotels`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ hotel_id: numHotelId, nights })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to add hotel');
      return data;
    }

    const hotelRef = HOTELS_DATA.find(h => h.id === numHotelId);
    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    let created = null;
    mockTrips.forEach(trip => (trip.stops || []).forEach(stop => {
      if (stop.id === numStopId) {
        stop.hotels = stop.hotels || [];
        created = {
          id: Date.now(),
          hotel_id: numHotelId,
          name: hotelRef?.name || "Hotel",
          tier: hotelRef?.tier || "",
          price_per_night: hotelRef?.price_per_night || 0,
          nights: nights || 1
        };
        stop.hotels = [created];
      }
    }));
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(mockTrips));
    return created;
  }

  async addTripLeg(tripId, legData) {
    const numTripId = parseInt(tripId);
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/trips/${numTripId}/legs`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(legData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to add travel leg');
      return data;
    }

    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const trip = mockTrips.find(t => t.id === numTripId);
    if (!trip) throw new Error('Trip not found');
    const fromCity = CITIES_DATA.find(c => c.id === parseInt(legData.from_city_id));
    const toCity = CITIES_DATA.find(c => c.id === parseInt(legData.to_city_id));
    const leg = {
      id: Date.now(),
      from_city: fromCity,
      to_city: toCity,
      mode: legData.mode || "train",
      cost: parseInt(legData.cost) || 0,
      depart_date: legData.depart_date || null,
      duration_hours: parseInt(legData.duration_hours) || null,
      order_index: trip.legs ? trip.legs.length : 0
    };
    trip.legs = trip.legs || [];
    trip.legs.push(leg);
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(mockTrips));
    return leg;
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

  // ==================== 8. FRIENDS, COMMUNITY & CLONE ====================

  async searchUsers(q = '') {
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/users/search?q=${encodeURIComponent(q)}`, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
      const data = await res.json();
      throw new Error(data.detail || 'User search failed');
    }
    return [
      { id: 2, name: "Alice", email: "alice@example.com" },
      { id: 3, name: "Bob", email: "bob@example.com" }
    ].filter(u => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));
  }

  async getFriends() {
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/friends`, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
    }
    return JSON.parse(localStorage.getItem('globetrotter_mock_friends_v1') || '[]');
  }

  async getFriendRequests() {
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/friends/requests`, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
    }
    return JSON.parse(localStorage.getItem('globetrotter_mock_friend_requests_v1') || '[]');
  }

  async sendFriendRequest(userId) {
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/friends/request`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ user_id: parseInt(userId) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Friend request failed');
      return data;
    }
    return { id: Date.now(), user: { id: parseInt(userId), name: "Demo User" }, status: "pending", direction: "outgoing" };
  }

  async acceptFriendRequest(friendshipId) {
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/friends/${parseInt(friendshipId)}/accept`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Accept request failed');
      return data;
    }
    return null;
  }

  async deleteFriendship(friendshipId) {
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/friends/${parseInt(friendshipId)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!res.ok && res.status !== 204) throw new Error('Unable to update friendship');
      return;
    }
  }

  async getUserTrips(userId) {
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/users/${parseInt(userId)}/trips`, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
      const data = await res.json();
      throw new Error(data.detail || 'Unable to load user trips');
    }
    return JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]').filter(t => t.visibility !== "private");
  }

  async getCommunityTrips(limit = 30, offset = 0) {
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/community/trips?limit=${limit}&offset=${offset}`, { headers: this.getAuthHeaders() });
      if (res.ok) return await res.json();
      const data = await res.json();
      throw new Error(data.detail || 'Unable to load community trips');
    }
    return JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]')
      .filter(t => (t.visibility || (t.is_public ? "public" : "private")) === "public");
  }

  async cloneTrip(tripId) {
    const numId = parseInt(tripId);
    if (this.isLiveBackend && this.token) {
      const res = await fetch(`${this.BASE_URL}/api/trips/${numId}/clone`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Unable to clone trip');
      return data;
    }
    const mockTrips = JSON.parse(localStorage.getItem(this.MOCK_TRIPS_KEY) || '[]');
    const source = mockTrips.find(t => t.id === numId);
    if (!source) throw new Error('Trip not found');
    const clone = JSON.parse(JSON.stringify(source));
    clone.id = Date.now();
    clone.name = `Copy of ${source.name}`;
    clone.visibility = "private";
    clone.is_public = false;
    clone.share_slug = null;
    clone.owner = this.currentUser ? { id: this.currentUser.id, name: this.currentUser.name } : source.owner;
    mockTrips.unshift(clone);
    localStorage.setItem(this.MOCK_TRIPS_KEY, JSON.stringify(mockTrips));
    return { id: clone.id, name: clone.name, message: "Trip cloned to your account" };
  }
}

// Global API instance
window.GlobeTrotterAPI = new GlobeTrotterAPI();
