var displayer = {
    init: function(canvas) {
        displayer.canvas = canvas
        displayer.ctx = canvas.getContext("2d")
        displayer.scale = 1
        let image_files = [
            'brick.png',
            'enlargment.png',
            'explo.png',
            'factory.png',
            'hatch.png',
            'helm.png',
            'ladder.png',
            'metal.png',
            'repair.png',
            'shredder.png',
            'wrench.png'
        ]
        displayer.images = new Map()

        for (let key of image_files) {
            let img = new Image
            img.src = `/client/img/${key}`
            displayer.images.set(key, img)
        }
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
        if (entity.image_key) {
            displayer.ctx.save()
            displayer.ctx.translate(entity.x, entity.y)
            displayer.ctx.rotate(entity.angle)
            
            let offset =  {
                x: entity.width / 2,
                y: entity.height / 2
            }
            let image = displayer.images.get(entity.image_key)
            displayer.ctx.drawImage(image, -offset.x, -offset.y, entity.width, entity.height)
            displayer.ctx.restore()
            
        } else {
            displayer.ctx.save()
            displayer.ctx.translate(entity.x, entity.y)
            displayer.ctx.rotate(entity.angle)
            
            let offset =  {
                x: entity.width / 2,
                y: entity.height / 2
            }
            let image = displayer.images.get(entity.image_key)
            displayer.ctx.fillRect(
                -offset.x,
                -offset.y,
                entity.width,
                entity.height
            )
            displayer.ctx.restore()
        }
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
