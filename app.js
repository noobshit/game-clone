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
const game = require('./server/game.js')
const events = game.events

const bound = 500
io.on('connection', (socket) => { 
    let {id} = socket
    events.on_connection(id)

    socket.on('debug', function(cmd){
        let data = eval(cmd)
        console.log(data)
        socket.emit('debug_answer', data)
    })
    socket.on('input', data => events.on_input(id, data))
    socket.on('disconnect', data => events.on_disconnect(id))
    sockets.push(socket)
})

function tick() {
    sockets = sockets.filter(socket => socket.connected)

    players = game.players

    sockets.forEach(socket => {
        socket.emit('update', {
            entites: Array.from(players.values()),
            player: players.get(socket.id)
        })
    })
}
setInterval(tick, 1000/20)