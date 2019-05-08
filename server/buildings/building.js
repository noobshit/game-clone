module.exports.create_building = create_building

const Matter = require('matter-js')
const Body = Matter.Body
const Query = Matter.Query
const Detector = Matter.Detector
const Composite = Matter.Composite
const create_entity = require('../entity.js')
const Pos = require('../pos.js')


function create_building({width, height, image_key, options}) {
    const entity = create_entity({width, height, image_key, options})
    const behaviour = (state) => ({
        is_building: true,

        can_build(pos) {
            let bodyA = state.body
            Body.setPosition(bodyA, {
                x: pos.left + state.offset.x,
                y: pos.top + state.offset.y
            })
            let bodies = Composite.allBodies(state.get_world())
            let can_collide_with = bodies.filter(
                bodyB => Detector.canCollide(bodyA.collisionFilter, bodyB.collisionFilter)
            )
            let collisions = Query.collides(bodyA, can_collide_with)
            let is_not_colliding = collisions.length == 0
            let bounds = state.parent.bounds
            return is_not_colliding && Pos.is_inside(pos, bounds)
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



