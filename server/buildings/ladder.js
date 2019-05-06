module.exports.create_ladder = create_ladder

const collision = require('../collision.js')
const {create_building} = require('./building')

function create_ladder() {
    const building = create_building({
        width: 1, 
        height: 1,
        image_key: 'ladder.png',
        options: {
            isStatic: true,
            collisionFilter: collision.filter.BUILDING
        }
    })

    const state = {
        factory_function: create_ladder,
    }

    return Object.assign(
        building,
        state
    )
}