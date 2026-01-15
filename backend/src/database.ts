import { Mutex } from 'async-mutex';

export type TicketTier = 'VIP' | 'FrontRow' | 'GA';

export interface Ticket {
  tier: TicketTier;
  price: number;
  available: number;
  total: number;
  booked: number;
}

export interface Booking {
  id: string;
  userId: string;
  tier: TicketTier;
  quantity: number;
  totalPrice: number;
  timestamp: Date;
  userName?: string;
  email?: string;
  phone?: string;
}

export interface TicketHold {
  id: string;
  userId: string;
  tier: TicketTier;
  quantity: number;
  expiresAt: Date;
}

export class Database {
  private tickets: Map<TicketTier, Ticket> = new Map();
  private bookings: Booking[] = [];
  private holds: TicketHold[] = [];
  private mutex: Mutex = new Mutex();
  private holdTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Initialize tickets with total capacity
    this.tickets.set('VIP', { tier: 'VIP', price: 100, available: 100, total: 100, booked: 0 });
    this.tickets.set('FrontRow', { tier: 'FrontRow', price: 50, available: 200, total: 200, booked: 0 });
    this.tickets.set('GA', { tier: 'GA', price: 10, available: 500, total: 500, booked: 0 });

    // Clean expired holds every minute
    setInterval(() => this.clearExpiredHolds(), 60000);
  }

  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }

  async holdTickets(userId: string, tier: TicketTier, quantity: number): Promise<TicketHold | null> {
    return this.mutex.runExclusive(async () => {
      const ticket = this.tickets.get(tier);
      if (!ticket || ticket.available < quantity) {
        return null; // Not enough tickets
      }

      // Create hold
      const hold: TicketHold = {
        id: `${userId}-${tier}-hold-${Date.now()}`,
        userId,
        tier,
        quantity,
        expiresAt: new Date(Date.now() + this.holdTimeout),
      };

      this.holds.push(hold);

      // Temporarily reduce availability
      ticket.available -= quantity;

      return hold;
    });
  }

  async confirmBooking(holdId: string, userName?: string, email?: string, phone?: string): Promise<Booking | null> {
    return this.mutex.runExclusive(async () => {
      const hold = this.holds.find(h => h.id === holdId);
      if (!hold) {
        return null; // Hold not found or expired
      }

      const ticket = this.tickets.get(hold.tier);
      if (!ticket) {
        return null;
      }

      // Check if hold is still valid
      if (hold.expiresAt < new Date()) {
        // Hold expired, restore availability
        ticket.available += hold.quantity;
        this.holds = this.holds.filter(h => h.id !== holdId);
        return null;
      }

      // Remove hold
      this.holds = this.holds.filter(h => h.id !== holdId);

      // Update booked count
      ticket.booked += hold.quantity;

      // Create booking
      const booking: Booking = {
        id: `${hold.userId}-${hold.tier}-${Date.now()}`,
        userId: hold.userId,
        tier: hold.tier,
        quantity: hold.quantity,
        totalPrice: ticket.price * hold.quantity,
        timestamp: new Date(),
      };

      if (userName) booking.userName = userName;
      if (email) booking.email = email;
      if (phone) booking.phone = phone;

      this.bookings.push(booking);
      return booking;
    });
  }

  async getBookings(): Promise<Booking[]> {
    return this.bookings.slice(); // Return copy
  }

  private clearExpiredHolds(): void {
    const now = new Date();
    const expiredHolds = this.holds.filter(hold => hold.expiresAt < now);

    for (const hold of expiredHolds) {
      const ticket = this.tickets.get(hold.tier);
      if (ticket) {
        ticket.available += hold.quantity;
      }
    }

    this.holds = this.holds.filter(hold => hold.expiresAt >= now);
  }

  async bookTickets(userId: string, tier: TicketTier, quantity: number, userName?: string, email?: string): Promise<Booking | null> {
    return this.mutex.runExclusive(async () => {
      const ticket = this.tickets.get(tier);
      if (!ticket || ticket.available < quantity) {
        return null; // Not enough tickets
      }

      // Deduct availability and update booked
      ticket.available -= quantity;
      ticket.booked += quantity;

      // Create booking
      const booking: Booking = {
        id: `${userId}-${tier}-${Date.now()}`,
        userId,
        tier,
        quantity,
        totalPrice: ticket.price * quantity,
        timestamp: new Date(),
      };

      if (userName) booking.userName = userName;
      if (email) booking.email = email;

      this.bookings.push(booking);
      return booking;
    });
  }
}
