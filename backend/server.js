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

// --- MySQL Setup ---
const db = mysql.createConnection({
    host: "softwareproject.cxmu80uoi8qg.us-west-1.rds.amazonaws.com",
    user: "Aniket",
  password: "321tekinA",
  database: "SpotIt",
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error(" DB connection error:", err);
        process.exit(1);
    }
    console.log("Connected to MySQL");
});

// --- Game State ---
let gameData = {
    flagPosition: null,
    flagSize: { width: 60, height: 40 },
    startTime: null,
    gameOver: false,
    score: 0
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

// --- Game Routes ---
const fs = require('fs');
const path = require('path');

app.get("/start", (req, res) => {
    const backgroundFolder = path.join(__dirname, 'Game_Backgrounds');
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

    const maxX = 800 - gameData.flagSize.width;
    const maxY = 600 - gameData.flagSize.height;

    gameData.flagPosition = generateFlagPosition();
    gameData.startTime = Date.now();
    gameData.gameOver = false;
    gameData.score = 0;

    // Gameplay and Summary Timings
    const cycleDuration = 50 * 1000; // Total cycle = 40s Gameplay + 10s Summary
    const now = Date.now();
    const timeInCycle = now % cycleDuration;

    let levelCondition = "Gameplay";
    let duration;

    if (timeInCycle >= 40 * 1000) {
        levelCondition = "Summary";
        duration = 50 * 1000 - timeInCycle; 
    } else {
        levelCondition = "Gameplay";
        duration = 40 * 1000 - timeInCycle; 
    }

    duration = Math.ceil(duration / 1000); // Convert milliseconds to seconds for duration to read easier

    const levelInfo = {
        levelCondition,
        difficulty,
        backgroundImageUrl: `/Game_Backgrounds/${randomBackground}`,
        targetImageUrl: `/Game_Backgrounds/${randomFlag}`,
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
        duration
    };

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
    if (gameData.gameOver) {
        return res.json({
            success: false,
            error: "Game already over!",
            data: {
                score: gameData.score
            }
        });
    }

    const { x, y } = req.body;
    const { x: flagX, y: flagY } = gameData.flagPosition;
    const { width, height } = gameData.flagSize;

    // Convert normalized coordinates to actual pixel positions
    const bgWidth = 800, bgHeight = 600;  // Background dimensions
    const clickedX = x * bgWidth;
    const clickedY = y * bgHeight;

    gameData.gameOver = true;
    const timeTaken = (Date.now() - gameData.startTime) / 1000;

    let points;
    let message;


    // Check for click based on the normalized coordinates
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

    
    res.json({
        success: true,
        error: null,
        data: {
            score: gameData.score
        }
    });
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



app.get("/active-players", (req, res) => {
    const players = Array.from(activePlayers.values()); // Return all active players
    res.json({
        success: true,
        error: null,
        data: players
    });
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
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected.");
        if (userId) activePlayers.delete(userId);
    });
});


// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
