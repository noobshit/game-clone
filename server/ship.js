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
        this.add_entity(new Wrench(), {x: 5, y: 5})
        this.add_entity(new Shredder(), {x: 5, y: 4})
    }

    get world() {
        return this.engine.world
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
        World.remove(this.world, entity.body)
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

    get world() {
        if (this.parent != null) {
            return this.parent.world
        } else {
            return null
        }
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

    get use() {
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

        if (this.item && this.item.use.can_execute(event)) {
            this.item.use.execute(event)
        }
        else if (this.grab_item.can_execute(event)) {
            this.grab_item.execute(event)
        } else {
            let entity = event.entites.find(e => e.left_button_down.can_execute(event))
            if (entity) {
                entity.left_button_down.execute(event)
            }
        }
    }

    on_remove() {
        if (this.drop_item.can_execute()) {
            this.drop_item.execute()
        }
    }

    get grab_item() {
        let player = this
        return {
            can_execute: function(event) {
                return player.item == null 
                && event.entites.some(e => e instanceof Box)
            },
            execute: function(event) {
                let entry = event.entites.find(e => e instanceof Box)
                player.item = entry
                player.item.collisionFilter = player.item.body.collisionFilter
                player.item.body.collisionFilter = COLLISION_TRANSPARENT
                Body.setPosition(player.item.body, player.body.position)
                let constraint = Constraint.create({
                    bodyA: player.body,
                    bodyB: player.item.body
                })
                player.item.constraint = constraint
                World.add(player.world, constraint)
            }    
        }
    }
    
    get drop_item() {
        let player = this
        return {
            can_execute: function(event) {
                return player.item != null
            },
            execute: function(event) {
                player.item.body.collisionFilter = player.item.collisionFilter
                delete player.item.collisionFilter
                World.remove(player.world, player.item.constraint)
                delete player.item.constraint
                player.item = null
            
            }
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
}


class Wrench extends Box {
    constructor() {
        super('wrench.png')
    }

    get use() {
        return {
            can_execute: function(event) {
                return event.entites.some(e => e instanceof Building)
            },
            execute: function(event) {
                let building = event.entites.find(e => e instanceof Building)
                event.parent.remove_entity(building)
            }
        }
    }
}


class Shredder extends Box {
    constructor() {
        super('shredder.png')
    }

    get use() {
        let shredder = this
        return {
            can_execute: function(event) {
                return event.entites.some(e => e instanceof Box && e != shredder)
            },
            execute: function(event) {
                let box = event.entites.find(e => e instanceof Box && e != shredder)
                event.parent.remove_entity(box)
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


class Building extends Entity {
    constructor(width, height, image_key, options) {
        super(width, height, image_key, options)
    }
}

class Brick extends Building {
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


class Ladder extends Building {
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


class Factory extends Building {
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