import { DataSource } from 'typeorm';
import { Ticket } from './entities/Ticket.js';
import { Booking } from './entities/Booking.js';
import { TicketHold } from './entities/TicketHold.js';

// Use SQLite for local development, PostgreSQL for production/Docker
const isProduction = process.env.NODE_ENV === 'production';
const isDocker = process.env.DB_HOST === 'postgres';

export const AppDataSource = new DataSource({
  type: isProduction || isDocker ? 'postgres' : 'sqlite',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: isProduction || isDocker ? (process.env.DB_NAME || 'ticketbooking') : './ticketbooking.db',
  synchronize: true, // Auto-create tables and schema
  logging: process.env.NODE_ENV === 'development',
  entities: [Ticket, Booking, TicketHold],
  subscribers: [],
  migrations: [],
  // SQLite specific options
  ...(isProduction || isDocker ? {} : {
    database: './ticketbooking.db'
  })
});
