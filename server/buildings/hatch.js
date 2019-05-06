module.exports.create_hatch = create_hatch

const Matter = require('matter-js')
const Body = Matter.Body
const Query = Matter.Query
const Detector = Matter.Detector
const Composite = Matter.Composite
const Vector = Matter.Vector
const collision = require('../collision.js')
const create_entity = require('../entity.js')
const Pos = require('../pos.js')
const {create_building} = require('./building')

function create_hatch() {
    const building = create_building({
        width: 1,
        height: 1,
        image_key: 'hatch.png',
        options: {
            isStatic: true,
            collisionFilter: collision.filter.BUILDING
        }
    })
    
    const state = {
        factory_function: create_hatch,
    }

    building.events.on('tick', function() {
        const item_to_add = building.parent.hatch_queue.shift()
        if (item_to_add) {
            building.parent.add_entity_to_grid(item_to_add, building.pos_grid)
        }
    })

    return Object.assign(
        building,
        state
    )
}

