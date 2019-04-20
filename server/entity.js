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

    get pos_grid() {
        return Pos.to_grid(this.body.position)
    }

    get offset() {
        return {
            x: this.width / 2,
            y: this.height / 2
        }
    }

    get_entity() {
        let offset = {x: 0, y: 0}
        if (this.parent) {
            offset.x = this.parent.position.left
            offset.y = this.parent.position.top 
        }
        return {
            id: this.id,
            x: offset.x + this.body.position.x,
            y:  offset.y + this.body.position.y,
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
    }
}

module.exports = Entity