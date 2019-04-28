
const Entity = require('./entity.js')
const Matter = require('matter-js')
const {Ship, Bullet} = require('./ship.js')
const {Metal, Explo} = require('./box.js')
const Body = Matter.Body
const Events = Matter.Events
const Engine = Matter.Engine
const World = Matter.World

const SMALL_BLOCK_SIZE = 32

const GameMap = (width, height) => {
    const game_map = {
        width,
        height,
        engine: Engine.create(),
        entites: [],
        
        get world() {
            return this.engine.world
        },
        
        get_entity_from_body(body) {
            return this.entites.find(e => e.body == body)
        },

        on_collision_start(event) {
            for (let pair of event.pairs) {
                const entityA = this.get_entity_from_body(pair.bodyA)
                const entityB = this.get_entity_from_body(pair.bodyB)
    
                if (entityA && entityB) {
                    entityA.on_collision_start({
                        collided_with: entityB 
                    })
                    entityB.on_collision_start({
                        collided_with: entityA 
                    })
                } 
                
            }
        },
        
        add_block(pos_grid) {
            this.add_entity(Block(), {
                x: pos_grid.x * 8 * SMALL_BLOCK_SIZE, 
                y: pos_grid.y * 8 * SMALL_BLOCK_SIZE
            })
        },
    
        add_entity(entity, pos) {
            this.entites.push(entity)
            entity.map = this
            Body.setPosition(entity.body, pos)
            World.add(this.world, entity.body)
        },
    
        remove_entity(entity) {
            entity.on_remove()
            World.remove(this.world, entity.body)
            let index = this.entites.findIndex(e => e.id == entity.id)
            this.entites.splice(index, 1)
        },
    
        get_display_data() {
            return this.entites.map(e => e.get_display_data()).flat()
        },
    
        add_ship(ship) {
            this.add_entity(ship, {x: 500, y: 500})
        },
    
        on_tick() {
            this.entites.forEach(e => e.on_tick())
        },
    }

    for (let x = 0; x < width; x += 1) {
        for (let y = 0; y < height; y += 1) {
            if (y == height - 1 || x == 0 || x == width - 1 || y == 0) {
                game_map.add_block({x, y})
            }
        }
    }
    Events.on(game_map.engine, 'collisionStart', (e) => game_map.on_collision_start(e))
    game_map.world.gravity.y = 0
    game_map.add_entity(Bot(), {x: 2000, y: 1000})
    game_map.add_entity(Bot(), {x: 3000, y: 1000})
    game_map.add_entity(Bot(), {x: 1000, y: 1000})
    game_map.add_entity(Loot(new Explo()), {x: 1000, y: 500})
    game_map.add_entity(Loot(new Metal()), {x: 1000, y: 700})

    return game_map
}

const Block = () => {
    return new Entity (
        8, 
        8,
        'brick.png',
        {
            isStatic: true,
        }
    )
}

const Bot = () => {
    const entity = new Entity(8, 8, 'bot.png')
    const bot = {
        hp_max: 1000,
        hp: 1000,
        
        on_tick() {
            if (Math.random() < 1 / 20) {
                const bullet = new Bullet(1500)
                const pos = {
                    x: Math.random() * 2000,
                    y: Math.random() * 2000
                }
    
                this.map.add_entity(bullet, pos)
            }
        },

        on_death() {        
            const length = Math.floor(Math.random() * 5) + 1
            for (let i = 0; i < length; i++) {
                let index = Math.floor(Math.random() * 2)
                const item = new [Metal, Explo][index]
                this.map.add_entity(Loot(item), this.pos_world)
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

const Loot = (item) => {
    const entity = new Entity(3, 3, 'loot.png')
    const loot = {
        item,
        on_collision_start(event) {
            if (event.collided_with instanceof Ship) {
                event.collided_with.add_loot(this.item)
                this.map.remove_entity(this)
            }
        }
    }

    return Object.assign(
        entity,
        loot
    )
}

module.exports = GameMap