const Matter = require('matter-js')
const Body = Matter.Body
const Bodies = Matter.Bodies
const Engine = Matter.Engine
const World = Matter.World
const Constraint = Matter.Constraint

const SMALL_BLOCK_SIZE = 32

const CATEGORY_TRANSPARENT = 0x00
const CATEGORY_WALL = 0x01
const CATEGORY_BACK = 0x02
const CATEGORY_MOBILE = 0x04
const CATEGORY_PLAYER = 0x08

const MASK_BUILDING = CATEGORY_WALL | CATEGORY_BACK
const MASK_MOBILE = CATEGORY_WALL | CATEGORY_MOBILE | CATEGORY_PLAYER
const MASK_PLAYER = CATEGORY_WALL | CATEGORY_MOBILE
const MASK_TRANSPARENT = 0x00

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

const COLLISION_TRANSPARENT = {
    category: CATEGORY_TRANSPARENT,
    mask: MASK_TRANSPARENT
}


class Ship {
    constructor(width, height) {
        this.entites = []
        this.engine = Engine.create()
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (x == 0 || x == width - 1 || y == 0 || y == height - 1) {
                    this.add_entity(new Brick(), {x, y})
                }
            }
        }

        this.add_entity(new Factory(), {x: 7, y: 5})
        this.add_entity(new Ladder(), {x: 4, y: 4})
        this.add_entity(new Ladder(), {x: 4, y: 5})
        this.add_entity(new Ladder(), {x: 4, y: 6})
        this.add_entity(new Brick(), {x: 1, y: 4})
        this.add_entity(new Brick(), {x: 2, y: 4})
        this.add_entity(new Brick(), {x: 3, y: 4})
        this.add_entity(new Explo(), {x: 1, y: 6})
        this.add_entity(new Explo(), {x: 5, y: 6})
    }

    add_entity(entity, pos_grid) {
        let pos_game = {
            x: pos_grid.x * SMALL_BLOCK_SIZE + entity.width / 2,
            y: pos_grid.y * SMALL_BLOCK_SIZE + entity.height / 2,
        }

        entity.parent = this
        Body.setPosition(entity.body, pos_game)
        this.entites.push(entity)
        World.add(this.engine.world, entity.body)
    }

    remove_entity(entity) {
        entity.on_remove()
        entity.parent = null
        World.remove(this.engine.world, entity.body)
        let index = this.entites.findIndex(e => e.id == entity.id)
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
        this.parent = null
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

    get left_button_down() {
        return {
            can_execute: _ => false,
            execute: _ => {}
        }
    }

    on_remove() {
    }
}


class Player extends Entity {
    constructor(socket) {
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
        
        this.item = null
        this.socket = socket
        this.speed = 5
        Body.setInertia(this.body, Infinity)
    }

    send_debug_message(msg) {
        this.socket.emit('debug_answer', msg)
    }

    on_left_button_down(event) {
        let entites = this.parent.entites.filter(e => event.entites_ids.includes(e.id))
        let entity = entites.find(e => e.left_button_down.can_execute(event))
        if (entity) {
            entity.left_button_down.execute(event)
        }
    }

    on_remove() {
        this.drop_item()
    }

    grab_item(entry) {
        this.item = entry
        this.item.collisionFilter = this.item.body.collisionFilter
        this.item.body.collisionFilter = COLLISION_TRANSPARENT
        Body.setPosition(this.item.body, this.body.position)
        let constraint = Constraint.create({
            bodyA: this.body,
            bodyB: this.item.body
        })
        this.item.constraint = constraint
        World.add(this.parent.engine.world, constraint)
    }
    
    drop_item() {
        if (this.item) {
            this.item.body.collisionFilter = this.item.collisionFilter
            delete this.item.collisionFilter
            World.remove(this.parent.engine.world, this.item.constraint)
            delete this.item.constraint
            this.item = null
        }
    }
}


class Box extends Entity {
    constructor(image_key) {
        super(
            0.8,
            0.8,
            image_key,
            {
                collisionFilter: COLLISION_MOBILE
            }
        )
    }

    get left_button_down() {
        let entry = this
        return {
            can_execute: function(event) { 
                return event.from.item == null
            },
            execute: function(event) {
                event.from.send_debug_message('Clicked box xD')
                event.from.grab_item(entry)
            }
        }
    }
}

class Explo extends Box {
    constructor() {
        super('explo.png')
    }
}

class Metal extends Box {
    constructor() {
        super('metal.png')
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


exports.Ship = Ship
exports.Player = Player