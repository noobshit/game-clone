var mouse = {
    game_pos: { 
        x: 0, 
        y: 0
    },

    get_game_pos: function(e) {
        let screenX = e.offsetX
        let screenY = e.offsetY
    
        var matrix = displayer.ctx.getTransform();
        let inverted = matrix.invertSelf()
        let pos = {
            x: screenX * inverted.a + screenY * inverted.c + inverted.e,
            y: screenX * inverted.b + screenY * inverted.d + inverted.f
        }
        return pos
    },

    on_move: function(e) {
        mouse.game_pos = mouse.get_game_pos(e)
    },

    on_wheel: function(e) {
        if (e.deltaY < 0) {
            displayer.zoom_in()
        } else {
            displayer.zoom_out()
        }
    },

    init: function() {
        window.onmousemove = mouse.on_move
        window.onwheel = mouse.on_wheel
    },
}
mouse.init()

var keyboard = {
    is_key_pressed: {},

    init: function() {
        window.onkeyup = e => keyboard.is_key_pressed[e.key] = false
        window.onkeydown = e => keyboard.is_key_pressed[e.key] = true
    },

}
keyboard.init()