var socket = io()
socket.on('debug_answer', function(data) {
    console.log(data)
})

socket.on('update', (data) => {
    state.entites = data.entites
    state.player = data.player
})

function debug(cmd) {
    socket.emit('debug', cmd)
}