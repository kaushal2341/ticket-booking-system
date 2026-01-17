import { io, Socket } from 'socket.io-client';

export type TicketUpdateCallback = () => void;
export type BookingUpdateCallback = () => void;

class SocketService {
  private socket: Socket | null = null;
  private ticketUpdateCallback: TicketUpdateCallback | null = null;
  private bookingUpdateCallback: BookingUpdateCallback | null = null;

  connect(apiBaseUrl: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(apiBaseUrl);

    this.socket.on('connect', () => {
      console.log('Socket.IO connected successfully');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    this.socket.on('ticketsUpdated', () => {
      console.log('Tickets updated event received, triggering callback...');
      if (this.ticketUpdateCallback) {
        this.ticketUpdateCallback();
      }
    });

    this.socket.on('bookingsUpdated', () => {
      console.log('Bookings updated event received, triggering callback...');
      if (this.bookingUpdateCallback) {
        this.bookingUpdateCallback();
      }
    });

    console.log('Socket.IO client initialized');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket.IO disconnected');
    }
  }

  onTicketsUpdate(callback: TicketUpdateCallback) {
    this.ticketUpdateCallback = callback;
  }

  onBookingsUpdate(callback: BookingUpdateCallback) {
    this.bookingUpdateCallback = callback;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();

// Make this a module for TypeScript
export {};
