module.exports = {
    create_turret,
    create_brick,
    create_factory,
    create_helm,
    create_ladder,
    create_building,
    create_hatch
}

const Matter = require('matter-js')
const Body = Matter.Body
const Query = Matter.Query
const Detector = Matter.Detector
const Composite = Matter.Composite
const Vector = Matter.Vector
const collision = require('./collision.js')
const Entity = require('./entity.js')


function create_building(width, height, image_key, options) {
    const entity = new Entity(width, height, image_key, options)
    const behaviour = (state) => ({
        can_build(pos) {
            let bodyA = state.body
            Body.setPosition(bodyA, {
                x: pos.left + state.offset.x,
                y: pos.top + state.offset.y
            })
            let bodies = Composite.allBodies(state.world)
            let can_collide_with = bodies.filter(
                bodyB => Detector.canCollide(bodyA.collisionFilter, bodyB.collisionFilter)
            )
            let collisions = Query.collides(bodyA, can_collide_with)
            let is_not_colliding = collisions.length == 0
            let bounds = state.parent.bounds
            let pos_is_inside_ship = bounds.left < pos.x 
                && bounds.right > pos.x
                && bounds.top < pos.y
                && bounds.bottom > pos.y
            
            console.log('Bounds', bounds)
            console.log('Pos', pos)
            return is_not_colliding && pos_is_inside_ship
        },

        build(pos_grid) {
            state.parent.add_entity_to_grid(state, pos_grid)
        },
    })

    return Object.assign(
        entity,
        behaviour(entity)
    )
}

function create_brick() {
    const building = create_building(
        1,
        1,
        'brick.png', 
        {
            isStatic: true,
        }   
    )
    building.is_background = true
    return building
}


function create_helm() {
    const building = create_building(
            2,
            2,
            'helm.png', 
            {
                isStatic: true,
            }   
    )

    const state = Object.assign(
        building,
        {
            is_background: true,
            used_by: null,
        }
    )

    const behaviour = (state) => ({
        set_used_by(value) {
            state._used_by = value
            if (state.parent) {
                state.parent.controlled_by = value
            }
        },

        get_used_by() {
            return state._used_by
        },

        left_button_down: {
            target(event) {
                return null
            },
            can_execute(event) {
                return !state.get_used_by() && !event.ship.controlled_by
            },
            execute(event) {
                state.set_used_by(event.from)
                event.ship.controlled_by = event.from
                event.from.using_building = state
            }
        }
    })

    return Object.assign(
        state,
        behaviour(state)
    )
}


function create_ladder() {
    return create_building(
        1, 
        1,
        'ladder.png',
        {
            isStatic: true,
            collisionFilter: collision.filter.BUILDING
        }
    )
}


function create_factory() {
    return create_building(
        2,
        2,
        'factory.png',
        {
            isStatic: true,
            collisionFilter: collision.filter.BUILDING
        }
    )
}


function create_hatch() {
    const building = create_building(
        1,
        1,
        'hatch.png',
        {
            isStatic: true,
            collisionFilter: collision.filter.BUILDING
        }
    )
    
    const state = {
        on_tick() {
            const item_to_add = this.parent.hatch_queue.shift()
            if (item_to_add) {
                this.parent.add_entity_to_grid(item_to_add, this.pos_grid)
            }
        }
    }

    return Object.assign(
        building,
        state
    )
}


function create_turret() {
    const building = create_building(
        3, 
        1,
        'brick.png',
        {
            isStatic: true,
            collisionFilter: collision.filter.BUILDING
        }
    )

    const state = {
        type: 'turret',
        barrel: create_barrel(),
        angle: 0,

        follow_point(point) {
            this.angle = Vector.angle(this.body.position, point)
            Body.setAngle(this.barrel.body, this.angle)
        },

        can_build(pos) {
            const ship_bounds = this.parent.bounds
            const is_left_wall = pos.left == ship_bounds.left 
            const is_right_wall = pos.right == ship_bounds.right 
            const is_vertical_wall = is_left_wall || is_right_wall
            const is_top_wall = pos.top == ship_bounds.top 
            const is_bottom_wall = pos.bottom == ship_bounds.bottom 
            const is_horizontal_wall = is_top_wall || is_bottom_wall

            const body = this.body
            const barrel = this.barrel.body
            if (is_top_wall) {
                const angle = 0
                Body.setAngle(body, angle)
                Body.setPosition(body, {
                    x: pos.left + this.offset.x,
                    y: pos.top + this.offset.y
                })

                Body.setAngle(barrel, 0 - Math.PI / 2)
                Body.setPosition(barrel, {
                    x: pos.left + this.offset.x,
                    y: pos.top + this.offset.y - this.offset.x,
                })
            } else if (is_right_wall) {
                const angle = 1 * Math.PI / 2
                Body.setAngle(body, angle)
                Body.setPosition(body, {
                    x: pos.left + this.offset.y,
                    y: pos.top + this.offset.x
                })

                Body.setAngle(barrel, angle - Math.PI / 2)
                Body.setPosition(barrel, {
                    x: pos.left + this.offset.y + this.offset.x,
                    y: pos.top  + this.offset.x,
                })
            } else if (is_bottom_wall) {
                Body.setAngle(body, 2 * Math.PI / 2)
                Body.setPosition(body, {
                    x: pos.left + this.offset.x,
                    y: pos.top + this.offset.y
                })
                
                Body.setAngle(barrel, 1 * Math.PI / 2)
                Body.setPosition(barrel, {
                    x: pos.left + this.offset.x,
                    y: pos.top + this.offset.y + this.offset.x,
                })
            } else if (is_left_wall) {
                Body.setAngle(body, 3 * Math.PI / 2)
                Body.setPosition(body, {
                    x: pos.left + this.offset.y,
                    y: pos.top + this.offset.x
                })

                Body.setAngle(barrel, 2 * Math.PI / 2)
                Body.setPosition(barrel, {
                    x: pos.left + this.offset.y - this.offset.x,
                    y: pos.top + this.offset.x,
                })
            } else {
                Body.setAngle(body, 0)
                Body.setPosition(body, {
                    x: pos.left + this.offset.x,
                    y: pos.top + this.offset.y
                })

                Body.setAngle(barrel, 0)
                Body.setPosition(barrel, {
                    x: pos.left + this.offset.x,
                    y: pos.top + this.offset.y,
                })
            }

            const is_corner = is_vertical_wall && is_horizontal_wall
            if (is_corner || !(is_vertical_wall || is_horizontal_wall)) {
                return false
            }

            return true
        },

        build(pos_grid) {
            this.parent.add_entity(this)
            this.parent.add_entity(this.barrel)
        }
    }

    return Object.assign(
        building,
        state
    )
}

function create_barrel() {
    return create_building(
        3, 
        0.5,
        'turret_barrel.png',
        {
            isStatic: true
        }
    )
}