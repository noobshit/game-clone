const Entity = require('./entity.js')
const collison = require('./collision.js')

class Box extends Entity {
    constructor(image_key) {
        super(
            0.8,
            0.8,
            image_key,
            {
                collisionFilter: collison.filter.mobile
            }
        )
    }
}

module.exports = Box