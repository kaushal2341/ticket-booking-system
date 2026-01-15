# Concert Ticket Booking System

A full-stack concert ticket booking application built with React (TypeScript) frontend and Node.js (TypeScript) backend.

## Features

- **Ticket Catalog**: View available tickets for VIP ($100), Front Row ($50), and General Admission ($10) tiers
- **Real-time Availability**: See current ticket quantities
- **Concurrent Booking**: Prevents double-booking with proper concurrency control
- **Payment Simulation**: Mock payment processing
- **Global Users**: Supports users from any location (USD pricing)

## Architecture

### Backend (Node.js + TypeScript)
- **Framework**: Express.js
- **Concurrency Control**: Async mutex locks for race condition prevention
- **Data Store**: In-memory database (for demonstration; production would use PostgreSQL)
- **API Endpoints**:
  - `GET /tickets`: Retrieve available tickets
  - `POST /book`: Book tickets with userId, tier, and quantity

### Frontend (React + TypeScript)
- **Framework**: React with TypeScript
- **State Management**: React hooks (useState, useEffect)
- **API Integration**: Fetch API for backend communication
- **UI**: Simple, functional interface for viewing and booking tickets

## Running the Application

### Prerequisites
- Node.js 14+ (backend runs on 14, frontend may require newer for full compatibility)
- npm

### Backend Setup
```bash
cd backend
npm install
npm run build
npm start
```
Server runs on http://localhost:3000

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
App runs on http://localhost:3000 (may conflict with backend, adjust port if needed)

## Technical Design Decisions and Trade-offs

### Concurrency and Double-Booking Prevention

**Implementation**: Used `async-mutex` library to create exclusive locks around the booking operation. The `bookTickets` method in the database class wraps the availability check and update in a mutex-protected critical section.

```typescript
async bookTickets(userId: string, tier: TicketTier, quantity: number): Promise<Booking | null> {
  return this.mutex.runExclusive(async () => {
    const ticket = this.tickets.get(tier);
    if (!ticket || ticket.available < quantity) {
      return null; // Not enough tickets
    }

    // Deduct availability
    ticket.available -= quantity;

    // Create booking
    const booking: Booking = {
      id: `${userId}-${tier}-${Date.now()}`,
      userId,
      tier,
      quantity,
      totalPrice: ticket.price * quantity,
      timestamp: new Date(),
    };

    this.bookings.push(booking);
    return booking;
  });
}
```

**Trade-offs**:
- **Pros**: Simple, guarantees atomicity for single-instance deployments
- **Cons**: Not scalable to multiple server instances (would need distributed locking like Redis)
- **Production Alternative**: Database transactions with `SELECT FOR UPDATE` in PostgreSQL

### Data Storage

**Implementation**: In-memory data structures (Map and Array) with no persistence.

**Trade-offs**:
- **Pros**: Simple, fast, no external dependencies for demo
- **Cons**: Data lost on restart, not suitable for production
- **Production Alternative**: PostgreSQL with ACID transactions

### Payment Processing

**Implementation**: Simulated success for all bookings.

**Trade-offs**:
- **Pros**: Simple for demonstration
- **Cons**: No real payment validation, security, or refund handling
- **Production Alternative**: Stripe, PayPal, or similar payment processor

### Frontend-Backend Communication

**Implementation**: Direct HTTP calls with fetch API.

**Trade-offs**:
- **Pros**: Simple, no additional libraries
- **Cons**: Manual error handling, no request caching
- **Production Alternative**: React Query or SWR for better UX

## Scalability Considerations

### Current Limitations
- Single server instance
- In-memory storage
- No caching
- Basic error handling

### Scaling to 1M DAU and 50K Concurrent Users

#### Availability (99.99% uptime)
- **Load Balancing**: Use AWS ALB or similar with multiple server instances
- **Auto-scaling**: Horizontal scaling based on CPU/memory metrics
- **Health Checks**: Implement comprehensive health endpoints
- **CDN**: CloudFront for static assets
- **Database**: PostgreSQL with read replicas

#### Performance (p95 < 500ms)
- **Caching**: Redis for ticket availability and user sessions
- **Database Optimization**: Connection pooling, query optimization
- **API Gateway**: Rate limiting and request throttling
- **Async Processing**: Queue payment processing and notifications
- **CDN**: Distribute static content globally

#### Distributed Concurrency Control
- Replace mutex with distributed locks (Redis Redlock algorithm)
- Database-level constraints and transactions
- Optimistic locking with retry logic

### Global User Support
- **Geolocation**: Detect user location for currency conversion (though requirement specifies USD)
- **CDN**: Global content delivery
- **Database**: Multi-region replication
- **Compliance**: GDPR, CCPA considerations for data handling

## Testing

### Backend Testing
```bash
cd backend
npm test  # Currently no tests implemented
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Manual Testing
1. Start backend and frontend
2. View available tickets
3. Attempt booking with different quantities
4. Test concurrent bookings (open multiple browser tabs)

## Future Improvements

- User authentication and session management
- Real payment integration
- Email/SMS notifications
- Seat selection UI
- Admin dashboard for event management
- Comprehensive test suite
- Monitoring and logging
- Containerization (Docker)
- CI/CD pipeline
