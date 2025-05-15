# Features Documentation

This directory contains detailed documentation for all features in the Spotted Game application.

## Implemented Features

### 1. User Authentication
- **Description**: Secure user authentication system with MySQL database
- **Implementation**:
  - User registration with username/password
  - Secure login using bcrypt password hashing
  - Session management via client-side storage
  - User role and permissions

### 2. Flag Finding Gameplay
- **Description**: Core gameplay mechanics for finding hidden flags
- **Implementation**:
  - Dynamic flag placement on background images
  - Three difficulty levels (Easy, Medium, Hard)
  - Click detection and coordinate normalization
  - Flag opacity variations based on difficulty

### 3. Real-time Multiplayer
- **Description**: Real-time multiplayer functionality using Socket.IO
- **Implementation**:
  - Player presence detection
  - Active player list updating
  - Real-time game state synchronization
  - Game cycle management (gameplay and summary phases)

### 4. Scoring System
- **Description**: Comprehensive scoring system
- **Implementation**:
  - Base points for flag detection
  - Time-based bonus points (faster finds = higher score)
  - Proximity scoring (closer clicks = more points)
  - Persistent leaderboard

### 5. Live Chat System
- **Description**: In-game chat functionality
- **Implementation**:
  - Real-time message broadcasting
  - Persistent chat history in MySQL
  - Player identification in messages

### 6. Mobile Responsiveness
- **Description**: Full mobile device support
- **Implementation**:
  - Responsive layout with adaptive UI
  - Touch input support for flag detection
  - Optimized game experience across devices

## Contributors
- **Aniket Mishra** - Backend and Integration Engineer
- **Ashwabh Bhatnagar** - Backend and Database Engineer
- **Vivek Raman** - Frontend and Integration Engineer
- **Aditya Nair** - Frontend and Infrastructure Engineer 