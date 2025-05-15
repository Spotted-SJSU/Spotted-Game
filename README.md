# Spotted Game

A multiplayer flag-finding game where players compete to find hidden flags across various background images. Built with React, Node.js, Express, and Socket.IO.

## Live Demo

The game is live and playable at: [https://spotted-game.onrender.com](https://spotted-game.onrender.com)

## Demo Video

Check out our demo video to see the game in action: [Spotted Game Demo](https://youtu.be/oESQDwCYCag)

## Features

- **User Authentication**: Register and login system to track individual player scores
- **Real-time Multiplayer**: See other active players and compete in real-time
- **Dynamic Difficulty Levels**: Three difficulty levels (Easy, Medium, Hard) with varying flag sizes and opacity
- **Live Chat**: Integrated chat system for player communication
- **Global Leaderboard**: Track top scores across all players
- **Mobile Responsive**: Fully playable on mobile devices and tablets
- **Round-based Gameplay**: Alternating gameplay and summary phases

## Technology Stack

### Frontend
- React
- Mantine UI Framework
- Socket.IO Client
- TypeScript
- Vite

### Backend
- Node.js
- Express
- Socket.IO
- MySQL Database
- bcrypt for password hashing

### Deployment
- Docker
- Render.com cloud hosting

## Local Development

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Docker and Docker Compose (for easy setup)
- MySQL (if running without Docker)

### Setup and Installation

#### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/Spotted-SJSU/Spotted-Game.git
   cd Spotted-Game
   ```

2. Create a `.env` file in the project root with your MySQL database credentials:
   ```
   # Database Configuration
   DB_HOST=your_mysql_host
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   DB_PORT=3306
   
   # Server Configuration
   PORT=5001
   ```

3. Start Docker on your machine

4. Build and run using Docker Compose:
   ```bash
   docker-compose up --build
   ```

5. Access the application at `http://localhost:3000`

#### Manual Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Spotted-SJSU/Spotted-Game.git
   cd Spotted-Game
   ```

2. Install dependencies for backend and frontend:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:
   ```
   # Database Configuration
   DB_HOST=your_mysql_host
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   DB_PORT=3306
   
   # Server Configuration
   PORT=5001
   ```

4. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

5. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

6. Access the application at `http://localhost:5173`

## Game Rules

1. **Objective**: Find the hidden flag in each background image as quickly as possible
2. **Scoring**:
   - Base points for finding the flag
   - Bonus points for finding it quickly
   - Position accuracy affects score (closer clicks earn more points)
3. **Game Cycle**:
   - 20 seconds of active gameplay to find the flag
   - 10 seconds of summary showing scores and flag location

## Database Schema

The game uses a MySQL database with the following tables:
- `Users`: Stores user credentials and total scores
- `ChatMessages`: Stores chat messages between players

## Deployment

The application is deployed on Render.com using Docker. The deployment process:

1. Builds a Docker container with both frontend and backend
2. Uses nginx to serve the frontend and proxy API requests to the backend
3. Configures environment variables in Render.com dashboard for database connection and other settings

## Mobile Support

The game is fully responsive and supports:
- Touch-based flag detection
- UI adapts to different screen sizes
- Collapsible chat interface on small screens
- Optimized performance for mobile devices

## Contributors

- **Aniket Mishra** - Backend and Integration Engineer
- **Ashwabh Bhatnagar** - Backend and Database Engineer
- **Vivek Raman** - Frontend and Integration Engineer
- **Aditya Nair** - Frontend and Infrastructure Engineer

## License

MIT License - See LICENSE file for details
