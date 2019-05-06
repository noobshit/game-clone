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

const io = require('socket.io')(server);
const game = require('./server/game.js')
game.init(io)
