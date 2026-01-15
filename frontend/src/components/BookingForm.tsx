import React from 'react';

interface BookingFormProps {
  tier: 'VIP' | 'FrontRow' | 'GA';
  setTier: (tier: 'VIP' | 'FrontRow' | 'GA') => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  userName: string;
  setUserName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  cardNumber: string;
  setCardNumber: (number: string) => void;
  expiryDate: string;
  setExpiryDate: (date: string) => void;
  cvv: string;
  setCvv: (cvv: string) => void;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  currentHoldId: string | null;
}

const BookingForm: React.FC<BookingFormProps> = ({
  tier,
  setTier,
  quantity,
  setQuantity,
  userName,
  setUserName,
  email,
  setEmail,
  phone,
  setPhone,
  cardNumber,
  setCardNumber,
  expiryDate,
  setExpiryDate,
  cvv,
  setCvv,
  termsAccepted,
  setTermsAccepted,
  onSubmit,
  isLoading,
  currentHoldId,
}) => {
  return (
    <section className="booking-section">
      <h2>Book Your Tickets</h2>
      <form className="booking-form" onSubmit={onSubmit}>
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
  );
};

export default BookingForm;
