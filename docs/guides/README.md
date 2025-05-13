# User Guides

This directory contains user guides and documentation for setting up, running, and using the Spotted Game application.

## Quick Start Guide

### Prerequisites
- Docker Desktop installed
- Git installed
- Node.js (for local development)

### Setting Up the Application

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd Spotted-Game
   ```

2. Start the application:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## User Manual

### Getting Started
1. **Registration**
   - Navigate to the signup page
   - Enter your email and password
   - Verify your email address

2. **Logging In**
   - Go to the login page
   - Enter your credentials
   - Access your dashboard

3. **Creating a Game**
   - Click "Create Game" button
   - Select game settings
   - Share the game code with friends

4. **Joining a Game**
   - Click "Join Game" button
   - Enter the game code
   - Wait for the game to start

## Development Guide

### Local Development Setup
1. Frontend Development:
   ```bash
   cd frontend
   npm install
   npm start
   ```

2. Backend Development:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

### API Documentation
- Detailed API documentation can be found in [api.md](../../api.md)
- Endpoint descriptions and usage examples
- Authentication requirements
- Request/response formats

## Troubleshooting Guide
Common issues and their solutions are documented in [troubleshooting.md](./troubleshooting.md) 