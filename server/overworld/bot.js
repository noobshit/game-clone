module.exports.create_bot = create_bot

const create_entity = require('../entity.js')
const {create_bullet} = require('./bullet.js')
const {generate_loot} = require('./loot_generator')

function create_bot() {
    const entity = create_entity({
        width: 8, 
        height: 8, 
        image_key:'bot.png'
    })
    const bot = {
        hp_max: 1000,
        hp: 1000,
    }

    entity.events.on('tick', function() {
        if (Math.random() < 1 / 5) {
            const bullet = create_bullet(1500)
            entity.parent.add_entity_to_random_pos(bullet)
        }
    })

    entity.events.on('death', function() {
        generate_loot({
            entity,
            min_items: 2,
            max_items: 2,
        })
        entity.hp = entity.hp_max
        entity.parent.set_random_position_of(entity)
    })

    return Object.assign(
        entity, 
        bot
    )
}
