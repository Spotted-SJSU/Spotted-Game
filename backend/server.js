const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");
const http = require("http");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// Image URLs mapped by type
const IMAGES = {
    backgrounds: [
        'https://i.imgur.com/3nPGCxe.png',
        'https://i.imgur.com/os48okp.png',
        'https://i.imgur.com/3LKzzlY.png',
        'https://i.imgur.com/VJj91MU.png',
        'https://i.imgur.com/91wIvsN.png',
        'https://i.imgur.com/ofIcGXH.png',
        'https://i.imgur.com/LBWmpp1.png',
        'https://i.imgur.com/dbtxzJH.png',
        'https://i.imgur.com/jyOA5Br.png',
        'https://i.imgur.com/RJb9qOe.png',
        'https://i.imgur.com/thJ5o0P.png',
        'https://i.imgur.com/7ldquWL.png',
        'https://i.imgur.com/hNMKGAk.png',
        'https://i.imgur.com/zNgN8Lg.png',
        'https://i.imgur.com/eBrXky2.png',
        'https://i.imgur.com/pKl0koc.png'
    ],
    flags: [
        'https://flagcdn.com/w160/fr.png', // France
        'https://flagcdn.com/w160/de.png', // Germany
        'https://flagcdn.com/w160/it.png', // Italy
        'https://flagcdn.com/w160/jp.png', // Japan
        'https://flagcdn.com/w160/kr.png', // South Korea
        'https://flagcdn.com/w160/es.png', // Spain
        'https://flagcdn.com/w160/se.png', // Sweden
        'https://flagcdn.com/w160/ch.png', // Switzerland
        'https://flagcdn.com/w160/gb.png', // UK
        'https://flagcdn.com/w160/us.png'  // USA
    ]
};

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

// --- Game State ---
let gameData = {
    flagPosition: null,
    flagSize: { width: 60, height: 40 },
    startTime: null,
    gameOver: false,
    backgroundImageUrl: null,
    targetImageUrl: null,
    difficulty: null,
    opacity: 1,
    playerScores: new Map(), // Track scores for each player in current round
    roundId: null // Unique identifier for each round
};
let activePlayers = new Map();

// Helper functions for chat database operations
const saveChatMessage = async (message) => {
    try {
        const { content, sender, timestamp } = message;
        const senderId = sender.id;
        const senderUsername = sender.username;

        const sql = `
            INSERT INTO ChatMessages 
            (SenderID, SenderUsername, Content, Timestamp) 
            VALUES (?, ?, ?, ?)
        `;

        db.query(sql, [senderId, senderUsername, content, new Date(timestamp)], (err, result) => {
            if (err) {
                console.error("Error saving chat message to database:", err);
            } else {
                console.log(`Chat message saved to database, ID: ${result.insertId}`);
            }
        });
    } catch (error) {
        console.error("Error in saveChatMessage:", error);
    }
};

