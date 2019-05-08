module.exports.create_bot = create_bot

const create_entity = require('../entity.js')
const Matter = require('matter-js')
const {create_bullet} = require('./bullet.js')
const {create_metal, create_explo} = require('../items')
const {create_loot} = require('./loot')
const Body = Matter.Body

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
        if (Math.random() < 1 / 20) {
            const bullet = create_bullet(1500)
            const pos = {
                x: Math.random() * 2000,
                y: Math.random() * 2000
            }

            entity.parent.add_entity_to_pos(bullet, pos)
        }
    })

    entity.events.on('death', function() {
        const length = Math.floor(Math.random() * 5) + 1
        for (let i = 0; i < length; i++) {
            let index = Math.floor(Math.random() * 2)
            const item = [create_metal, create_explo][index]()
            entity.parent.add_entity_to_pos(create_loot(item), entity.pos_world)
        }
        
        entity.hp = entity.hp_max
        const x = Math.random() * 3000
        const y = Math.random() * 3000
        Body.setPosition(entity.body, {x, y})
    })

    return Object.assign(
        entity, 
        bot
    )
}
