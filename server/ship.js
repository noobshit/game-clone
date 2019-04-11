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

        this.add(new Factory(), {x: 7, y: 5})
        this.add(new Ladder(), {x: 4, y: 4})
        this.add(new Ladder(), {x: 4, y: 5})
        this.add(new Ladder(), {x: 4, y: 6})
        this.add(new Brick(), {x: 1, y: 4})
        this.add(new Brick(), {x: 2, y: 4})
        this.add(new Brick(), {x: 3, y: 4})
    }

    add(entity, pos_grid) {
        let pos_game = {
            x: pos_grid.x * SMALL_BLOCK_SIZE + entity.width / 2,
            y: pos_grid.y * SMALL_BLOCK_SIZE + entity.height / 2,
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
        width *= SMALL_BLOCK_SIZE
        height *= SMALL_BLOCK_SIZE
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
            angle: this.body.angle,
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
            1,
            1,
            'brick.png', 
            {isStatic: true}   
        )
    }
}

class Ladder extends Entity {
    constructor() {
        super(
            1, 
            1,
            'ladder.png',
            {isStatic: true}
        )
    }
}

class Factory extends Entity {
    constructor() {
        super(
            2,
            2,
            'factory.png',
            {isStatic: true}
        )
    }
}

class Player extends Entity {
    constructor() {
        super(
            0.8,
            1.6,
            null,
        )

        this.speed = 5
    }
}
module.exports = Ship