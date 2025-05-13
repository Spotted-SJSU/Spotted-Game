# Spotted Game API Documentation

## REST Endpoints

### Authentication & User Management

1. POST `/register` (User Registration)
```json
Request:
{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "error": null,
  "data": {
    "message": "User registered"
  }
}
```

2. POST `/login` (User Login)
```json
Request:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "error": null,
  "data": {
    "message": "Login successful",
    "userId": "string",
    "token": "string"
  }
}
```

3. POST `/logout` (User Logout)
```json
Response:
{
  "success": true,
  "error": null,
  "data": {
    "message": "Logout successful"
  }
}
```

4. POST `/password/reset` (Password Reset Request)
```json
Request:
{
  "email": "string"
}

Response:
{
  "success": true,
  "error": null,
  "data": {
    "message": "Password reset email sent"
  }
}
```

### Game Management

5. POST `/game/start` (Start New Game)
```json
Request:
{
  "difficulty": "string",
  "maxPlayers": "number"
}

Response:
{
  "success": true,
  "error": null,
  "data": {
    "message": "Game started",
    "flagPosition": {
      "x": 210,
      "y": 350
    },
    "levelInfo": {
      "levelCondition": "Gameplay",
      "difficulty": "Medium",
      "backgroundImageUrl": "/Game_Backgrounds_Scaled/background1.jpg",
      "targetImageUrl": "/Game_Backgrounds_Scaled/flag1.jpg",
      "targetCoords": {
        "top_left": {
          "x": 0.2625,
          "y": 0.583333
        },
        "bot_right": {
          "x": 0.5875,
          "y": 0.766667
        }
      },
      "duration": 38
    }
  }
}
```

6. POST `/game/join` (Join Existing Game)
```json
Request:
{
  "gameId": "string"
}

Response:
{
  "success": true,
  "error": null,
  "data": {
    "message": "Successfully joined game",
    "gameState": {
      "currentPlayers": ["array"],
      "gameStatus": "string",
      "timeRemaining": "number"
    }
  }
}
```

7. POST `/game/click` (Player Click Action)
```json
Request:
{
  "x": "number",
  "y": "number"
}

Response:
{
  "success": true,
  "error": null,
  "data": {
    "score": 117,
    "clickedBy": "user123"
  }
}
```

8. GET `/game/leaderboard` (Get Game Leaderboard)
```json
Response:
{
  "success": true,
  "error": null,
  "data": {
    "leaderboard": [
      {
        "userId": "string",
        "username": "string",
        "score": "number",
        "rank": "number"
      }
    ]
  }
}
```

### User Profile

9. GET `/profile` (Get User Profile)
```json
Response:
{
  "success": true,
  "error": null,
  "data": {
    "userId": "string",
    "username": "string",
    "email": "string",
    "stats": {
      "gamesPlayed": "number",
      "totalScore": "number",
      "averageScore": "number",
      "wins": "number"
    }
  }
}
```

10. PUT `/profile` (Update User Profile)
```json
Request:
{
  "username": "string",
  "email": "string"
}

Response:
{
  "success": true,
  "error": null,
  "data": {
    "message": "Profile updated successfully"
  }
}
```

## WebSocket Events

1. "connectionResponse" (Player Connection Response)
```json
{
  "success": true,
  "error": null,
  "data": {
    "message": "Player connected successfully"
  }
}
```

2. "activePlayersUpdate" (Active Players Update)
```json
{
  "success": true,
  "error": null,
  "data": [
    {
      "userId": "string",
      "username": "string"
    }
  ]
}
```

3. "gameTimerUpdate" (Game Timer Update)
```json
{
  "levelCondition": "string",
  "duration": "number"
}
```

4. "gameStateUpdate" (Game State Update)
```json
{
  "gameStatus": "string",
  "players": ["array"],
  "scores": {
    "userId": "score"
  },
  "timeRemaining": "number"
}
```

5. "gameOver" (Game Over Event)
```json
{
  "winner": {
    "userId": "string",
    "username": "string",
    "score": "number"
  },
  "finalScores": [
    {
      "userId": "string",
      "username": "string",
      "score": "number",
      "rank": "number"
    }
  ]
}
```

## Error Responses

All endpoints may return error responses in the following format:
```json
{
  "success": false,
  "error": "Error message description",
  "data": null
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
