# Trading Competition Dashboard

A web app where users can join trading competitions and compete against each other. Currently in MVP stage with basic user authentication and competition management.

## What's Inside

This is a full-stack application with:
- Spring Boot backend (Java 17)
- React frontend (TypeScript + Vite)
- PostgreSQL database (hosted on Supabase)

The backend handles user auth with JWT tokens and manages competitions. Frontend is a standard React SPA with some basic UI for browsing and joining competitions.

## Tech Stack

**Backend:**
- Spring Boot 3.x
- Spring Security + JWT authentication
- JPA/Hibernate for database
- PostgreSQL (Supabase)
- Maven

**Frontend:**
- React 19
- TypeScript
- Vite
- TailwindCSS
- Axios for API calls
- React Router

**Deployment:**
- AWS Lightsail (single instance)
- Nginx (reverse proxy + static file serving)
- Systemd for process management

## Getting Started Locally

### Backend

```bash
cd trading-mvp-backend
mvn spring-boot:run
```

Runs on `http://localhost:8080`

You'll need to update `application.yml` with your database credentials if you're not using the existing Supabase instance.

### Frontend

```bash
cd trading-mvp-frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

The frontend expects the backend to be running on port 8080. You can change this in `src/services/api.ts` if needed.

## Deployment

There's a deployment script that handles everything - sets up Java, Node, Nginx, builds both apps, and configures systemd services. 

Quick version:
1. Spin up an Ubuntu instance on Lightsail
2. Clone this repo
3. Run `./trading-mvp-backend/deployment/deploy.sh`
4. Fill in your database password and JWT secret
5. Done


## Current Features

- User registration and login
- Browse available competitions
- Join competitions (with entry fee and participant limits)
- View competitions you've joined

## How to Use

1. **Register an account**
   - Click "Register" on the landing page
   - Enter email, username, and password
   - Hit "Create Account"

2. **Login**
   - Use your email and password
   - You'll get redirected to the competitions page
   - Your JWT token gets stored in localStorage (stays valid for 24 hours)

3. **Browse competitions**
   - See all available competitions with their entry fees, prize pools, and participant counts
   - Check start/end dates and max participant limits
   - Filter or search through competitions (coming soon)

4. **Join a competition**
   - Click "Join Competition" on any competition card
   - System checks if you're already joined and if there's space available
   - Once joined, the button changes to show you're in

5. **Leave a competition**
   - Go to "My Competitions" page
   - Click "Leave Competition" if you change your mind
   - You can rejoin later if spots are still available

That's it for now. No actual trading yet - this is just the competition enrollment system.

## Development Notes

The backend uses Hibernate's `ddl-auto: update` for development, which auto-creates tables. 
CORS is currently open for localhost. Update `application.yml` before deploying to production.
JWT tokens expire after 24 hours. 
Frontend stores auth token in localStorage.

## API Endpoints

**Public:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/competitions` - List all competitions

**Protected (needs JWT):**
- `POST /api/competitions/{id}/join` - Join a competition



