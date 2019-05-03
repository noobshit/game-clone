module.exports = {
    show_factory_menu
}

function show_factory_menu(player, entity, options) {
    player.socket.emit('show_menu', {
        options,
        menu_owner: entity.id
    })
}