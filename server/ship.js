const Matter = require('matter-js')
const Body = Matter.Body
const Bodies = Matter.Bodies
const Engine = Matter.Engine
const World = Matter.World

const SMALL_BLOCK_SIZE = 32

const CATEGORY_WALL = 0x01
const CATEGORY_BACK = 0x02
const CATEGORY_MOBILE = 0x04
const CATEGORY_PLAYER = 0x08

const MASK_BUILDING = CATEGORY_WALL | CATEGORY_BACK
const MASK_MOBILE = CATEGORY_WALL | CATEGORY_MOBILE | CATEGORY_PLAYER
const MASK_PLAYER = CATEGORY_WALL | CATEGORY_MOBILE

const COLLISION_MOBILE = {
    category: CATEGORY_MOBILE,
    mask: MASK_MOBILE
}

const COLLISION_BUILDING = {
    category: CATEGORY_BACK,
    mask: MASK_BUILDING
}

const COLLISION_PLAYER = {
    category: CATEGORY_PLAYER,
    mask: MASK_PLAYER
}

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
        this.add(new Explo(), {x: 1, y: 6})
        this.add(new Explo(), {x: 5, y: 6})
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

    remove_player(id) {
        let index = this.entites.findIndex(entity => entity.id == id)
        this.entites.splice(index, 1)
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
        this.id = this.generate_id()
    }

    get_entity() {
        return {
            id: this.id,
            x: this.body.position.x,
            y: this.body.position.y,
            width: this.width,
            height: this.height,
            angle: this.body.angle,
            image_key: this.image_key
        }
    }

    generate_id() {
        if (!Entity.ids) {
            Entity.ids = new Set()
        }

        let id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        if (Entity.ids.has(id)) {
            return this.generate_id()
        } else {
            Entity.ids.add(id)
            return id
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
            {
                isStatic: true,
            }   
        )
    }
}


class Ladder extends Entity {
    constructor() {
        super(
            1, 
            1,
            'ladder.png',
            {
                isStatic: true,
                collisionFilter: COLLISION_BUILDING
            }
        )
    }
}


class Factory extends Entity {
    constructor() {
        super(
            2,
            2,
            'factory.png',
            {
                isStatic: true,
                collisionFilter: COLLISION_BUILDING
            }
        )
    }
}

class Player extends Entity {
    constructor() {
        super(
            0.8,
            1.6,
            null,
            {
                friction: 0.5,
                frictionStatic: 0.1,
                restitution: 0.5,
                collisionFilter: COLLISION_PLAYER
            }
        )

        this.speed = 5
        Body.setInertia(this.body, Infinity)
    }
}

class Explo extends Entity {
    constructor() {
        super(
            0.8,
            0.8,
            'explo.png',
            {
                collisionFilter: COLLISION_MOBILE,
            }
        )
    }
}
module.exports = Ship