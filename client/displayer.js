var displayer = {
    init(canvas) {
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
            'wrench.png',
            'turret_barrel.png',
            'loot.png',
            'bot.png'
        ]
        displayer.images = new Map()

        for (let key of image_files) {
            let img = new Image
            img.src = `/client/img/${key}`
            displayer.images.set(key, img)
        }
    },

    clear() {
        displayer.ctx.setTransform(1, 0, 0, 1, 0, 0)
        displayer.ctx.clearRect(0, 0, displayer.canvas.width, displayer.canvas.height)
    },
    
    center_camera_on_entity(entity) {
        displayer.ctx.scale(displayer.scale, displayer.scale)
        displayer.ctx.translate(-entity.x, -entity.y)
        displayer.ctx.translate(
            displayer.canvas.width / displayer.scale / 2, 
            displayer.canvas.height / displayer.scale / 2
        )
    },

    draw_cursor(cursor) {
        if (!cursor) {
            return
        }

        displayer.canvas.style.cursor = 'default'
        displayer.ctx.save()
        if (cursor.action == Cursor.type.BUILD) {
            displayer.ctx.globalAlpha = 0.65
            for (let building of cursor.data) {
                displayer.draw_entity(building)
                if (cursor.can_use) {
                    displayer.ctx.fillStyle = '#00FF0055'
                    displayer.canvas.style.cursor = 'pointer'
                } else {
                    displayer.ctx.fillStyle = '#FF000055'
                    displayer.canvas.style.cursor = 'not-allowed'        
                }
                displayer.ctx.save()
                let offset =  {
                    x: building.width / 2,
                    y: building.height / 2
                }
                displayer.ctx.translate(building.x, building.y)
                displayer.ctx.rotate(building.angle)
                displayer.ctx.fillRect(-offset.x, -offset.y, building.width, building.height)
                displayer.ctx.restore()
            }
        } else if (cursor.target) {
            let target = cursor.target[0]
            if (cursor.can_use) {
                displayer.ctx.strokeStyle = '#00FF0055'
                displayer.canvas.style.cursor = 'pointer'
            } else {
                displayer.ctx.strokeStyle = '#FF000055'
                displayer.canvas.style.cursor = 'not-allowed'
            }
            displayer.ctx.lineWidth = 5
            displayer.ctx.strokeRect(target.left, target.top, target.width, target.height)
        } else {
            displayer.canvas.style.cursor = 'default'
        }
        displayer.ctx.restore()
    },
    
    draw_entity(entity) {
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
            displayer.ctx.fillStyle = '#00000088'
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

        if (entity.task) {
            displayer.ctx.save()
            
            const offset =  {
                x: entity.width / 2,
                y: entity.height / 2
            }

            displayer.ctx.translate(entity.x, entity.y)
            const task_bar_pos = {
                x: -offset.x + entity.width * 0.05,
                y: -offset.y - 12,
                width: entity.width * 0.9,
                height: 10
            }
            displayer.ctx.fillRect(
                task_bar_pos.x,
                task_bar_pos.y,
                task_bar_pos.width,
                task_bar_pos.height
            )

            displayer.ctx.fillStyle = '#00FF00FF'
            displayer.ctx.fillRect(
                task_bar_pos.x,
                task_bar_pos.y,
                task_bar_pos.width * entity.task.percent_done / 100,
                task_bar_pos.height
            )
            displayer.ctx.restore()
        }
    },

    zoom_in() {
        displayer.scale *= 1.09
    },
    
    zoom_out() {
        displayer.scale *= 0.9
        displayer.scale = Math.max(0.03, displayer.scale)
    },

}
displayer.init(document.querySelector("#canvas"))