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
    password: "Aniket123",
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
app.get("/start", (req, res) => {
    gameData.flagPosition = generateFlagPosition();
    gameData.startTime = Date.now();
    gameData.gameOver = false;
    gameData.score = 0;
    res.json({ message: "Game started", flagPosition: gameData.flagPosition });
});

app.post("/click", (req, res) => {
    if (gameData.gameOver) {
        return res.json({ message: "Game already over!", score: gameData.score });
    }

    const { x, y } = req.body;
    const { x: flagX, y: flagY } = gameData.flagPosition;
    const { width, height } = gameData.flagSize;

    gameData.gameOver = true;
    const timeTaken = (Date.now() - gameData.startTime) / 1000;

    let points;
    let message;

    if (x >= flagX && x <= flagX + width && y >= flagY && y <= flagY + height) {
        points = 100 + (30 - timeTaken);
        message = `✅ Perfect Click! Time: ${timeTaken.toFixed(2)}s, Score: ${Math.round(points)}`;
    } else {
        const distance = calculateDistance({ x, y }, { x: flagX, y: flagY });
        points = Math.max(0, 100 - (distance / 10)) + (30 - timeTaken);
        message = `Missed! Distance: ${distance.toFixed(2)}, Time: ${timeTaken.toFixed(2)}s, Score: ${Math.round(points)}`;
    }

    gameData.score = Math.max(0, Math.round(points));

    io.emit("scoreUpdate", gameData.score);
    res.json({ message, score: gameData.score });
});

// --- Auth Routes ---
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    // Check if username already exists
    db.query("SELECT * FROM Users WHERE username = ?", [username], async (err, results) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: "Username already exists" });
        }

        // Proceed with registration
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query("INSERT INTO Users (username, password, Email) VALUES (?, ?, ?)", [username, hashedPassword, null], (err, result) => {
            if (err) {
                console.error("Registration error:", err);
                return res.status(500).json({ error: "Failed to register" });
            }
            res.json({ message: "User registered" });
        });

    });
});


app.post("/login", (req, res) => {
    const { username, password } = req.body;

    console.log("Received login data:", req.body); // Add this line to log request body

    if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
    }

    db.query("SELECT * FROM Users WHERE username = ?", [username], async (err, results) => {
        if (err) {
            console.error("DB query error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            console.log("User not found:", username);
            return res.status(401).json({ error: "User not found" });
        }

        const user = results[0];
        const hashedPassword = user.Password;  // Retrieve the hashed password from the database

        console.log("Hashed password from DB:", hashedPassword); // Add this line to check the stored password

        if (!password || !hashedPassword) {
            console.log("Password or hashed password is missing");
            return res.status(500).json({ error: "Password comparison error" });
        }

        try {
            const match = await bcrypt.compare(password, hashedPassword);
            if (!match) {
                console.log("Incorrect password:", username);
                return res.status(401).json({ error: "Incorrect password" });
            }

            res.json({ message: "Login successful" });
        } catch (err) {
            console.error("Error during password comparison:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    });
});




// --- WebSocket ---
io.on("connection", (socket) => {
    console.log("New player connected!");

    socket.on("disconnect", () => {
        console.log("Player disconnected.");
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
