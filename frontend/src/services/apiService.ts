const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3003';

export interface Ticket {
  tier: 'VIP' | 'FrontRow' | 'GA';
  price: number;
  available: number;
  total: number;
  booked: number;
}

export interface Booking {
  id: string;
  userId: string;
  tier: 'VIP' | 'FrontRow' | 'GA';
  quantity: number;
  totalPrice: number;
  timestamp: string;
  userName?: string;
  email?: string;
  phone?: string;
}

export interface HoldResponse {
  hold: {
    id: string;
  };
  expiresAt: string;
}

export interface BookingResponse {
  booking: Booking;
}

export const apiService = {
  async fetchTickets(): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE_URL}/tickets`);
    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }
    return response.json();
  },

  async fetchBookings(): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    return response.json();
  },

  async holdTickets(userId: string, tier: 'VIP' | 'FrontRow' | 'GA', quantity: number): Promise<HoldResponse> {
    const response = await fetch(`${API_BASE_URL}/hold`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, tier, quantity }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to hold tickets');
    }
    return response.json();
  },

  async confirmBooking(holdId: string, userName: string, email: string, phone: string): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE_URL}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        holdId,
        userName,
        email,
        phone
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to confirm booking');
    }
    return response.json();
  },

  async bookTickets(userId: string, tier: 'VIP' | 'FrontRow' | 'GA', quantity: number, userName: string, email: string, phone: string): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE_URL}/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, tier, quantity, userName, email, phone }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to book tickets');
    }
    return response.json();
  },
};
