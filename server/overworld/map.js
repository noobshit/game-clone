
module.exports.create_game_map = create_game_map

const Matter = require('matter-js')
const {create_world} = require('../world.js')
const {create_metal, create_explo} = require('../items')
const {create_bot} = require('./bot.js')
const {create_block} = require('./block.js')
const {create_loot} = require('./loot')
const Body = Matter.Body

const SMALL_BLOCK_SIZE = 32

function create_game_map(width, height) {
    const state = {
        width,
        height,
        entites: [],

        get world() {
            return this.engine.world
        },
        
        add_block(pos_grid) {
            this.add_entity_to_pos(create_block(), {
                x: pos_grid.x * 8 * SMALL_BLOCK_SIZE, 
                y: pos_grid.y * 8 * SMALL_BLOCK_SIZE
            })
        },
    
        add_entity_to_pos(entity, pos) {
            Body.setPosition(entity.body, pos)
            this.add_entity(entity)
        },
    
        get_display_data() {
            return this.entites.map(e => e.get_display_data()).flat()
        },
    
        add_ship(ship) {
            this.add_entity_to_pos(ship, {x: 500, y: 500})
        },
    }

    const game_map = Object.assign(
        state,
        create_world()
    )

    for (let x = 0; x < width; x += 1) {
        for (let y = 0; y < height; y += 1) {
            if (y == height - 1 || x == 0 || x == width - 1 || y == 0) {
                game_map.add_block({x, y})
            }
        }
    }

    game_map.world.gravity.y = 0
    game_map.add_entity_to_pos(create_bot(), {x: 2000, y: 1000})
    game_map.add_entity_to_pos(create_bot(), {x: 3000, y: 1000})
    game_map.add_entity_to_pos(create_bot(), {x: 1000, y: 1000})
    game_map.add_entity_to_pos(create_loot(create_explo()), {x: 1000, y: 500})
    game_map.add_entity_to_pos(create_loot(create_metal()), {x: 1000, y: 700})

    return game_map
}

