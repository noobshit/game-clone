module.exports = create_box

const create_entity = require('../entity.js')
const collison = require('../collision.js')

function create_box(image_key) {
    const entity = create_entity(
        0.8,
        0.8,
        image_key,
        {
            collisionFilter: collison.filter.MOBILE
        }
    )

    const state = {
        is_box: true
    }

    return Object.assign(
        entity,
        state
    )
}




