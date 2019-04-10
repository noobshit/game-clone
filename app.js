const express = require('express')
const app = express();
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html')
})
app.use('/client', express.static(__dirname + '/client'))

const server = require('http').createServer(app);
let port = 2000
console.log(`running on port ${port}`);
server.listen(port);

var sockets = []
const io = require('socket.io')(server);

const bound = 500
io.on('connection', (socket) => { 
    sockets.push(socket)
    console.log('connection')
    socket.player = {
        x: Math.random() * bound,
        y: Math.random() * bound,
        width: 10 + Math.random() * 20, 
        height: 10 + Math.random() * 20,
        speed: 3
    }

    socket.on('debug', (cmd) => {
        let data = eval(cmd)
        console.log(data)
        socket.emit('debug_answer', data)
    })

    socket.on('input', (data) => {
        if (data.move_left) {
            socket.player.x -= socket.player.speed 
            socket.player.x %= bound
        } 
        if (data.move_right) {
            socket.player.x += socket.player.speed 
            socket.player.x %= bound
        }
        if (data.move_up) {
            socket.player.y -= socket.player.speed 
            socket.player.y %= bound
        }
        if (data.move_down) {
            socket.player.y += socket.player.speed 
            socket.player.y %= bound
        }
    })
})

function tick() {
    sockets = sockets.filter(socket => socket.connected)

    players = sockets.map(socket => socket.player)

    sockets.forEach(socket => {
        socket.emit('update', {
            entites: players,
            player: socket.player
        })
    })
}
setInterval(tick, 1000/60)