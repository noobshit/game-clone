module.exports.generate_loot = generate_loot
const {create_metal, create_explo} = require('../items')
const {create_loot} = require('./loot')

function generate_loot({
    min_items,
    max_items,
    entity,
    loot_list = [create_explo, create_metal]
}) {
    const length = Math.floor(Math.random() * (max_items - min_items)) + min_items
    for (let i = 0; i < length; i++) {
        let index = Math.floor(Math.random() * loot_list.length)
        const item = loot_list[index]()
        entity.parent.add_entity_to_pos(
            create_loot(item), 
            entity.pos_world
        )
    }
}
    