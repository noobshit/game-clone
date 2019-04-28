
const Entity = require('./entity.js')
const Matter = require('matter-js')
const {Ship, create_bullet, create_world} = require('./ship.js')
const {Metal, Explo} = require('./box.js')
const Body = Matter.Body
const Events = Matter.Events
const Engine = Matter.Engine
const World = Matter.World

const SMALL_BLOCK_SIZE = 32

const create_game_map = (width, height) => {
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
    
        on_tick() {
            this.entites.forEach(e => e.on_tick())
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
    game_map.add_entity_to_pos(create_loot(new Explo()), {x: 1000, y: 500})
    game_map.add_entity_to_pos(create_loot(new Metal()), {x: 1000, y: 700})

    return game_map
}

const create_block = () => {
    return new Entity (
        8, 
        8,
        'brick.png',
        {
            isStatic: true,
        }
    )
}

const create_bot = () => {
    const entity = new Entity(8, 8, 'bot.png')
    const bot = {
        hp_max: 1000,
        hp: 1000,
        
        on_tick() {
            if (Math.random() < 1 / 20) {
                const bullet = create_bullet(1500)
                const pos = {
                    x: Math.random() * 2000,
                    y: Math.random() * 2000
                }
    
                this.parent.add_entity_to_pos(bullet, pos)
            }
        },

        on_death() {        
            const length = Math.floor(Math.random() * 5) + 1
            for (let i = 0; i < length; i++) {
                let index = Math.floor(Math.random() * 2)
                const item = new [Metal, Explo][index]
                this.parent.add_entity_to_pos(create_loot(item), this.pos_world)
            }
            
            this.hp = this.hp_max
            const x = Math.random() * 3000
            const y = Math.random() * 3000
            Body.setPosition(this.body, {x, y})
        }
    }

    return Object.assign(
        entity, 
        bot
    )
}

const create_loot = (item) => {
    const entity = new Entity(3, 3, 'loot.png')
    const loot = {
        item,
        on_collision_start(event) {
            if (event.collided_with == Ship) {
                event.collided_with.add_loot(this.item)
                this.parent.remove_entity(this)
            }
        }
    }

    return Object.assign(
        entity,
        loot
    )
}

module.exports = create_game_map