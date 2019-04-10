var displayer = {
    init: function(canvas) {
        displayer.canvas = canvas
        displayer.ctx = canvas.getContext("2d")
        displayer.scale = 1
    },

    clear: function() {
        displayer.ctx.setTransform(1, 0, 0, 1, 0, 0)
        displayer.ctx.clearRect(0, 0, displayer.canvas.width, displayer.canvas.height)
    },
    
    center_camera_on_entity: function(entity) {
        displayer.ctx.scale(displayer.scale, displayer.scale)
        displayer.ctx.translate(-entity.x, -entity.y)
        displayer.ctx.translate(
            displayer.canvas.width / displayer.scale / 2, 
            displayer.canvas.height / displayer.scale / 2
        )
    },
    
    draw_entity: function(entity) {
        displayer.ctx.fillRect(
            entity.x,
            entity.y,
            entity.width,
            entity.height
        )
    },

    zoom_in: function() {
        displayer.scale *= 1.09
    },
    
    zoom_out: function() {
        displayer.scale *= 0.9
        displayer.scale = Math.max(0.03, displayer.scale)
    },

}
displayer.init(document.querySelector("#canvas"))