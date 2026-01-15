import React, { useState, useEffect, Suspense } from 'react';
import './App.css';

interface Ticket {
  tier: 'VIP' | 'FrontRow' | 'GA';
  price: number;
  available: number;
  total: number;
  booked: number;
}

interface Booking {
  id: string;
  userId: string;
  tier: 'VIP' | 'FrontRow' | 'GA';
  quantity: number;
  totalPrice: number;
  timestamp: string;
  userName?: string;
  email?: string;
  phone?: string;
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userId, setUserId] = useState('user1');
  const [tier, setTier] = useState<'VIP' | 'FrontRow' | 'GA'>('GA');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentHoldId, setCurrentHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);

  // Additional realistic fields
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchBookings();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('http://localhost:3001/tickets');
      const data: Ticket[] = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:3001/bookings');
      const data: Booking[] = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const clearForm = () => {
    setUserName('');
    setEmail('');
    setPhone('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setTermsAccepted(false);
    setQuantity(1);
    setTier('GA');
  };

  const handleHoldTickets = async () => {
    // Basic validation
    if (!userName || !email || !phone || !termsAccepted) {
      setMessage('Please fill in all required fields and accept terms.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/hold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, tier, quantity }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        data = { error: 'Server returned invalid response' };
      }

      if (response.ok) {
        setCurrentHoldId(data.hold.id);
        setHoldExpiresAt(new Date(data.expiresAt));
        setMessage(`Tickets held for 5 minutes! Please complete payment. Hold ID: ${data.hold.id}`);
      } else {
        setMessage(data.error || 'Error holding tickets');
      }
    } catch (error) {
      console.error('Error holding tickets:', error);
      setMessage('Error holding tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!currentHoldId) {
      setMessage('No tickets held for booking.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          holdId: currentHoldId,
          userName,
          email,
          phone
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        data = { error: 'Server returned invalid response' };
      }

      if (response.ok) {
        setMessage(`Booking confirmed! Ticket: ${tier} x${quantity}, Total: $${data.booking.totalPrice}, Booking ID: ${data.booking.id}`);
        setCurrentHoldId(null);
        setHoldExpiresAt(null);
        clearForm();
        fetchTickets();
        fetchBookings();
      } else {
        setMessage(data.error || 'Error confirming booking');
        // Clear hold on failure
        setCurrentHoldId(null);
        setHoldExpiresAt(null);
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      setMessage('Error confirming booking');
      setCurrentHoldId(null);
      setHoldExpiresAt(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = async () => {
    // If we have a hold, confirm it
    if (currentHoldId) {
      await handleConfirmBooking();
      return;
    }

    // Otherwise, use direct booking (for demo purposes)
    if (!userName || !email || !phone || !cardNumber || !expiryDate || !cvv || !termsAccepted) {
      setMessage('Please fill in all required fields and accept terms.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, tier, quantity, userName, email, phone }),
      });
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        data = { error: 'Server returned invalid response' };
      }
      if (response.ok) {
        setMessage(`Booking successful! Ticket: ${tier} x${quantity}, Total: $${data.booking.totalPrice}, Booking ID: ${data.booking.id}`);
        clearForm();
        fetchTickets();
        fetchBookings();
      } else {
        setMessage(data.error || 'Error booking tickets');
      }
    } catch (error) {
      console.error('Error booking:', error);
      setMessage('Error booking tickets');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="event-header">
        <h1>The Rolling Stones - World Tour 2024</h1>
        <p><strong>Date:</strong> December 15, 2024 | <strong>Venue:</strong> Madison Square Garden, New York</p>
        <p>Experience the legendary rock band live! Don't miss this once-in-a-lifetime concert.</p>
      </header>

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

      <section className="booking-section">
        <h2>Book Your Tickets</h2>
        <form className="booking-form" onSubmit={(e) => { e.preventDefault(); handleBook(); }}>
          <div className="form-group">
            <label>Ticket Tier:</label>
            <select value={tier} onChange={(e) => setTier(e.target.value as 'VIP' | 'FrontRow' | 'GA')}>
              <option value="VIP">VIP</option>
              <option value="FrontRow">Front Row</option>
              <option value="GA">General Admission</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantity:</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" max="10" />
          </div>

          <div className="form-group">
            <label>Full Name:</label>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Phone Number:</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <fieldset className="payment-section">
            <legend>Payment Information</legend>
            <div className="form-group">
              <label>Card Number:</label>
              <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))} maxLength={16} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date (MM/YY):</label>
                <input type="text" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} placeholder="MM/YY" maxLength={5} required />
              </div>
              <div className="form-group">
                <label>CVV:</label>
                <input type="text" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} maxLength={3} required />
              </div>
            </div>
          </fieldset>

          <div className="form-group checkbox">
            <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
            <label htmlFor="terms">I agree to the terms and conditions and privacy policy</label>
          </div>

          <button type="submit" disabled={isLoading} className="book-button">
            {isLoading ? 'Processing...' : currentHoldId ? 'Complete Payment' : 'Book Tickets'}
          </button>
        </form>
      </section>

      {bookings.length > 0 && (
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
      )}

      {message && <div className={`message ${message.includes('Error') || message.includes('Please') ? 'error' : 'success'}`}>{message}</div>}
    </div>
  );
}

export default App;
