const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");
const http = require("http");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// Serve static files from the Game_Backgrounds_Scaled directory
app.use('/Game_Backgrounds_Scaled', express.static(path.join(__dirname, 'Game_Backgrounds_Scaled')));


// --- MySQL Setup ---
const db = mysql.createPool({
    host: "softwareproject.cxmu80uoi8qg.us-west-1.rds.amazonaws.com",
    user: "Aniket",
    password: "321tekinA",
    database: "SpotIt",
    port: 3306,
    keepAliveInitialDelay: 10000,
    enableKeepAlive: true,
});

// db.connect((err) => {
//     if (err) {
//         console.error(" DB connection error:", err);
//         process.exit(1);
//     }
//     console.log("Connected to MySQL");
// });

// --- Game State ---
let gameData = {
    flagPosition: null,
    flagSize: { width: 60, height: 40 },
    startTime: null,
    gameOver: false,
    score: 0,
    backgroundImageUrl: null,
    targetImageUrl: null,
    difficulty: null
};
let activePlayers = new Map();


const generateFlagPosition = () => {
    const bgWidth = 800, bgHeight = 600;
    return {
        x: Math.floor(Math.random() * (bgWidth - gameData.flagSize.width)),
        y: Math.floor(Math.random() * (bgHeight - gameData.flagSize.height))
    };
};

const calculateDistance = (p1, p2) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

// --- Game Functions ---
const startNewGame = () => {
    // Updated path to use Game_Backgrounds_Scaled folder
    const backgroundFolder = path.join(__dirname, 'Game_Backgrounds_Scaled');
    const files = fs.readdirSync(backgroundFolder);


    const isImage = file => /\.(jpg|jpeg|png)$/i.test(file);
    const isFlag = file => /_flag\.(jpg|jpeg|png)$/i.test(file);
    const isBackground = file => !isFlag(file) && isImage(file);

    const backgrounds = files.filter(isBackground);
    const flags = files.filter(isFlag);

    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const randomFlag = flags[Math.floor(Math.random() * flags.length)];

    const difficulties = ['Easy', 'Medium', 'Hard'];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    const baseFlagSize = { width: 100, height: 60 };
    let flagSizeMultiplier = 1;

    if (difficulty === 'Medium') flagSizeMultiplier = 0.9;
    else if (difficulty === 'Hard') flagSizeMultiplier = 0.8;

    gameData.flagSize = {
        width: baseFlagSize.width * flagSizeMultiplier,
        height: baseFlagSize.height * flagSizeMultiplier
    };

    gameData.flagPosition = generateFlagPosition();
    gameData.startTime = Date.now();
    gameData.gameOver = false;
    gameData.score = 0;
    // Updated URLs to use Game_Backgrounds_Scaled folder
    gameData.backgroundImageUrl = `/Game_Backgrounds_Scaled/${randomBackground}`;
    gameData.targetImageUrl = `/Game_Backgrounds_Scaled/${randomFlag}`;
    gameData.difficulty = difficulty;

    return {
        levelCondition: "Gameplay",
        difficulty,
        backgroundImageUrl: gameData.backgroundImageUrl,
        targetImageUrl: gameData.targetImageUrl,
        targetCoords: {
            top_left: {
                x: gameData.flagPosition.x / 800,
                y: gameData.flagPosition.y / 600
            },
            bot_right: {
                x: (gameData.flagPosition.x + gameData.flagSize.width) / 800,
                y: (gameData.flagPosition.y + gameData.flagSize.height) / 600
            }
        }
    };
};


// Keep the /start endpoint for backward compatibility or testing
app.get("/start", (req, res) => {
    // Check if game is active (has players)
    if (!gameActive) {
        return res.json({
            success: false,
            error: "Game is currently paused - no active players",
            data: {
                message: "Please register as a player to start the game"
            }
        });
    }
    
    const levelInfo = startNewGame();
    
    // Get current cycle position
    const now = Date.now();
    const timeInCycle = (now - cycleStartTime) % cycleDuration;
    let duration;

    if (timeInCycle >= gameplayDuration) {
        levelInfo.levelCondition = "Summary";
        duration = cycleDuration - timeInCycle;
    } else {
        levelInfo.levelCondition = "Gameplay";
        duration = gameplayDuration - timeInCycle;
    }

    levelInfo.duration = Math.ceil(duration / 1000);
    levelInfo.activePlayers = activePlayers.size;

    res.json({
        success: true,
        error: null,
        data: {
            message: "Game started",
            flagPosition: gameData.flagPosition,
            levelInfo
        }
    });
});




