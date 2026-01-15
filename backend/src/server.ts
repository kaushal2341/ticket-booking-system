import express from 'express';
import cors from 'cors';
import { Database } from './database.js';
import type { TicketTier } from './database.js';
import type { Request, Response } from 'express';

const app = express();
const port = 3001;
const db = new Database();

app.use(cors());
app.use(express.json());

app.get('/tickets', async (req: Request, res: Response) => {
  try {
    const tickets = await db.getTickets();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/bookings', async (req: Request, res: Response) => {
  try {
    const bookings = await db.getBookings();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/hold', async (req: Request, res: Response) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/confirm', async (req: Request, res: Response) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/book', async (req: Request, res: Response) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
