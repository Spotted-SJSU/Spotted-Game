const net = require('net');

const server = net.createServer((socket) => {
    console.log('Client connected');
    
    // Handle incoming data from the client
    socket.on('data', (data) => {
        console.log(`Received from Python: ${data}`);
        // Process the data and send a response back
        socket.write('Score received!');
    });
    
    // Handle client disconnection
    socket.on('end', () => {
        console.log('Client disconnected');
    });
});

server.listen(3001, () => {
    console.log('Socket server listening on port 3001');
});
