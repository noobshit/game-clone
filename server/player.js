module.exports = create_player

const {Box} = require('./box.js')
const Cursor = require('../shared/cursor.js')
const collision = require('./collision.js')
const create_entity = require('./entity.js')
const Matter = require('matter-js')
const Body = Matter.Body
const World = Matter.World
const Constraint = Matter.Constraint

function create_player(socket) {
    const entity = create_entity(
        0.8,
        1.6,
        null,
        {
            friction: 0.5,
            frictionStatic: 0.1,
            restitution: 0.5,
            collisionFilter: collision.filter.PLAYER
        }
    )

    const state = {
        socket,
        item: null,
        using_building: null,
        speed: 5,
    
        send_debug_message(msg) {
            this.socket.emit('debug_answer', msg)
        },
    
        update_cursor(event) {
            if (this.item && this.item.use.can_execute(event)) {
                this.cursor = this.item.get_cursor(event)
            } else if (this.grab_item.can_execute(event)) {
                this.cursor = Cursor.create(
                    Cursor.type.GRAB, 
                    {
                        can_use: true,
                        target: this.grab_item.target(event).get_display_data(),
                    })
            } else if (event.entites.some(e => e.left_button_down.can_execute(event))) {
                let entity = event.entites.find(e => e.left_button_down.can_execute(event))
                this.cursor = entity.get_cursor()
            } else if (this.item) {
                this.cursor = this.item.get_cursor(event)
            } else if (this.grab_item.target(event) != null) {
                this.cursor = Cursor.create(Cursor.type.GRAB, {can_use: false})
            } else {
                this.cursor = Cursor.create(Cursor.type.DEFAULT)
            }
        },
    
        on_left_button_down(event) {
            if (this.parent.controlled_by == this) {
                this.parent.fire(event)
            }
            else if (this.item && this.item.use.can_execute(event)) {
                this.item.use.execute(event)
            }
            else if (this.grab_item.can_execute(event)) {
                this.grab_item.execute(event)
            } else {
                let entity = event.entites.find(e => e.left_button_down.can_execute(event))
                if (entity) {
                    entity.left_button_down.execute(event)
                }
            }
        },
    
        on_remove(event) {
            if (this.drop_item.can_execute(event)) {
                this.drop_item.execute(event)
            }
        },
    
        grab_item: {
            target({entites}) {
                return entites.find(e => e.is_box)
            },
            can_execute({player, entites}) {
                return player.item == null 
                && this.target({entites})
            },
            execute(event) {
                const {player} = event
                let entry = this.target(event)
                player.item = entry
                entry.holded_by = player
                player.item.collisionFilter = player.item.body.collisionFilter
                player.item.body.collisionFilter = collision.filter.TRANSPARENT
                Body.setPosition(player.item.body, player.body.position)
                let constraint = Constraint.create({
                    bodyA: player.body,
                    bodyB: player.item.body
                })
                player.item.constraint = constraint
                World.add(player.get_world(), constraint)
            }    
        },
        
        drop_item: {
            can_execute({player}) {
                return player.item != null || player.using_building
            },
            execute({player}) {
                if (player.using_building) {
                    player.using_building.set_used_by(null)
                    player.using_building = null
                }
                else if (player.item != null) {
                    player.item.holded_by = null
                    player.item.body.collisionFilter = player.item.collisionFilter
                    delete player.item.collisionFilter
                    World.remove(player.get_world(), player.item.constraint)
                    delete player.item.constraint
                    player.item = null
                } 
            }
        
        },
    }

    Body.setInertia(entity.body, Infinity)

    return Object.assign(
        entity,
        state
    )
}