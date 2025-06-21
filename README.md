# Rehearsal Scheduler

A comprehensive web application for scheduling and managing band rehearsals, tracking attendance, and optimizing practice times.

## Features

- **User Management**: Create band profiles, invite members, and assign roles
- **Calendar & Scheduling**: Create events, track availability, and send invitations
- **Rehearsal Management**: Create agendas, track attendance, and manage notes
- **Notifications & Reminders**: Automated emails and alerts for upcoming rehearsals
- **Resource Management**: Coordinate venues, equipment, and shared resources
- **Integration**: Sync with personal calendars and access shared files
- **Analytics**: Track attendance patterns and optimize scheduling

## Technology Stack

### Frontend
- React.js with Next.js
- Material UI
- Redux Toolkit for state management
- FullCalendar for scheduling interface

### Backend
- Node.js with Express
- JWT authentication
- PostgreSQL database with Prisma ORM
- Redis for caching and real-time features

### DevOps
- Docker containerization
- GitHub Actions for CI/CD
- Vercel/AWS for hosting

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL
- Redis (optional for production)

### Installation

1. Clone the repository
```bash
git clone https://github.com/dxaginfo/dx-music-rehearsal-app.git
cd dx-music-rehearsal-app
```

2. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables
```bash
# In the server directory, create a .env file
cp .env.example .env

# In the client directory, create a .env.local file
cp .env.example .env.local

# Edit both files with your configuration
```

4. Set up the database
```bash
# In the server directory
npx prisma migrate dev
```

5. Start the development servers
```bash
# Start the backend server (from server directory)
npm run dev

# Start the frontend server (from client directory)
npm run dev
```

6. Visit `http://localhost:3000` in your browser

### Docker Setup

Alternatively, you can use Docker Compose:

```bash
docker-compose up -d
```

## Project Structure

```
├── client/                # Frontend React/Next.js application
│   ├── components/        # Reusable UI components
│   ├── pages/             # Next.js pages
│   ├── hooks/             # Custom React hooks
│   ├── styles/            # Global styles and theme
│   └── store/             # Redux store configuration
│
├── server/                # Backend Node.js/Express application
│   ├── controllers/       # Request handlers
│   ├── models/            # Data models and schema
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   └── prisma/            # Database schema and migrations
│
├── docker-compose.yml     # Docker configuration
└── README.md              # This file
```

## API Documentation

API documentation is available at `/api/docs` when running the development server.

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set up the environment variables
3. Deploy the frontend and serverless backend functions

### AWS Deployment
Detailed AWS deployment instructions are available in `DEPLOYMENT.md`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Calendar scheduling inspired by Google Calendar
- Authentication system based on industry best practices
- UI/UX design influenced by leading scheduling applications