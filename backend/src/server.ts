import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getTickets, getBookings, holdTickets, confirmBooking, bookTickets } from './controllers/ticketController.js';
import { cacheService } from './services/cacheService.js';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3003;

app.use(cors());
app.use(express.json());

app.get('/tickets', getTickets);
app.get('/bookings', getBookings);
app.post('/hold', holdTickets);
app.post('/confirm', confirmBooking);
app.post('/book', bookTickets);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
