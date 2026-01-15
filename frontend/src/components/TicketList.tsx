import React from 'react';
import { Ticket } from '../services/apiService';

interface TicketListProps {
  tickets: Ticket[];
}

const TicketList: React.FC<TicketListProps> = ({ tickets }) => {
  return (
    <section className="tickets-section">
      <h2>Available Tickets</h2>
      <div className="tickets-list">
        {tickets.map((ticket) => (
          <div key={ticket.tier} className="ticket-card">
            <h3>{ticket.tier}</h3>
            <p>Price: ${ticket.price}</p>
            <p>Total: {ticket.total}</p>
            <p>Booked: {ticket.booked}</p>
            <p>Available: {ticket.available}</p>
            <div className="availability-bar">
              <div
                className="booked-bar"
                style={{ width: `${(ticket.booked / ticket.total) * 100}%` }}
              ></div>
              <div
                className="available-bar"
                style={{ width: `${(ticket.available / ticket.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TicketList;
