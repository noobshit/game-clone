
const Entity = require('./entity.js')
const Matter = require('matter-js')
const Body = Matter.Body
const Bodies = Matter.Bodies
const Engine = Matter.Engine
const World = Matter.World

const SMALL_BLOCK_SIZE = 32

class GameMap {
    constructor(width, height) {
        this.engine = Engine.create()
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
    
    add_block(pos_grid) {
        this.add_entity(new Block(), {
            x: pos_grid.x * 8 * SMALL_BLOCK_SIZE, 
            y: pos_grid.y * 8 * SMALL_BLOCK_SIZE
        })
    }

    add_entity(entity, pos) {
        Body.setPosition(entity.body, pos)
        World.add(this.world, entity.body)
        this.entites.push(entity)
        entity.map = this
    }

    remove_entity(entity) {
        entity.on_remove()
        World.remove(this.world, entity.body)
        let index = this.entites.findIndex(e => e.id == entity.id)
        this.entites.splice(index, 1)
    }

    get_entites() {
        return this.entites.map(e => e.get_entity())
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