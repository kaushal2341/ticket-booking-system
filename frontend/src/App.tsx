import React, { useState, useEffect } from 'react';
import './App.css';
import { apiService, Ticket, Booking } from './services/apiService';
import TicketList from './components/TicketList';
import BookingForm from './components/BookingForm';
import BookingsList from './components/BookingsList';
import Message from './components/Message';

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
      const data = await apiService.fetchTickets();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await apiService.fetchBookings();
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
      const data = await apiService.holdTickets(userId, tier, quantity);
      setCurrentHoldId(data.hold.id);
      setHoldExpiresAt(new Date(data.expiresAt));
      setMessage(`Tickets held for 5 minutes! Please complete payment. Hold ID: ${data.hold.id}`);
    } catch (error) {
      console.error('Error holding tickets:', error);
      setMessage(error instanceof Error ? error.message : 'Error holding tickets');
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
      const data = await apiService.confirmBooking(currentHoldId, userName, email, phone);
      setMessage(`Booking confirmed! Ticket: ${tier} x${quantity}, Total: $${data.booking.totalPrice}, Booking ID: ${data.booking.id}`);
      setCurrentHoldId(null);
      setHoldExpiresAt(null);
      clearForm();
      fetchTickets();
      fetchBookings();
    } catch (error) {
      console.error('Error confirming booking:', error);
      setMessage(error instanceof Error ? error.message : 'Error confirming booking');
      setCurrentHoldId(null);
      setHoldExpiresAt(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();

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
    setMessage('');

    try {
      const data = await apiService.bookTickets(userId, tier, quantity, userName, email, phone);
      setMessage(`Booking successful! Ticket: ${tier} x${quantity}, Total: $${data.booking.totalPrice}, Booking ID: ${data.booking.id}`);
      clearForm();
      fetchTickets();
      fetchBookings();
    } catch (error) {
      console.error('Error booking:', error);
      setMessage(error instanceof Error ? error.message : 'Error booking tickets');
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

      <TicketList tickets={tickets} />

      <BookingForm
        tier={tier}
        setTier={setTier}
        quantity={quantity}
        setQuantity={setQuantity}
        userName={userName}
        setUserName={setUserName}
        email={email}
        setEmail={setEmail}
        phone={phone}
        setPhone={setPhone}
        cardNumber={cardNumber}
        setCardNumber={setCardNumber}
        expiryDate={expiryDate}
        setExpiryDate={setExpiryDate}
        cvv={cvv}
        setCvv={setCvv}
        termsAccepted={termsAccepted}
        setTermsAccepted={setTermsAccepted}
        onSubmit={handleBook}
        isLoading={isLoading}
        currentHoldId={currentHoldId}
      />

      <BookingsList bookings={bookings} />

      <Message message={message} />
    </div>
  );
}

export default App;
