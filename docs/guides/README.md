# User Guides

This directory contains user guides and documentation for setting up, running, and using the Spotted Game application.

## Quick Start Guide

### Prerequisites
- Docker Desktop installed
- Git installed
- Node.js (for local development)
- MySQL (if running without Docker)

### Setting Up the Application

1. Clone the repository:
   ```bash
   git clone https://github.com/Spotted-SJSU/Spotted-Game.git
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
   - Enter your username and password
   - Create your account to start playing

2. **Logging In**
   - Go to the login page
   - Enter your credentials
   - Access the game interface

3. **Playing the Game**
   - Once logged in, you'll join the active game automatically
   - Find the hidden flag in the background image as quickly as possible
   - Click or tap where you think the flag is hidden
   - Score points based on accuracy and speed
   - Chat with other players using the integrated chat system

4. **Game Cycle**
   - 20 seconds of gameplay to find the flag
   - 10 seconds of summary showing scores and flag location
   - Game cycles continue with new flag positions and images

## Mobile Support Features
- Touch-based flag detection
- Responsive UI adapts to different screen sizes
- Collapsible chat interface on small screens
- Portrait and landscape orientation support
- Optimized performance for mobile devices

## Development Guide

### Local Development Setup
1. Frontend Development:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Backend Development:
   ```bash
   cd backend
   npm install
   npm start
   ```

### API Documentation
- Detailed API documentation can be found in [api.md](../../api.md)
- Endpoint descriptions and usage examples
- Authentication requirements
- Request/response formats

## Database Information
- MySQL database with tables for Users, ChatMessages
- Authentication using bcrypt password hashing
- Session management via client-side storage 