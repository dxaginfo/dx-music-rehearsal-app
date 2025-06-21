# Rehearsal Scheduler

A comprehensive web application for music bands to efficiently schedule and manage rehearsals, track attendance, and optimize practice time.

## 🎵 Features

- **Rehearsal Management**: Create, update, and cancel rehearsal events
- **Availability Tracking**: Band members can indicate their availability for scheduled rehearsals
- **Smart Scheduling**: Automatically suggest optimal rehearsal times based on member availability
- **Attendance Recording**: Track who attends each rehearsal
- **Rehearsal Planning**: Create structured practice agendas with time allocations
- **Resource Management**: Track instruments, equipment, and venue availability
- **Real-time Notifications**: Instant updates for schedule changes
- **Mobile Responsive Design**: Works seamlessly on all devices

## 🚀 Tech Stack

### Frontend
- **Next.js**: React framework for server-rendered applications
- **Material UI**: Modern React UI library
- **Redux Toolkit**: State management
- **Socket.io-client**: Real-time client-server communication
- **FullCalendar**: Interactive calendar interface
- **Formik & Yup**: Form handling and validation

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Prisma**: Modern database ORM
- **PostgreSQL**: Relational database
- **Socket.io**: Real-time server-client communication
- **JSON Web Tokens (JWT)**: Authentication
- **Swagger**: API documentation

### DevOps
- **Docker & Docker Compose**: Containerization and orchestration
- **ESLint & Prettier**: Code quality and formatting

## 📋 Prerequisites

- Node.js (v14+)
- npm or yarn
- PostgreSQL
- Redis (optional, for production)

## 🛠️ Installation & Setup

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/dxaginfo/dx-music-rehearsal-app.git
   cd dx-music-rehearsal-app
   ```

2. **Setup environment variables**
   
   Copy the example environment files and update with your configurations:
   ```bash
   # For the server
   cp server/.env.example server/.env
   
   # For the client
   cp client/.env.example client/.env
   ```

3. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Initialize the database**
   ```bash
   # From the server directory
   npx prisma migrate dev
   ```

5. **Start the development servers**
   ```bash
   # Start the server (from server directory)
   npm run dev
   
   # Start the client (from client directory)
   npm run dev
   ```

### Using Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/dxaginfo/dx-music-rehearsal-app.git
   cd dx-music-rehearsal-app
   ```

2. **Setup environment variables**
   
   Copy the example environment files and update with your configurations (similar to local setup).

3. **Build and start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will build and start all services:
   - PostgreSQL database
   - Redis
   - Backend API server
   - Frontend client

## 📱 Usage

Once the application is running:

1. Create an account and log in
2. Create a band or join an existing one
3. Schedule rehearsals and invite band members
4. Manage rehearsal schedules, attendance, and resources
5. Plan rehearsal agendas with specific focuses and time allocations

## 📖 API Documentation

API documentation is automatically generated using Swagger.
- Access the API docs at: `http://localhost:5000/api/docs` when the server is running.

## 🧪 Testing

```bash
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- CORS configuration
- Helmet for security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- Project Link: [https://github.com/dxaginfo/dx-music-rehearsal-app](https://github.com/dxaginfo/dx-music-rehearsal-app)