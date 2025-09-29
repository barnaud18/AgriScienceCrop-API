# AgriScienceCrop Backend API

Backend for AgriScienceCrop application - Intelligent Crop Management Platform for Brazilian agriculture.

## System Architecture

![AgriScience BR - System Architecture](./agriscience.jpeg)

*Complete system architecture diagram showing the integration between Frontend, Backend, External APIs, and Database components.*

## System Architecture

### Backend Architecture

The server uses Express.js with TypeScript in ESM format, structured as a RESTful API. Authentication is handled via JWT tokens with bcrypt for password hashing. The application follows a clean separation between route handlers, business logic, and data access layers.

**Key architectural decisions:**
- **Express.js with TypeScript**: Provides robust server framework with type safety
- **JWT Authentication**: Stateless authentication suitable for API-first design
- **PostgreSQL + Drizzle ORM**: Reliable relational database with type-safe operations
- **RESTful API design**: Standard HTTP methods for predictable client-server communication
- **WebSocket integration**: Real-time updates for monitoring and alerts

### Data Storage Solutions

The application uses Drizzle ORM configured for PostgreSQL. The schema defines main entities: users (farmers/agronomists), crops, management protocols, recommendations, productivity calculations, and geospatial analyses.

**Key architectural decisions:**
- **Drizzle ORM**: Type-safe database operations with excellent TypeScript integration
- **PostgreSQL**: Reliable relational database suitable for structured agricultural data
- **Zod validation**: Runtime type validation for API requests using schema definitions

### Authentication and Authorization

The system implements role-based access control with two user types: farmers and agronomists. Premium features are gated behind a subscription model. JWT tokens provide stateless authentication, and middleware protects sensitive routes.

**Key architectural decisions:**
- **Role-based access**: Different features for farmers vs agronomists
- **Premium subscription model**: Advanced features require paid access
- **JWT tokens**: Scalable authentication without server-side sessions

## 🚀 Technologies

- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** + **Drizzle ORM**
- **JWT Authentication** + **bcrypt**
- **WebSocket** for real-time updates
- **Docker** + **Docker Compose**
- **Swagger UI** for API documentation
- **IBGE APIs** for productivity data

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

## 🐳 Docker Execution (Recommended)

### 1. Initial Setup

```bash
# Copy environment file
cp env.example .env

# Edit environment variables as needed
# DATABASE_URL, JWT_SECRET, etc.
```

### 2. Run with Docker Compose

```bash
# Start all services (PostgreSQL + Backend + Redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Useful Commands

```bash
# Rebuild and restart
docker-compose up -d --build

# Check container status
docker-compose ps

# Execute commands in container
docker-compose exec backend npm run db:push
docker-compose exec postgres psql -U agriscience -d agriscience
```

## 💻 Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

```bash
# Configure environment variables
cp env.example .env

# Run migrations
npm run db:push
```

### 3. Run in Development

```bash
# Development mode
npm run dev

# Build and run
npm run build
npm start
```

## 🗄️ Database

### Main Structure

- **Users** - Users (farmers and agronomists)
- **Crops** - Available crops
- **ManagementProtocols** - Management protocols
- **Recommendations** - Personalized recommendations
- **ProductivityCalculations** - Productivity calculations
- **GeospatialAnalysis** - Geospatial analyses (premium)
- **CropFields** - Crop fields
- **MonitoringData** - Monitoring data
- **Alerts** - Alert system

### Database Commands

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Direct push (development)
npm run db:push
```

## API Integrations

### Core Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get authenticated user data

#### Crops and Protocols
- `GET /api/crops` - Available crops list
- `GET /api/protocols` - Management protocols list

#### Recommendations Engine
- `GET /api/recommendations` - User recommendations
- `POST /api/recommendations` - Create new recommendation
- `POST /api/recommendations/generate` - Generate automatic recommendations

#### Productivity Calculations
- `POST /api/productivity/calculate` - Calculate productivity using IBGE data
- `GET /api/productivity/calculations` - User calculation history

