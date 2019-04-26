
const Entity = require('./entity.js')
const Matter = require('matter-js')
const {Ship} = require('./ship.js')
const {Metal, Explo} = require('./box.js')
const Body = Matter.Body
const Events = Matter.Events
const Engine = Matter.Engine
const World = Matter.World

const SMALL_BLOCK_SIZE = 32

class GameMap {
    constructor(width, height) {
        this.engine = Engine.create()
        Events.on(this.engine, 'collisionStart', (e) => this.on_collision_start(e))
        this.world = this.engine.world
        this.world.gravity.y = 0
        this.entites = []
        for (let x = 0; x < width; x += 1) {
            for (let y = 0; y < height; y += 1) {
                if (y == height - 1 || x == 0 || x == width - 1 || y == 0) {
                    this.add_block({x, y})
                }
            }
        }

        this.add_entity(new Bot(), {x: 2000, y: 1000})
        this.add_entity(new Bot(), {x: 3000, y: 1000})
        this.add_entity(new Bot(), {x: 1000, y: 1000})
        this.add_entity(new Loot(new Explo()), {x: 1000, y: 500})
        this.add_entity(new Loot(new Metal()), {x: 1000, y: 700})
    }

    get_entity_from_body(body) {
        return this.entites.find(e => e.body == body)
    }

    on_collision_start(event) {
        for (let pair of event.pairs) {
            const entityA = this.get_entity_from_body(pair.bodyA)
            const entityB = this.get_entity_from_body(pair.bodyB)

            if (entityA) {
                entityA.on_collision_start({
                        collided_with: entityB 
                    })
            } 

            if (entityB) {
                entityB.on_collision_start({
                    collided_with: entityA 
                })
            }
            
        }
    }
    
    add_block(pos_grid) {
        this.add_entity(new Block(), {
            x: pos_grid.x * 8 * SMALL_BLOCK_SIZE, 
            y: pos_grid.y * 8 * SMALL_BLOCK_SIZE
        })
    }

    add_entity(entity, pos) {
        this.entites.push(entity)
        entity.map = this
        Body.setPosition(entity.body, pos)
        World.add(this.world, entity.body)
    }

    remove_entity(entity) {
        entity.on_remove()
        World.remove(this.world, entity.body)
        let index = this.entites.findIndex(e => e.id == entity.id)
        this.entites.splice(index, 1)
    }

    get_display_data() {
        return this.entites.map(e => e.get_display_data()).flat()
    }

    add_ship(ship) {
        this.add_entity(ship, {x: 500, y: 500})
    }

    on_tick() {
        this.entites.forEach(e => e.on_tick())
    }
}

class Block extends Entity {
    constructor() {
        super(
            8, 
            8,
            'brick.png',
            {
                isStatic: true,
            }
        )
    }
}

const {Bullet} = require('./ship.js')
class Bot extends Entity {
    constructor() {
        super(
            8, 
            8,
            'bot.png'
        )
        this.hp_max = 1000
        this.hp = this.hp_max
    }

    on_tick() {
        if (Math.random() < 1 / 20) {
            const bullet = new Bullet(1500)
            const pos = {
                x: Math.random() * 2000,
                y: Math.random() * 2000
            }

            this.map.add_entity(bullet, pos)
        }
    }

    on_death() {        
        const length = Math.floor(Math.random() * 5) + 1
        for (let i = 0; i < length; i++) {
            let index = Math.floor(Math.random() * 2)
            const item = new [Metal, Explo][index]
            this.map.add_entity(new Loot(item), this.pos_world)
        }
        
        this.hp = this.hp_max
        const x = Math.random() * 3000
        const y = Math.random() * 3000
        Body.setPosition(this.body, {x, y})
    }
}

class Loot extends Entity {
    constructor(item) {
        super(
            3,
            3,
            'loot.png'
        )

        this.item = item
    }

    on_collision_start(event) {
        if (event.collided_with instanceof Ship) {
            event.collided_with.add_entity_to_grid(this.item, {x: 2, y: 2})
            this.map.remove_entity(this)
        }
    }
}
module.exports = GameMap