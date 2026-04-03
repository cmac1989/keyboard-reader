const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static('public'));

server.listen(PORT, () => {
    console.log(`Overlay running at http://localhost:${PORT}`);
});

io.on('connection', socket => {
    console.log('Browser connected:', socket.id);
});

// Spawn Python input capture
const py = spawn('python3', ['capture.py']);

py.stdout.on('data', data => {
    data.toString().trim().split('\n').forEach(line => {
        try {
            const { type, key } = JSON.parse(line);
            console.log(type, key);
            io.emit(type, key);
        } catch (_) {}
    });
});

py.stderr.on('data', data => {
    console.error('Python error:', data.toString());
});

py.on('close', code => {
    console.error('Python process exited with code', code);
});