const fetchChatHistory = (limit = 50) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                MessageID as id, 
                SenderID as 'sender.id', 
                SenderUsername as 'sender.username', 
                Content as content, 
                Timestamp as timestamp 
            FROM ChatMessages 
            ORDER BY Timestamp DESC 
            LIMIT ?
        `;

        db.query(sql, [limit], (err, results) => {
            if (err) {
                console.error("Error fetching chat history:", err);
                reject(err);
                return;
            }

            // Process results to create proper message objects
            const messages = results.map(row => {
                return {
                    id: row.id.toString(),
                    content: row.content,
                    sender: {
                        id: row['sender.id'],
                        username: row['sender.username']
                    },
                    timestamp: row.timestamp
                };
            });

            // Return messages in chronological order
            resolve(messages.reverse());
        });
    });
};

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

// Helper function to get random images
const getRandomCountryImages = () => {
    const selectedBackground = IMAGES.backgrounds[Math.floor(Math.random() * IMAGES.backgrounds.length)];
    const selectedFlag = IMAGES.flags[Math.floor(Math.random() * IMAGES.flags.length)];

    console.log(`Selected background: ${selectedBackground}`);
    console.log(`Selected flag: ${selectedFlag}`);

    return {
        background: selectedBackground,
        flag: selectedFlag
    };
};

// --- Game Functions ---
const startNewGame = () => {
    console.log("Starting new game...");
    const randomImages = getRandomCountryImages();
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    const baseFlagSize = { width: 100, height: 60 };
    let flagSizeMultiplier = 1;
    let opacity = 0; // Default opacity

    if (difficulty === 'Medium') {
        flagSizeMultiplier = 0.7;
        opacity = 0.3;
    } else if (difficulty === 'Hard') {
        flagSizeMultiplier = 0.5;
        opacity = 0.1;
    } else {
        // Easy mode
        opacity = 0.4;
    }

    gameData = {
        flagSize: {
            width: baseFlagSize.width * flagSizeMultiplier,
            height: baseFlagSize.height * flagSizeMultiplier
        },
        flagPosition: generateFlagPosition(),
        startTime: Date.now(),
        gameOver: false,
        backgroundImageUrl: randomImages.background,
        targetImageUrl: randomImages.flag,
        difficulty: difficulty,
        opacity: opacity,
        playerScores: new Map(),
        roundId: Date.now().toString() // Unique identifier based on timestamp
    };

    console.log(`New game started with difficulty: ${difficulty}`);
    console.log(`Background: ${gameData.backgroundImageUrl}`);
    console.log(`Flag: ${gameData.targetImageUrl}`);

    return {
        levelCondition: "Gameplay",
        difficulty,
        backgroundImageUrl: gameData.backgroundImageUrl,
        targetImageUrl: gameData.targetImageUrl,
        opacity: gameData.opacity,
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

    // Check if player has already clicked in this round
    if (gameData.playerScores.has(userId)) {
        return res.json({
            success: false,
            error: "You've already submitted a score for this round",
            data: {
                score: gameData.playerScores.get(userId)
            }
        });
    }

    const { x: flagX, y: flagY } = gameData.flagPosition;
    const { width, height } = gameData.flagSize;

    const bgWidth = 800, bgHeight = 600;
    const clickedX = x * bgWidth;
    const clickedY = y * bgHeight;

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

    const playerScore = Math.max(0, Math.round(points));

    // Store the score for this player in the current round
    gameData.playerScores.set(userId, playerScore);

    console.log(`Player ${userId} scored ${playerScore} points`);

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
                    score: playerScore,
                    message: "Score not saved - user not found"
                }
            });
        }

        // User exists, update their score
        db.query("UPDATE Users SET Score = Score + ? WHERE UserID = ?",
            [playerScore, userId],
            (updateErr, updateResult) => {
                if (updateErr) {
                    console.error("Error updating score:", updateErr);
                    return res.status(500).json({
                        success: false,
                        error: "Failed to update score",
                        data: null
                    });
                }

                console.log(`Updated score for user ${userId}, added ${playerScore} points. Affected rows: ${updateResult.affectedRows}`);

                // Return success with the score
                res.json({
                    success: true,
                    error: null,
                    data: {
                        score: playerScore,
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
        db.query("INSERT INTO Users (username, password, Score) VALUES (?, ?, 0)", [username, hashedPassword], (err, result) => {
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

app.get("/chat-history", async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;

    try {
        const messages = await fetchChatHistory(limit);
        res.json({
            success: true,
            error: null,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch chat history",
            data: null
        });
    }
});

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
        console.log(`Player ${userId} registered`);
        activePlayers.set(userId, { userId }); // Add to active players

        // Initialize game state if needed
        if (!gameData.flagPosition || !gameActive) {
            console.log("Initializing new game state");
            gameActive = true;
            cycleStartTime = Date.now();
            startNewGame();
        }

        // If this is the first player, we need to restart the game cycle
        if (activePlayers.size === 1) {
            console.log("First player joined - starting game cycle");
            gameActive = true;
            cycleStartTime = Date.now();
            // Force a new game start
            const gameInfo = startNewGame();
            socket.emit("levelInfo", {
                ...gameInfo,
                duration: 20,
                activePlayers: 1
            });
        } else {
            // Send current game state to the new player
            console.log("Additional player joined - sending current game state");
            emitLevelInfo();
        }
    });

    // Handle incoming chat messages
    socket.on("chatMessage", (message) => {
        // New format with full message object
        console.log(`Received chat message from ${message.sender.username}: ${message.content}`);
        // Use the message as is since it already has all the required information, but add server timestamp to ensure consistency
        const chatMessage = {
            ...message,
            timestamp: new Date()
        };
        io.emit("chatMessage", chatMessage);
        saveChatMessage(chatMessage); // Save to database
    });

    socket.on("disconnect", () => {
        console.log(`Player ${userId} disconnected`);
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
const cycleDuration = 30 * 1000;
const gameplayDuration = 20 * 1000;
const summaryDuration = 10 * 1000;

// Variables to track game state
let gameActive = false;
let cycleStartTime = null;
let pausedTimeInCycle = 0;
let lastCycleTime = 0;

const emitLevelInfo = () => {
    const playerCount = activePlayers.size;
    console.log(`\nEmitting level info. Active players: ${playerCount}`);

    if (playerCount === 0) {
        if (gameActive) {
            gameActive = false;
            pausedTimeInCycle = (Date.now() - cycleStartTime) % cycleDuration;
            console.log("Game paused: No active players");
        }
        return;
    } else if (!gameActive) {
        gameActive = true;
        cycleStartTime = Date.now() - pausedTimeInCycle;
        console.log(`Game resumed with ${playerCount} player(s)`);
    }

    const now = Date.now();
    const timeInCycle = (now - cycleStartTime) % cycleDuration;
    console.log(`Time in cycle: ${timeInCycle}ms, Gameplay duration: ${gameplayDuration}ms`);

    let levelCondition;
    let duration;
    let response = {
        activePlayers: playerCount
    };

    // Calculate remaining time in gameplay phase
    const remainingGameplayTime = Math.floor((gameplayDuration - timeInCycle) / 1000);

    // Calculate remaining time in summary phase
    const remainingSummaryTime = Math.floor((cycleDuration - timeInCycle) / 1000);

    // Start new game if:
    // 1. We're at the start of a cycle (timeInCycle < 1000)
    // 2. OR we've moved from summary to gameplay phase
    const isNewCycle = timeInCycle < 1000;
    const movedToGameplay = timeInCycle < lastCycleTime;
    const shouldStartNewGame = isNewCycle || movedToGameplay;

    // Determine phase and duration
    if (timeInCycle < gameplayDuration && remainingGameplayTime > 0) {
        // Normal gameplay phase with positive duration
        levelCondition = "Gameplay";
        duration = remainingGameplayTime;

        if (shouldStartNewGame) {
            console.log("Starting new game in gameplay phase");
            const newGame = startNewGame();
            response = {
                ...response,
                levelCondition,
                duration,
                ...newGame
            };
        } else {
            console.log("Continuing existing game");
            response = {
                ...response,
                levelCondition,
                difficulty: gameData.difficulty,
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
                },
                duration,
                opacity: gameData.opacity,
                score: gameData.score
            };
        }
    } else if (timeInCycle < gameplayDuration) {
        // Gameplay would be 0, transition to summary with 10s
        levelCondition = "Summary";
        duration = 10;
        console.log("Transitioning to summary phase with 10s duration");

        // Convert playerScores Map to array for the response
        const scoresArray = Array.from(gameData.playerScores.entries()).map(([userId, score]) => ({
            userId,
            score
        }));

        response = {
            ...response,
            levelCondition,
            difficulty: gameData.difficulty,
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
            },
            duration,
            opacity: gameData.opacity,
            score: undefined,
            lastGameData: {
                difficulty: gameData.difficulty,
                backgroundImageUrl: gameData.backgroundImageUrl,
                targetImageUrl: gameData.targetImageUrl,
                opacity: gameData.opacity,
                roundId: gameData.roundId,
                playerScores: scoresArray,
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
            }
        };
    } else if (remainingSummaryTime > 0) {
        // Normal summary phase with positive duration
        levelCondition = "Summary";
        duration = remainingSummaryTime;
        console.log("In summary phase");

        // Convert playerScores Map to array for the response
        const scoresArray = Array.from(gameData.playerScores.entries()).map(([userId, score]) => ({
            userId,
            score
        }));

        response = {
            ...response,
            levelCondition,
            difficulty: gameData.difficulty,
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
            },
            duration,
            opacity: gameData.opacity,
            score: undefined,
            lastGameData: {
                difficulty: gameData.difficulty,
                backgroundImageUrl: gameData.backgroundImageUrl,
                targetImageUrl: gameData.targetImageUrl,
                opacity: gameData.opacity,
                roundId: gameData.roundId,
                playerScores: scoresArray,
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
            }
        };
    } else {
        // Skip emitting if we would have sent a duration 0 event
        return;
    }

    lastCycleTime = timeInCycle;
    console.log(`Emitting levelInfo with condition: ${response.levelCondition}, duration: ${response.duration}s`);
    io.emit("levelInfo", response);
};

// Send every 10 seconds
const levelInfoInterval = setInterval(emitLevelInfo, 10000);

// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);

    // Initialize scores for existing users with NULL scores
    db.query("UPDATE Users SET Score = 0 WHERE Score IS NULL", (err, result) => {
        if (err) {
            console.error("Error initializing scores:", err);
        } else if (result.affectedRows > 0) {
            console.log(`Initialized scores for ${result.affectedRows} users`);
        }
    });

    // Create ChatMessages table if it doesn't exist
    const createChatTableSQL = `
        CREATE TABLE IF NOT EXISTS ChatMessages (
            MessageID INT AUTO_INCREMENT PRIMARY KEY,
            SenderID VARCHAR(255) NOT NULL,
            SenderUsername VARCHAR(255) NOT NULL,
            Content TEXT NOT NULL,
            Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createChatTableSQL, (err, result) => {
        if (err) {
            console.error("Error creating chat messages table:", err);
        } else {
            console.log("ChatMessages table ready");
        }
    });
});
