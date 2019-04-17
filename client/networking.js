var socket = io()
socket.on('debug_answer', function(data) {
    console.log(data)
})

socket.on('update', (data) => {
    state.entites = data.entites
    state.player = data.player
    state.cursor = data.cursor

    state.entites.forEach(add_data)
    if (state.cursor && state.cursor.data) {
        add_data(state.cursor.data)
    }

    if (state.cursor && state.cursor.target) {
        add_data(state.cursor.target)
    }
})

function debug(cmd) {
    socket.emit('debug', cmd)
}

function add_data(entity) {
    entity.left = entity.x - entity.width / 2
    entity.top = entity.y - entity.height / 2
}