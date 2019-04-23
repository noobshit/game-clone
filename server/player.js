const Box = require('./box.js')
const Cursor = require('../shared/cursor.js')
const collision = require('./collision.js')
const Entity = require('./entity.js')
const Matter = require('matter-js')
const Body = Matter.Body
const World = Matter.World
const Constraint = Matter.Constraint

class Player extends Entity {
    constructor(socket) {
        super(
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
        
        this.item = null
        this.socket = socket
        this.speed = 5
        this.using_building = null
        Body.setInertia(this.body, Infinity)
    }

    send_debug_message(msg) {
        this.socket.emit('debug_answer', msg)
    }

    update_cursor(event) {
        if (this.item && this.item.use.can_execute(event)) {
            this.cursor = this.item.get_cursor(event)
        } else if (this.grab_item.can_execute(event)) {
            this.cursor = new Cursor(
                Cursor.type.GRAB, 
                {
                    can_use: true,
                    target: this.grab_item.target(event).get_entity(),
                })
        } else if (event.entites.some(e => e.left_button_down.can_execute(event))) {
            let entity = event.entites.find(e => e.left_button_down.can_execute(event))
            this.cursor = entity.get_cursor()
        } else if (this.item) {
            this.cursor = this.item.get_cursor(event)
        } else if (this.grab_item.target(event) != null) {
            this.cursor = new Cursor(Cursor.type.GRAB, {can_use: false})
        } else {
            this.cursor = new Cursor(Cursor.type.DEFAULT)
        }
    }

    on_left_button_down(event) {
        if (this.item && this.item.use.can_execute(event)) {
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
    }

    on_remove() {
        if (this.drop_item.can_execute()) {
            this.drop_item.execute()
        }
    }

    get grab_item() {
        let player = this
        return {
            target(event) {
                return event.entites.find(e => e instanceof Box)
            },
            can_execute(event) {
                return player.item == null 
                && event.entites.some(e => e instanceof Box)
            },
            execute(event) {
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
                World.add(player.world, constraint)
            }    
        }
    }
    
    get drop_item() {
        let player = this
        return {
            can_execute(event) {
                return player.item != null || player.using_building
            },
            execute(event) {
                if (player.using_building) {
                    player.using_building.used_by = null
                    player.using_building = null
                }
                else if (player.item != null) {
                    player.item.holded_by = null
                    player.item.body.collisionFilter = player.item.collisionFilter
                    delete player.item.collisionFilter
                    World.remove(player.world, player.item.constraint)
                    delete player.item.constraint
                    player.item = null
                } 
            }
        }
    }
}

module.exports = Player