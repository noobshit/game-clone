var mouse = {
    is_button_pressed: new Map(),
    entites_ids: [],

    game_pos: { 
        x: 0, 
        y: 0
    },

    get_entites_under_cursor: function() {
        return state.entites.filter(entity => pos.is_inside_entity(mouse.game_pos, entity))
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
        mouse.entites_ids = mouse.get_entites_under_cursor().map(e => e.id)
    },

    on_wheel: function(e) {
        if (e.deltaY < 0) {
            displayer.zoom_in()
        } else {
            displayer.zoom_out()
        }
    },

    on_down: function(e) {
        mouse.is_button_pressed.set(e.button, true)
        return false
    },

    on_up: function(e) {
        mouse.is_button_pressed.set(e.button, false)
    },

    init: function() {
        window.onmousemove = mouse.on_move
        window.onmousedown = mouse.on_down
        window.onmouseup = mouse.on_up
        window.oncontextmenu = () => false // mouse.on_down
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


var pos = {
    is_inside_entity: function(game_pos, entity) {
        let dx = game_pos.x - entity.x
        let dy = game_pos.y - entity.y
        // distance between the point and the center of the rectangle
        let h1 = Math.sqrt(dx * dx + dy * dy);
        let currA = Math.atan2(dy, dx);
        // Angle of point rotated around origin of rectangle in opposition
        let newA = currA - entity.angle;
        // New position of mouse point when rotated
        let x2 = Math.cos(newA) * h1;
        let y2 = Math.sin(newA) * h1;
        // Check relative to center of rectangle
        return (
            x2 > -0.5 * entity.width 
            && x2 < 0.5 * entity.width 
            && y2 > -0.5 * entity.height 
            && y2 < 0.5 * entity.height
        )
    }
}