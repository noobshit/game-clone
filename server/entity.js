const SMALL_BLOCK_SIZE = 32
const Matter = require('matter-js')
const Body = Matter.Body
const Bodies = Matter.Bodies

const Cursor = require('../shared/cursor.js')
const Pos = require('./pos.js')

class Entity {
    constructor(width, height, image_key, options={}) {
        width *= SMALL_BLOCK_SIZE 
        height *= SMALL_BLOCK_SIZE
        this.width = width
        this.height = height
        this.image_key = image_key
        this.body = Bodies.rectangle(0, 0, width, height, options)
        this.id = this.generate_id()
        this.parent = null
        this.holded_by = null
        this.is_background = false
    }

    get world() {
        if (this.parent != null) {
            return this.parent.world
        } else {
            return null
        }
    }

    get bounds() {
        return {
            left: 0,
            right: 0 + this.width * SMALL_BLOCK_SIZE,
            top: 0,
            bottom: 0 + this.height * SMALL_BLOCK_SIZE,
        }
    }

    get position() {
        let pos = this.body.position
        return {
            x: pos.x,
            y: pos.y,
            left: pos.x - this.width * SMALL_BLOCK_SIZE / 2,
            top: pos.y - this.height * SMALL_BLOCK_SIZE / 2
        }
    }
    
    get pos_grid() {
        return Pos.to_grid(this.body.position)
    }

    get pos_world() {
        if (this.parent) {
            return {
                x: this.body.position.x + this.parent.position.left,
                y: this.body.position.y + this.parent.position.top 
            }
        } else {
            return this.body.position
        }
    }
    get offset() {
        return {
            x: this.width / 2,
            y: this.height / 2
        }
    }

    get_entity() {
        return {
            id: this.id,
            x: this.pos_world.x,
            y:  this.pos_world.y,
            width: this.width,
            height: this.height,
            angle: this.body.angle,
            image_key: this.image_key,
            is_background: this.is_background
        }
    }

    generate_id() {
        if (!Entity.ids) {
            Entity.ids = new Set()
        }

        let id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        if (Entity.ids.has(id)) {
            return this.generate_id()
        } else {
            Entity.ids.add(id)
            return id
        }
    }

    translate(vector) {
        Body.translate(this.body, vector)
    }

    get left_button_down() {
        return {
            target: _ => null,
            can_execute: _ => false,
            execute: _ => {}
        }
    }

    get use() {
        return {
            target: _ => null,
            can_execute: _ => false,
            execute: _ => {} 
        }
    }

    get_cursor(event) {
        let target = this.use.target(event)
        if (target && target instanceof Entity) {
            target = target.get_entity()
        }
        return new Cursor(
            Cursor.type.DEFAULT, {
                target,
                can_use: this.use.can_execute(event)
            })
    }

    on_remove() {
        if (this.holded_by != null) {
            const player = this.holded_by
            if (player.drop_item.can_execute()) {
                player.drop_item.execute()
            }
        }
    }

    on_tick() {

    }

    on_collision_start(event) {
        console.log(this.image_key)
    }
}

module.exports = Entity