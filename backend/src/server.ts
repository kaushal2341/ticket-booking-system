import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { getTickets, getBookings, holdTickets, confirmBooking, bookTickets, dbInitPromise } from './controllers/ticketController.js';

// Global type declaration for Socket.IO
declare global {
  var io: Server;
}

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3003;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? false  // Disable CORS for production (nginx will handle it)
      : true, // Allow all origins in development
    methods: ["GET", "POST"]
  }
});

// Make io available globally for emitting events
global.io = io;

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

// Socket.IO connection handling
io.on('connection', (socket: Socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Wait for database initialization before starting server
dbInitPromise.then(() => {
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch(error => {
  console.error('Failed to start server due to database initialization error:', error);
  process.exit(1);
});
