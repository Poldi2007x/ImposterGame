const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const words = [
    { w: "Pizza", h: "Etwas zu essen" },
    { w: "Eiffelturm", h: "Eine Sehenswürdigkeit" },
    { w: "Staubsauger", h: "Haushaltsgerät" },
    { w: "Pinguin", h: "Ein Tier" },
    { w: "Fußball", h: "Ein Hobby/Sport" }
];

let rooms = {};

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.room);
        if (!rooms[data.room]) rooms[data.room] = { players: [] };
        rooms[data.room].players.push({ id: socket.id, name: data.name });
        io.to(data.room).emit('updatePlayers', rooms[data.room].players);
    });

    socket.on('startGame', (roomName) => {
        let room = rooms[roomName];
        if (room && room.players.length >= 3) {
            let pick = words[Math.floor(Math.random() * words.length)];
            let imposterIndex = Math.floor(Math.random() * room.players.length);

            room.players.forEach((p, i) => {
                if (i === imposterIndex) {
                    io.to(p.id).emit('role', { role: "IMPOSTER", info: pick.h });
                } else {
                    io.to(p.id).emit('role', { role: "UNSCHULDIG", info: pick.w });
                }
            });
            io.to(roomName).emit('timerStart');
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Server läuft auf Port ' + PORT));
