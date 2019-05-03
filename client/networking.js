var socket = io()
socket.on('debug_answer', function(data) {
    console.log(data)
})

socket.on('update', (data) => {
    state.entites = data.entites
    state.player = data.player[0]
    state.cursor = data.cursor 
    state.map = data.map

    state.entites.forEach(add_data)
    if (state.cursor && state.cursor.data) {
        state.cursor.data.forEach(add_data)
    }

    if (state.cursor && state.cursor.target) {
        state.cursor.target.forEach(add_data)
    }
})

socket.on('show_menu', (data) => {
    console.log('show_menu', data)
    show_factory_menu(data)
})

function debug(cmd) {
    socket.emit('debug', cmd)
}

function add_data(entity) {
    entity.left = entity.x - entity.width / 2
    entity.top = entity.y - entity.height / 2
}

function send_menu_choice(command, option, amount) {
    socket.emit('menu_choice', {
        command,
        option,
        amount
    })
}