app.post("/click", (req, res) => {
    const { userId, x, y } = req.body;

    if (!userId) {
        return res.json({
            success: false,
            error: "Missing userId",
            data: null
        });
    }

    if (gameData.gameOver) {
        return res.json({
            success: false,
            error: "Game already over!",
            data: {
                score: gameData.score
            }
        });
    }

    const { x: flagX, y: flagY } = gameData.flagPosition;
    const { width, height } = gameData.flagSize;

    const bgWidth = 800, bgHeight = 600;
    const clickedX = x * bgWidth;
    const clickedY = y * bgHeight;

    gameData.gameOver = true;
    const timeTaken = (Date.now() - gameData.startTime) / 1000;

    let points;
    if (
        clickedX >= flagX && clickedX <= flagX + width &&
        clickedY >= flagY && clickedY <= flagY + height
    ) {
        points = 100 + (30 - timeTaken);
    } else {
        const distance = calculateDistance({ x: clickedX, y: clickedY }, { x: flagX, y: flagY });
        points = Math.max(0, 100 - (distance / 10)) + (30 - timeTaken);
    }

    gameData.score = Math.max(0, Math.round(points));
    gameData.clickedBy = userId;  // Track which user clicked

    // Check if the user exists in the database and update their score
    db.query("SELECT * FROM Users WHERE UserID = ?", [userId], (err, results) => {
        if (err) {
            console.error("DB query error:", err);
            return res.status(500).json({
                success: false,
                error: "Database error",
                data: null
            });
        }

        if (results.length === 0) {
            // User doesn't exist, return the score but don't update the database
            return res.json({
                success: true,
                error: null,
                data: {
                    score: gameData.score,
                    clickedBy: userId,
                    message: "Score not saved - user not found"
                }
            });
        }

        // User exists, update their score
      db.query("UPDATE Users SET Score = Score + ? WHERE UserID = ?",
        [gameData.score, userId],
            (updateErr) => {
                if (updateErr) {
                    console.error("Error updating score:", updateErr);
                    return res.status(500).json({
                        success: false,
                        error: "Failed to update score",
                        data: null
                    });
                }

                // Return success with the score
                res.json({
                    success: true,
                    error: null,
                    data: {
                        score: gameData.score,
                        clickedBy: userId,
                        message: "Score updated successfully"
                    }
                });
            }
        );
    });
});



app.get("/leaderboard", (req, res) => {
    // Get top 5 players by score
    db.query(
        "SELECT UserID, Username, Score FROM Users WHERE Score > 0 ORDER BY Score DESC LIMIT 5",
        (err, results) => {
            if (err) {
                console.error("DB query error:", err);
                return res.status(500).json({
                    success: false,
                    error: "Database error",
                    data: null
                });
            }

            res.json({
                success: true,
                error: null,
                data: results
            });
        }
    );
});



// --- Auth Routes ---
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: "Missing fields",
            data: null
        });
    }

    // Check if username already exists
    db.query("SELECT * FROM Users WHERE username = ?", [username], async (err, results) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({
                success: false,
                error: "Database error",
                data: null
            });
        }

        if (results.length > 0) {
            return res.status(409).json({
                success: false,
                error: "Username already exists",
                data: null
            });
        }

        // Proceed with registration
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query("INSERT INTO Users (username, password) VALUES (?, ?)", [username, hashedPassword], (err, result) => {
            if (err) {
                console.error("Registration error:", err);
                return res.status(500).json({
                    success: false,
                    error: "Failed to register",
                    data: null
                });
            }
            res.json({
                success: true,
                error: null,
                data: { message: "User registered" }
            });
        });
    });
});


