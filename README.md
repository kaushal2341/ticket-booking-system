# Ticket Booking System

A full-stack ticket booking application with React frontend, Node.js/Express backend, TypeORM database integration, and Docker deployment.

## Features

### 🎫 Core Functionality
- **Ticket Management**: Three ticket tiers (VIP, Front Row, General Admission)
- **Real-time Availability**: Live ticket availability tracking with visual progress bars
- **Ticket Holding**: 5-minute hold system to reserve tickets before payment
- **Booking System**: Complete booking workflow with user details and payment simulation
- **Booking History**: View recent bookings with detailed information

### 🏗️ Architecture
- **TypeORM Integration**: Full ORM with entity relationships and database migrations
- **Auto Database Initialization**: Schema creation and data seeding on startup
- **RESTful API**: Clean API endpoints for ticket operations
- **Environment Configuration**: Configurable database connections (SQLite for dev, PostgreSQL for production)
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Full TypeScript implementation throughout

### 🚀 Performance & UX
- **Code Splitting**: Lazy loading for React components with Suspense
- **Responsive Design**: Mobile-friendly interface with modern CSS
- **Form Validation**: Client-side validation with user feedback
- **Loading States**: Proper loading indicators and async state management

### 🐳 Docker & Deployment
- **Containerized**: Multi-service Docker setup with PostgreSQL database
- **Orchestration**: Docker Compose for easy local development
- **Production Ready**: Nginx reverse proxy for frontend serving

## Tech Stack

- **Frontend**: React 18, TypeScript, CSS3, React Router
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: TypeORM with PostgreSQL (production) / SQLite (development)
- **Deployment**: Docker, Docker Compose, Nginx

## Quick Start

### Prerequisites
- Node.js 18+ (for local development)
- Docker and Docker Compose (for containerized deployment)

### Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd ticket-booking-app
```

2. **Start all services**
```bash
docker-compose up --build
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Local Development (Without Docker)

1. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Set up database** (choose one):
   - **SQLite** (default for development):
     - Database file will be created automatically at `backend/ticketbooking.db`
   - **PostgreSQL**:
     - Install PostgreSQL locally
     - Create database: `ticketbooking`
     - Update `backend/.env` with your PostgreSQL credentials

3. **Start services**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm start
```

## API Endpoints

### GET /tickets
Get available tickets information with pricing and availability.
```json
[
  {
    "tier": "VIP",
    "price": 100,
    "available": 95,
    "total": 100,
    "booked": 5
  }
]
```

### GET /bookings
Get all bookings (recent bookings shown in UI).
```json
[
  {
    "id": "uuid",
    "userId": "user123",
    "tier": "VIP",
    "quantity": 2,
    "totalPrice": 200,
    "timestamp": "2024-01-17T...",
    "userName": "John Doe",
    "email": "john@example.com"
  }
]
```

### POST /hold
Hold tickets temporarily (5 minutes expiry).
```json
{
  "userId": "user123",
  "tier": "VIP",
  "quantity": 2
}
```
Response:
```json
{
  "hold": { "id": "hold-uuid" },
  "expiresAt": "2024-01-17T..."
}
```

### POST /confirm
Confirm a held booking with user details.
```json
{
  "holdId": "hold-uuid",
  "userName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

### POST /book
Direct booking (bypasses hold system for demo).
```json
{
  "userId": "user123",
  "tier": "VIP",
  "quantity": 2,
  "userName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

## Database Schema

### Ticket Entity
- `tier`: Primary key (VIP|FrontRow|GA)
- `price`: Decimal pricing
- `available`: Current available count
- `total`: Total tickets for this tier
- `booked`: Number of booked tickets

### Booking Entity
- `id`: UUID primary key
- `userId`: User identifier
- `tier`: Ticket tier reference
- `quantity`: Number of tickets booked
- `totalPrice`: Calculated total price
- `timestamp`: Booking creation time
- `userName`, `email`, `phone`: Optional user details

### TicketHold Entity
- `id`: UUID primary key
- `userId`: User identifier
- `tier`: Ticket tier reference
- `quantity`: Number of tickets held
- `expiresAt`: Hold expiry timestamp
- `userIdTier`: Composite index for efficient lookups

## Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3003

# Database Configuration
DB_HOST=localhost          # 'postgres' for Docker, 'localhost' for local
DB_PORT=5432              # PostgreSQL port
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=ticketbooking
```

#### Frontend (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:3001
```

#### Docker Environment
Database configuration is handled automatically in `docker-compose.yml`:
- PostgreSQL container with persistent volume
- Backend connects to `postgres` service
- Database auto-initializes with sample data

## Project Structure

```
ticket-booking-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── ticketController.ts    # API route handlers
│   │   ├── entities/                  # TypeORM entities
│   │   │   ├── Ticket.ts             # Ticket tiers and pricing
│   │   │   ├── Booking.ts            # Completed bookings
│   │   │   └── TicketHold.ts         # Temporary holds
│   │   ├── dataSource.ts             # TypeORM configuration
│   │   ├── database.ts               # Database service & initialization
│   │   └── server.ts                 # Express server setup
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── TicketList.tsx        # Ticket availability display
│   │   │   ├── BookingForm.tsx       # Booking form with validation
│   │   │   ├── BookingsList.tsx      # Recent bookings list
│   │   │   └── Message.tsx           # Status messages
│   │   ├── services/
│   │   │   └── apiService.ts         # API communication
│   │   ├── App.tsx                   # Main application component
│   │   ├── index.tsx                 # React entry point
│   │   └── Loading.tsx               # Loading component
│   ├── public/
│   │   └── index.html
│   ├── Dockerfile
│   ├── nginx.conf                    # Nginx configuration
│   └── package.json
├── docker-compose.yml                # Multi-service orchestration
└── README.md
```

## Development

### Available Scripts

#### Backend
```bash
cd backend
npm run build    # Compile TypeScript
npm run start    # Start production server
npm run dev      # Start development server with auto-reload
```

#### Frontend
```bash
cd frontend
npm start        # Start development server
npm run build    # Create production build
```

### Database Management

- **Auto-initialization**: Database schema and sample data are created automatically on first run
- **Migrations**: TypeORM handles schema changes automatically with `synchronize: true`
- **Data Seeding**: Initial ticket data (VIP: 100, FrontRow: 200, GA: 500) is seeded on startup

### Code Quality

- **TypeScript**: Full type safety across frontend and backend
- **ESLint**: Code linting (if configured)
- **Prettier**: Code formatting (if configured)

## Deployment

### Docker Production Deployment

1. **Build and run**
```bash
docker-compose -f docker-compose.yml up --build -d
```

2. **Scale services** (optional)
```bash
docker-compose up --scale backend=3
```

### Manual Deployment

1. **Build frontend**
```bash
cd frontend
npm run build
```

2. **Build backend**
```bash
cd backend
npm run build
```

3. **Deploy to server**
   - Copy built files to server
   - Set up PostgreSQL database
   - Configure environment variables
   - Start services with process manager (PM2, systemd, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details
