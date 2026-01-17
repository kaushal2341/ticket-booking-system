import type { Request, Response } from 'express';
import { Database } from '../database.js';
import type { TicketTier } from '../database.js';

const db = new Database();

// Ensure database is initialized before handling requests
export const dbInitPromise = db.init().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

export const getTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await db.getTickets();
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await db.getBookings();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const holdTickets = async (req: Request, res: Response) => {
  try {
    const { userId, tier, quantity }: { userId: string; tier: TicketTier; quantity: number } = req.body;

    if (!userId || !tier || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const hold = await db.holdTickets(userId, tier, quantity);
    if (!hold) {
      return res.status(409).json({ error: 'Not enough tickets available' });
    }

    res.json({ hold, expiresAt: hold.expiresAt });
  } catch (error) {
    console.error('Error holding tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const { holdId, userName, email, phone }: { holdId: string; userName?: string; email?: string; phone?: string } = req.body;

    if (!holdId) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const booking = await db.confirmBooking(holdId, userName, email, phone);
    if (!booking) {
      return res.status(409).json({ error: 'Hold expired or not found' });
    }

    res.json({ booking, paymentStatus: 'success' });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const bookTickets = async (req: Request, res: Response) => {
  try {
    const { userId, tier, quantity, userName, email, phone }: {
      userId: string;
      tier: TicketTier;
      quantity: number;
      userName?: string;
      email?: string;
      phone?: string;
    } = req.body;

    if (!userId || !tier || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Simulate payment success (always success for demo)
    const booking = await db.bookTickets(userId, tier, quantity, userName, email);
    if (!booking) {
      return res.status(409).json({ error: 'Not enough tickets available' });
    }

    res.json({ booking, paymentStatus: 'success' });
  } catch (error) {
    console.error('Error booking tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
