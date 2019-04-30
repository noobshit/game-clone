const SMALL_BLOCK_SIZE = 32
const Matter = require('matter-js')
const EventEmmiter = require('events')
const Body = Matter.Body
const Bodies = Matter.Bodies

const Cursor = require('../shared/cursor.js')
const Pos = require('./pos.js')

const Entity = {}
function create_entity(width, height, image_key, options={}) {
    
    width *= SMALL_BLOCK_SIZE
    height *= SMALL_BLOCK_SIZE

    const state = {
        width,
        height,
        image_key,
        events: new EventEmmiter(),
        body: Bodies.rectangle(0, 0, width, height, options),
        parent: null,
        holded_by: null,
        is_background: false,
        hp_max: 0,
        hp: 0,
        type: 'entity',

        left_button_down: {
            target: _ => null,
            can_execute: _ => false,
            execute: _ => {}
        },

        get_world() {
            if (this.parent != null) {
                return this.parent.get_world()
            } else {
                return null
            }
        },

        get bounds() {
            const {x, y} = this.position
    
            return {
                left: this.body.bounds.min.x - x + this.offset.x,
                right: this.body.bounds.max.x - x + this.offset.x,
                top: this.body.bounds.min.y - y + this.offset.y,
                bottom: this.body.bounds.max.y - y + this.offset.y,
            }
        },

        get position() {
            let pos = this.body.position
            return {
                x: pos.x,
                y: pos.y,
                left: pos.x - this.width / 2,
                top: pos.y - this.height / 2
            }
        },
        
        get pos_grid() {
            return Pos.to_grid(this.body.position)
        },

        get pos_world() {
            if (this.parent && this.parent.position) {
                return {
                    x: this.body.position.x + this.parent.position.left,
                    y: this.body.position.y + this.parent.position.top 
                }
            } else {
                return this.body.position
            }
        },
        
        get offset() {
            return {
                x: this.width / 2,
                y: this.height / 2
            }
        },

        get_display_data() {
            return [{
                id: this.id,
                x: this.pos_world.x,
                y:  this.pos_world.y,
                width: this.width,
                height: this.height,
                angle: this.body.angle,
                image_key: this.image_key,
                is_background: this.is_background
            }]
        },

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
        },

        translate(vector) {
            Body.translate(this.body, vector)
        },

        use: {
            target: _ => null,
            can_execute: _ => false,
            execute: _ => {} 
        },

        get_cursor(event) {
            let target = this.use.target(event)
            if (target) {
                target = target.get_display_data()
            }
            return Cursor.create(
                Cursor.type.DEFAULT, {
                    target,
                    can_use: this.use.can_execute(event)
                })
        },

        set_parent(value) {
            this.parent = value
        },

        on_collision_start(event) {

        },
    }

    state.body.entity = state
    state.id = state.generate_id()

    state.events.on('remove', (event) => {
        if (state.holded_by != null) {
            const player = state.holded_by
            if (player.drop_item.can_execute({player, entites: [state]})) {
                player.drop_item.execute({player, entites: [state]})
            }
        }
    })

    state.events.on('damage', ({amount}) => {
        state.hp -= amount
        if (state.hp <= 0) {
            state.events.emit('death')
        }
    })
    return state
}

module.exports = create_entity