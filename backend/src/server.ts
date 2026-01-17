import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getTickets, getBookings, holdTickets, confirmBooking, bookTickets, dbInitPromise } from './controllers/ticketController.js';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/tickets', getTickets);
app.get('/bookings', getBookings);
app.post('/hold', holdTickets);
app.post('/confirm', confirmBooking);
app.post('/book', bookTickets);

// Wait for database initialization before starting server
dbInitPromise.then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch(error => {
  console.error('Failed to start server due to database initialization error:', error);
  process.exit(1);
});
