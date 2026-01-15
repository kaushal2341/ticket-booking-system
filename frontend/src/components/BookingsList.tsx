import React from 'react';
import { Booking } from '../services/apiService';

interface BookingsListProps {
  bookings: Booking[];
}

const BookingsList: React.FC<BookingsListProps> = ({ bookings }) => {
  if (bookings.length === 0) return null;

  return (
    <section className="bookings-section">
      <h2>Recent Bookings</h2>
      <div className="bookings-list">
        {bookings.slice(-10).reverse().map((booking) => (
          <div key={booking.id} className="booking-card">
            <div className="booking-header">
              <h4>{booking.tier} Ticket</h4>
              <span className="booking-id">ID: {booking.id}</span>
            </div>
            <div className="booking-details">
              <p><strong>Quantity:</strong> {booking.quantity}</p>
              <p><strong>Total:</strong> ${booking.totalPrice}</p>
              {booking.userName && <p><strong>Name:</strong> {booking.userName}</p>}
              {booking.email && <p><strong>Email:</strong> {booking.email}</p>}
              <p><strong>Date:</strong> {new Date(booking.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BookingsList;
