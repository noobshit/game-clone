module.exports.create_loot = create_loot

const create_entity = require('../entity.js')

function create_loot(item) {
    const entity = create_entity({
        width: 3, 
        height: 3,
        image_key: 'loot.png'
    })
    const loot = {
        item
    }

    entity.events.on('collision_start', function(event) {
        if (event.collided_with.is_ship) {
            event.collided_with.gather_loot(entity.item)
            entity.parent.remove_entity(entity)
        }
    })

    return Object.assign(
        entity,
        loot
    )
}