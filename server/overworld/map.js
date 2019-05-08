
module.exports.create_game_map = create_game_map

const Matter = require('matter-js')
const {create_world} = require('../world.js')
const {create_block} = require('./block.js')
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

        add_entity_to_random_pos(entity) {
            this.add_entity(entity)
            this.set_random_position_of(entity)
        },
    
        get_display_data() {
            return this.entites.map(e => e.get_display_data()).flat()
        },
    
        add_ship(ship) {
            this.add_entity_to_pos(ship, {x: 500, y: 500})
        },

        set_random_position_of(entity) {
            const x = Math.random() * 3000
            const y = Math.random() * 3000
            Body.setPosition(entity.body, {x, y})
        }
    }

    const game_map = Object.assign(
        state,
        create_world()
    )

    game_map.world.gravity.y = 0

    for (let x = 0; x < width; x += 1) {
        for (let y = 0; y < height; y += 1) {
            if (y == height - 1 || x == 0 || x == width - 1 || y == 0) {
                game_map.add_block({x, y})
            }
        }
    }

    return game_map
}

