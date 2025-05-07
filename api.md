1. /start route (Game start)

```json
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
      "backgroundImageUrl": "/Game_Backgrounds/background1.jpg",
      "targetImageUrl": "/Game_Backgrounds/flag1.jpg",
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

2. /click route (Player successfuly clicks on the screen)

```json
{
  "success": true,
  "error": null,
  "data": {
    "score": 117,
    "clickedBy": "user123"
  }
}
```

(Player clicks but game is already over)

```json
{
  "success": false,
  "error": "Game already over!",
  "data": {
    "score": 117
  }
}
```

3. /register route (User registration)

```json
{
  "success": true,
  "error": null,
  "data": {
    "message": "User registered"
  }
}
```

4. /login route (User login)

````json
{
  "success": true,
  "error": null,
  "data": {
    "message": "Login successful",
    "userId": 1
  }
}
5. WebSocket "connectionResponse" event (Player connection response)

```json
{
  "success": true,
  "error": null,
  "data": {
    "message": "Player connected successfully"
  }
}
````

6. WebSocket "activePlayersUpdate" event (Active players update)

```json
{
  "success": true,
  "error": null,
  "data": [
    {
      "userId": 1,
      "username": "player1"
    },
    {
      "userId": 2,
      "username": "player2"
    }
  ]
}
```

7. WebSocket "gameTimerUpdate" event (Game level condition and timer update)

```json
{
  "levelCondition": "Gameplay",
  "duration": 29
}
```
