module.exports = {
    show_factory_menu
}

function show_factory_menu(player, options) {
    player.socket.emit('show_menu', options)
}