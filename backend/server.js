const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

let gameData = {
    flagPosition: null,
    flagSize: { width: 60, height: 40 },
    startTime: null,
    gameOver: false,
    score: 0
};

// Function to generate a random flag position
const generateFlagPosition = () => {
    const bgWidth = 800, bgHeight = 600;
    return {
        x: Math.floor(Math.random() * (bgWidth - gameData.flagSize.width)),
        y: Math.floor(Math.random() * (bgHeight - gameData.flagSize.height))
    };
};

// Function to calculate distance
const calculateDistance = (p1, p2) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

// Start Game
app.get("/start", (req, res) => {
    gameData.flagPosition = generateFlagPosition();
    gameData.startTime = Date.now();
    gameData.gameOver = false;
    gameData.score = 0;
    res.json({ message: "Game started", flagPosition: gameData.flagPosition });
});

// Handle Click Event
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

    io.emit("scoreUpdate", gameData.score);  // Send score update via WebSockets

    res.json({ message, score: gameData.score });
});

// WebSocket connection
io.on("connection", (socket) => {
    console.log("New player connected!");

    socket.on("disconnect", () => {
        console.log("Player disconnected.");
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
