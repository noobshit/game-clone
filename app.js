const Engine = require('matter-js').Engine


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
    events.on_connection(id, socket)

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

    game.tick()
    Engine.update(game.ship.engine)
    let players = [] //Array.from(game.players.values()).map(player => player.get_entity())
    let entites = game.ship.get_entites()
    entites = entites.concat(players)

    sockets.forEach(socket => {
        let player = game.players.get(socket.id)
        socket.emit('update', {
            entites: entites,
            player: player.get_entity(),
            cursor: player.cursor,
        })
    })
}
setInterval(tick, 1000/120)