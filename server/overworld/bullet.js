module.exports.create_bullet = create_bullet

const create_entity = require('../entity.js')

function create_bullet(lifetime=1500) {
    const entity = create_entity({
            width: 1,
            height: 1,
            image_key: 'wrench.png'
    })

    const state = {
        lifetime,
        created: Date.now(),
        damage: 100,
    }

    entity.events.on('tick', function() {
        const has_expired = entity.created + entity.lifetime < Date.now()
        if (has_expired && entity.parent) {
            entity.parent.remove_entity(entity)
        }
    })

    entity.events.on('collision_start', function(event) {
        if (event.collided_with.hp > 0) {
            event.collided_with.events.emit('damage', {amount: entity.damage})
        } 
        entity.parent.remove_entity(entity)
    })

    return Object.assign(
        entity, 
        state
    )
    
}