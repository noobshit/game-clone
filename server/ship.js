const Matter = require('matter-js')
const Body = Matter.Body
const Bodies = Matter.Bodies
const Engine = Matter.Engine
const World = Matter.World

const SMALL_BLOCK_SIZE = 32

class Ship {
    constructor(width, height) {
        this.entites = []
        this.engine = Engine.create()
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (x == 0 || x == width - 1 || y == 0 || y == height - 1) {
                    this.add(new Brick(), {x, y})
                }
            }
        }
    }

    add(entity, pos_grid) {
        let pos_game = {
            x: pos_grid.x * SMALL_BLOCK_SIZE,
            y: pos_grid.y * SMALL_BLOCK_SIZE,
        }

        Body.setPosition(entity.body, pos_game)
        this.entites.push(entity)
        World.add(this.engine.world, entity.body)
    }

    add_player() {
        let player = new Player()
        this.add(player, {x: 3, y: 3})
        return player
    }

    get_entites() {
        return this.entites.map(entity => entity.get_entity())
    }
}

class Entity {
    constructor(width, height, image_key, options={}) {
        this.width = width
        this.height = height
        this.image_key = image_key
        this.body = Bodies.rectangle(0, 0, width, height, options)
    }

    get_entity() {
        return {
            x: this.body.position.x,
            y: this.body.position.y,
            width: this.width,
            height: this.height,
            image_key: this.image_key
        }
    }

    translate(vector) {
        Body.translate(this.body, vector)
    }
}

class Brick extends Entity {
    constructor() {
        super(
            SMALL_BLOCK_SIZE,
            SMALL_BLOCK_SIZE,
            'brick.png', 
            {isStatic: true}   
        )
    }
}

class Player extends Entity {
    constructor() {
        super(
            SMALL_BLOCK_SIZE * 0.8,
            SMALL_BLOCK_SIZE * 1.6,
            null,
        )

        this.speed = 3
    }
}
module.exports = Ship