#### Monitoring and Alerts
- `GET /api/monitoring/fields` - User crop fields
- `POST /api/monitoring/data` - Sensor data input
- `GET /api/monitoring/alerts` - User alerts

#### Real-time Features
- `WS /ws` - WebSocket connection for real-time updates

### External Services

#### IBGE Statistical API
- Fetches official Brazilian agricultural productivity data for calculations
- Integration with Brazilian Institute of Geography and Statistics
- Real-time data for productivity estimates

#### Database Integration
- PostgreSQL with Drizzle ORM for structured data
- Redis for caching and session management
- Connection pooling and optimization

## 📚 API Documentation

### Swagger UI

Complete API documentation is available through Swagger UI:

**URL:** http://localhost:3000/api-docs

#### Documentation Features

- ✅ **Interactive Interface**: Test endpoints directly in the browser
- ✅ **JWT Authentication**: Integrated authentication system
- ✅ **Complete Schemas**: Detailed definitions of all data models
- ✅ **Examples**: Request and response examples
- ✅ **Validation**: Validation specifications for all fields

#### How to Use

1. **Access documentation**: http://localhost:3000/api-docs
2. **Explore endpoints**: Navigate through categories in the left panel
3. **Test APIs**: Click "Try it out" to test any endpoint
4. **Authenticate**: Use "Authorize" button for protected endpoints

For more details, see the [SWAGGER_DOCS.md](./SWAGGER_DOCS.md) file.

## 🏥 Health Check

```bash
# Check application health
curl http://localhost:3000/health

# Or using the script
npm run health
```

## 📊 Monitoring

### Logs
```bash
# Real-time logs
docker-compose logs -f backend

# Specific logs
docker-compose logs -f postgres
```

### Metrics
- Health check endpoint: `/health`
- Application uptime and status
- Database connection status

## 🔒 Security

- JWT for authentication
- Password hashing with bcrypt
- Configurable CORS
- Data validation with Zod
- Non-root user in container

## 🚀 Deployment

### Production with Docker

```bash
# Build image
docker build -t agriscience-backend:latest .

# Run container
docker run -d \
  --name agriscience-backend \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  agriscience-backend:latest
```

### Production Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secure-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

## External Dependencies

### Key Libraries
- **Backend**: Express.js, Drizzle ORM, JWT, bcrypt, Zod validation
- **Database**: PostgreSQL with connection pooling
- **Documentation**: Swagger UI with OpenAPI 3.0 specification
- **Development**: TypeScript, ESBuild for production builds
- **Containerization**: Docker with multi-stage builds

### Third-party Services
- **PostgreSQL**: Primary database for structured data storage
- **Redis**: Caching and session management
- **IBGE API**: Brazilian Institute of Geography and Statistics for official crop productivity data
- **Docker Hub**: Container images for deployment

### Development Tools
- **TypeScript**: Full type safety across the application
- **Drizzle ORM**: Type-safe database operations with migrations
- **Swagger**: Automatic API documentation generation
- **ESBuild**: Fast compilation for production builds

## 📝 Available Scripts

```bash
npm run dev              # Development server
npm run build            # Production build
npm start                # Start application
npm run health           # Health check endpoint
npm run db:generate      # Generate database migrations
npm run db:migrate       # Apply database migrations
npm run db:push          # Push schema changes (development)
npm run docker:build     # Build Docker image
npm run docker:compose:up    # Start with Docker Compose
```

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Containerized Deployment

The application is designed for containerized deployment with Docker support and follows modern web development practices for maintainability and scalability.

### Docker Features
- **Multi-stage builds**: Optimized production images
- **Non-root user**: Enhanced security
- **Health checks**: Automatic service monitoring
- **Volume persistence**: Data persistence across restarts
- **Network isolation**: Secure service communication

### Production Ready
- Environment-based configuration
- Automated database initialization
- Redis caching integration
- Swagger documentation included
- Comprehensive logging and monitoring

## 📄 License

MIT License - see LICENSE file for details.
