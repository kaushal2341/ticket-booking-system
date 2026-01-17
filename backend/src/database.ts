import { AppDataSource } from './dataSource.js';
import { Ticket } from './entities/Ticket.js';
import { Booking } from './entities/Booking.js';
import { TicketHold } from './entities/TicketHold.js';
import { EntityManager } from 'typeorm';
import type { TicketTier } from './entities/Ticket.js';

export type { TicketTier };

export interface TicketResponse {
  tier: TicketTier;
  price: number;
  available: number;
  total: number;
  booked: number;
}

export interface BookingResponse {
  id: string;
  userId: string;
  tier: TicketTier;
  quantity: number;
  totalPrice: number;
  timestamp: Date;
  userName?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
}

export interface TicketHoldResponse {
  id: string;
  userId: string;
  tier: TicketTier;
  quantity: number;
  expiresAt: Date;
}

export class Database {
  private holdTimeout = 5 * 60 * 1000; // 5 minutes
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Initialize database connection and data
    this.initPromise = this.initializeDatabase();
  }

  async init(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  private async initializeDatabase() {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('Database connection established');
        await this.seedInitialData();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async seedInitialData() {
    const ticketRepo = AppDataSource.getRepository(Ticket);

    // Check if data already exists
    const existingTickets = await ticketRepo.count();
    if (existingTickets > 0) {
      return; // Data already seeded
    }

    // Seed initial ticket data
    const tickets = [
      { tier: 'VIP' as TicketTier, price: 100, available: 100, total: 100, booked: 0 },
      { tier: 'FrontRow' as TicketTier, price: 50, available: 200, total: 200, booked: 0 },
      { tier: 'GA' as TicketTier, price: 10, available: 500, total: 500, booked: 0 },
    ];

    await ticketRepo.save(tickets);
    console.log('Initial ticket data seeded');

    // Start cleanup interval for expired holds
    setInterval(() => this.clearExpiredHolds(), 60000);
  }

  async getTickets(): Promise<TicketResponse[]> {
    const ticketRepo = AppDataSource.getRepository(Ticket);
    const tickets = await ticketRepo.find();
    return tickets.map((ticket: Ticket) => ({
      tier: ticket.tier,
      price: Number(ticket.price),
      available: ticket.available,
      total: ticket.total,
      booked: ticket.booked,
    }));
  }

  async holdTickets(userId: string, tier: TicketTier, quantity: number): Promise<TicketHoldResponse | null> {
    return await AppDataSource.transaction(async (manager: EntityManager) => {
      const ticketRepo = manager.getRepository(Ticket);
      const holdRepo = manager.getRepository(TicketHold);

      // Use optimistic locking with version column
      const ticket = await ticketRepo.findOne({ where: { tier } });
      if (!ticket || ticket.available < quantity) {
        return null;
      }

      // Update available count
      await ticketRepo.update(
        { tier, version: ticket.version },
        { available: ticket.available - quantity }
      );

      // Create hold
      const hold = new TicketHold();
      hold.userId = userId;
      hold.tier = tier;
      hold.quantity = quantity;
      hold.expiresAt = new Date(Date.now() + this.holdTimeout);
      hold.userIdTier = `${userId}-${tier}`;

      const savedHold = await holdRepo.save(hold);

      return {
        id: savedHold.id,
        userId: savedHold.userId,
        tier: savedHold.tier,
        quantity: savedHold.quantity,
        expiresAt: savedHold.expiresAt,
      };
    });
  }

  async confirmBooking(holdId: string, userName?: string, email?: string, phone?: string): Promise<BookingResponse | null> {
    return await AppDataSource.transaction(async (manager: EntityManager) => {
      const holdRepo = manager.getRepository(TicketHold);
      const bookingRepo = manager.getRepository(Booking);
      const ticketRepo = manager.getRepository(Ticket);

      const hold = await holdRepo.findOne({ where: { id: holdId } });
      if (!hold) {
        return null;
      }

      // Check if hold is expired
      if (hold.expiresAt < new Date()) {
        // Restore availability and delete expired hold
        await ticketRepo.increment({ tier: hold.tier }, 'available', hold.quantity);
        await holdRepo.delete({ id: holdId });
        return null;
      }

      // Get ticket for price calculation
      const ticket = await ticketRepo.findOne({ where: { tier: hold.tier } });
      if (!ticket) {
        return null;
      }

      // Update booked count
      await ticketRepo.increment({ tier: hold.tier }, 'booked', hold.quantity);

      // Delete the hold
      await holdRepo.delete({ id: holdId });

      // Create booking
      const booking = new Booking();
      booking.userId = hold.userId;
      booking.tier = hold.tier;
      booking.quantity = hold.quantity;
      booking.totalPrice = Number(ticket.price) * hold.quantity;
      if (userName) booking.userName = userName;
      if (email) booking.email = email;
      if (phone) booking.phone = phone;

      const savedBooking = await bookingRepo.save(booking);

      return {
        id: savedBooking.id,
        userId: savedBooking.userId,
        tier: savedBooking.tier,
        quantity: savedBooking.quantity,
        totalPrice: Number(savedBooking.totalPrice),
        timestamp: savedBooking.timestamp,
        userName: savedBooking.userName,
        email: savedBooking.email,
        phone: savedBooking.phone,
      };
    });
  }

  async getBookings(): Promise<BookingResponse[]> {
    const bookingRepo = AppDataSource.getRepository(Booking);
    const bookings = await bookingRepo.find();
    return bookings.map((booking: Booking) => ({
      id: booking.id,
      userId: booking.userId,
      tier: booking.tier,
      quantity: booking.quantity,
      totalPrice: Number(booking.totalPrice),
      timestamp: booking.timestamp,
      userName: booking.userName,
      email: booking.email,
      phone: booking.phone,
    }));
  }

  private async clearExpiredHolds(): Promise<void> {
    try {
      const holdRepo = AppDataSource.getRepository(TicketHold);
      const ticketRepo = AppDataSource.getRepository(Ticket);

      const expiredHolds = await holdRepo
        .createQueryBuilder('hold')
        .where('hold.expiresAt < :now', { now: new Date() })
        .getMany();

      for (const hold of expiredHolds) {
        // Restore availability
        await ticketRepo.increment({ tier: hold.tier }, 'available', hold.quantity);
      }

      // Delete expired holds
      await holdRepo
        .createQueryBuilder()
        .delete()
        .where('expiresAt < :now', { now: new Date() })
        .execute();

    } catch (error) {
      console.error('Error clearing expired holds:', error);
    }
  }

  async bookTickets(userId: string, tier: TicketTier, quantity: number, userName?: string, email?: string, phone?: string): Promise<BookingResponse | null> {
    return await AppDataSource.transaction(async (manager: EntityManager) => {
      const ticketRepo = manager.getRepository(Ticket);
      const bookingRepo = manager.getRepository(Booking);

      const ticket = await ticketRepo.findOne({ where: { tier } });
      if (!ticket || ticket.available < quantity) {
        return null;
      }

      // Update availability and booked count
      await ticketRepo.update(
        { tier, version: ticket.version },
        {
          available: ticket.available - quantity,
          booked: ticket.booked + quantity
        }
      );

      // Create booking
      const booking = new Booking();
      booking.userId = userId;
      booking.tier = tier;
      booking.quantity = quantity;
      booking.totalPrice = Number(ticket.price) * quantity;
      if (userName) booking.userName = userName;
      if (email) booking.email = email;
      if (phone) booking.phone = phone;

      const savedBooking = await bookingRepo.save(booking);

      return {
        id: savedBooking.id,
        userId: savedBooking.userId,
        tier: savedBooking.tier,
        quantity: savedBooking.quantity,
        totalPrice: Number(savedBooking.totalPrice),
        timestamp: savedBooking.timestamp,
        userName: savedBooking.userName,
        email: savedBooking.email,
        phone: savedBooking.phone,
      };
    });
  }
}
