
const Entity = require('./entity.js')
const Matter = require('matter-js')
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

        this.add_entity(new Bot(), {x: 1000, y: 1000})
    }

    get_entity_from_body(body) {
        return this.entites.find(e => e.body == body)
    }

    on_collision_start(event) {
        for (let pair of event.pairs) {
            const entityA = this.get_entity_from_body(pair.bodyA)
            const entityB = this.get_entity_from_body(pair.bodyB)

            if (entityA) {
                entityA.on_collision_start(pair)
            } 

            if (entityB) {
                entityB.on_collision_start(pair)
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
        World.add(this.world, ship.body)
        ship.map = this
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
            'shredder.png'
        )
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
}
module.exports = GameMap