app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: "Missing username or password",
            data: null
        });
    }

    db.query("SELECT * FROM Users WHERE username = ?", [username], async (err, results) => {
        if (err) {
            console.error("DB query error:", err);
            return res.status(500).json({
                success: false,
                error: "Database error",
                data: null
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                error: "User not found",
                data: null
            });
        }

        const user = results[0];
        const hashedPassword = user.Password;

        if (!password || !hashedPassword) {
            return res.status(500).json({
                success: false,
                error: "Password comparison error",
                data: null
            });
        }

        try {
            const match = await bcrypt.compare(password, hashedPassword);
            if (!match) {
                return res.status(401).json({
                    success: false,
                    error: "Incorrect password",
                    data: null
                });
            }

            // Register as active player
            activePlayers.set(user.UserID, {
                id: user.UserID,
                username: user.Username
            });

            res.json({
                success: true,
                error: null,
                data: {
                    message: "Login successful",
                    userId: user.UserID
                }
            });
        } catch (err) {
            console.error("Error during password comparison:", err);
            res.status(500).json({
                success: false,
                error: "Internal server error",
                data: null
            });
        }
    });
});


/*
app.get("/active-players", (req, res) => {
    const players = Array.from(activePlayers.values()); // Return all active players
    res.json({
        success: true,
        error: null,
        data: players
    });
});
*/




// --- WebSocket ---
io.on("connection", (socket) => {
    console.log("New player connected!");

    let userId = null;

    socket.emit("connectionResponse", {
        success: true,
        error: null,
        data: {
            message: "Player connected successfully"
        }
    });

    socket.on("registerUserId", (data) => {
        userId = data.userId;
        activePlayers.set(userId, { userId }); // Add to active players
        // If this is the first player, we might need to restart the game cycle
        if (activePlayers.size === 1 && !gameActive) {
            console.log("First player joined - starting game cycle");
            gameActive = true;
            cycleStartTime = Date.now();
            // Immediately emit game state to provide feedback
            emitGameTimer();
        }
    });


    socket.on("disconnect", () => {
        console.log("Player disconnected.");
        if (userId) activePlayers.delete(userId);
    });
});


//Active Players Emitting Logic
const broadcastActivePlayers = () => {
        const players = Array.from(activePlayers.values());
        io.emit("activePlayersUpdate", players); // Emit all active players
    };

setInterval(broadcastActivePlayers, 1000); // emit every second


// Level Condition, Game Start, and Duration Emitting logic
const cycleDuration = 50 * 1000;
const gameplayDuration = 40 * 1000;
const summaryDuration = 10 * 1000;

// Variables to track game state
let gameActive = false;
let cycleStartTime = null;
let pausedTimeInCycle = 0;

const emitGameTimer = () => {
    // Check if we have active players
    const playerCount = activePlayers.size;
    
    if (playerCount === 0) {
        // No active players - pause the game if it's running
        if (gameActive) {
            gameActive = false;
            pausedTimeInCycle = (Date.now() - cycleStartTime) % cycleDuration;
            console.log("Game paused: No active players");
            
            // Emit pause notification
            io.emit("gameTimerUpdate", {
                levelCondition: "Paused",
                message: "Waiting for players to join",
                duration: 0
            });
        }
        return; // Don't proceed with game logic
    } else if (!gameActive) {
        // Players have joined and game was paused - resume game
        gameActive = true;
        cycleStartTime = Date.now() - pausedTimeInCycle;
        console.log(`Game resumed with ${playerCount} player(s)`);
    }

    // Calculate current position in game cycle
    const now = Date.now();
    const timeInCycle = (now - cycleStartTime) % cycleDuration;
    
    let levelCondition;
    let duration;
    let gameInfo = null;

    if (timeInCycle >= gameplayDuration) {
        // Summary phase
        levelCondition = "Summary";
        duration = cycleDuration - timeInCycle;
    } else {
        // Gameplay phase
        levelCondition = "Gameplay";
        duration = gameplayDuration - timeInCycle;
        
        // If we're at the very beginning of the gameplay phase, start a new game
        if (timeInCycle < 1000) {  // Within the first second of the gameplay phase
            gameInfo = startNewGame();
        }
    }

    duration = Math.ceil(duration / 1000); // Convert ms to seconds

    // Prepare the update to send to clients
    const update = {
        levelCondition,
        duration,
        activePlayers: playerCount
    };

    // Include game info if we're starting a new game
    if (gameInfo) {
        update.gameInfo = gameInfo;
        update.gameInfo.duration = duration;
    }

    // Emit to all connected clients
    io.emit("gameTimerUpdate", update);
};

// Initialize the game state when server starts
cycleStartTime = Date.now();
if (activePlayers.size > 0) {
    gameActive = true;
} else {
    console.log("Game waiting for players to join");
}


// Then set up the interval
const timerInterval = setInterval(emitGameTimer, 1000); // Update every second



// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
