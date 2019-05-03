const express = require('express')
const app = express();
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html')
})
app.use('/client', express.static(__dirname + '/client'))
app.use('/shared', express.static(__dirname + '/shared'))

const server = require('http').createServer(app);
let port = 2000
console.log(`running on port ${port}`);
server.listen(port);

var sockets = []
const io = require('socket.io')(server);
const game = require('./server/game.js')
const events = game.events

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
    socket.on('menu_choice', data => events.on_menu_choice(id, data))
    sockets.push(socket)
})

function tick() {
    sockets = sockets.filter(socket => socket.connected)

    game.tick()

    sockets.forEach(socket => {
        let player = game.players.get(socket.id)
        socket.emit('update', {
            entites: player.parent.get_display_data(),
            player: player.get_display_data(),
            cursor: player.cursor,
            map: game.get_map(),
        })
    })
}
setInterval(tick, 1000/60)