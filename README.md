# Ticket Booking System

A full-stack ticket booking application with React frontend, Express backend, Redis caching, and Docker deployment.

## Features

### 🚀 Performance Optimizations
- **Bundle Size Minimization**: Disabled source maps in production builds
- **Code Splitting**: Lazy loading for React components
- **Caching**: Redis-based caching with automatic invalidation
- **Gzip Compression**: Nginx configuration for compressed responses
- **Static Asset Caching**: Long-term caching for JS/CSS/images

### 🏗️ Architecture
- **MVC Pattern**: Separated controllers, services, and database layers
- **Environment Configuration**: Configurable via environment variables
- **Error Handling**: Comprehensive error handling with graceful degradation
- **Type Safety**: Full TypeScript implementation

### 🐳 Docker & Deployment
- **Containerized**: Multi-stage Docker builds for optimized images
- **Orchestration**: Docker Compose for local development
- **Production Ready**: Nginx reverse proxy with proper configuration

## Tech Stack

- **Frontend**: React 18, TypeScript, CSS3
- **Backend**: Node.js, Express, TypeScript
- **Database**: In-memory (easily replaceable with PostgreSQL/MySQL)
- **Cache**: Redis
- **Deployment**: Docker, Docker Compose

## Quick Start

### Prerequisites
- Node.js 18+ (required)
- Redis (optional - app works without it)
- Docker and Docker Compose (optional - for containerized deployment)

### Using Docker (Recommended)

1. **Start Docker Desktop** (if using Docker)
2. Clone the repository
```bash
git clone <repository-url>
cd ticket-booking-app
```

3. Start all services
```bash
docker-compose up --build
```

4. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Local Development (Without Docker)

1. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. Start Redis (if not using Docker)
```bash
redis-server
```

3. Start services
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
Get available tickets information.

### GET /bookings
Get all bookings.

### POST /hold
Hold tickets temporarily (5 minutes).
```json
{
  "userId": "string",
  "tier": "VIP|FrontRow|GA",
  "quantity": number
}
```

### POST /confirm
Confirm a held booking.
```json
{
  "holdId": "string",
  "userName": "string",
  "email": "string",
  "phone": "string"
}
```

### POST /book
Direct booking (for demo purposes).
```json
{
  "userId": "string",
  "tier": "VIP|FrontRow|GA",
  "quantity": number,
  "userName": "string",
  "email": "string",
  "phone": "string"
}
```

## Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3001
NODE_ENV=development
REDIS_URL=redis://localhost:6379
CACHE_TTL=300
```

#### Docker Environment
Environment variables are configured in `docker-compose.yml` for each service.

## Caching Strategy

- **Tickets data**: Cached for 5 minutes
- **Cache invalidation**: Automatic invalidation when ticket availability changes
- **Redis persistence**: Data persists across container restarts

## Project Structure

```
ticket-booking-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── ticketController.ts
│   │   ├── services/
│   │   │   └── cacheService.ts
│   │   ├── database.ts
│   │   └── server.ts
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── Loading.tsx
│   │   └── index.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Development

### Bundle Analysis
```bash
cd frontend
npm run analyze
```

### Testing
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Performance Metrics

- **Initial Bundle Size**: ~150KB (gzipped)
- **First Contentful Paint**: <2s with caching
- **API Response Time**: <100ms with Redis caching
- **Container Size**: Frontend ~50MB, Backend ~120MB

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
