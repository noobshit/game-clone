module.exports = {
    show_factory_menu
}

function show_factory_menu({player, data}) {
    player.socket.emit('show_menu', data)
}