const Matter = require('matter-js')
const Body = Matter.Body
const Bodies = Matter.Bodies
const Engine = Matter.Engine
const World = Matter.World
const Constraint = Matter.Constraint
const Query = Matter.Query
const Detector = Matter.Detector
const Composite = Matter.Composite

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
        this.width = width
        this.height = height
        this.entites = []
        this.engine = Engine.create()
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (x == 0 || x == width - 1 || y == 0 || y == height - 1) {
                    this.add_entity(new Brick(), {x, y})
                }
            }
        }

        this.body = Bodies.rectangle(
            0,
            0,
            this.width * SMALL_BLOCK_SIZE,
            this.height * SMALL_BLOCK_SIZE
        )

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
        this.add_entity(new Enlargment(), {x: 5, y: 3})
        this.add_entity(new BulidingPackage(Brick), {x: 5, y: 2})
    }

    get position() {
        let pos = this.body.position
        return {
            x: pos.x,
            y: pos.y,
            left: pos.x - this.width * SMALL_BLOCK_SIZE / 2,
            top: pos.y - this.height * SMALL_BLOCK_SIZE / 2
        }
    }

    get bounds() {
        return {
            left: 0,
            right: 0 + this.width * SMALL_BLOCK_SIZE,
            top: 0,
            bottom: 0 + this.height * SMALL_BLOCK_SIZE,
        }
    }

    get world() {
        return this.engine.world
    }

    add_entity(entity, pos_grid) {
        let pos_game = {
            x: pos_grid.x * SMALL_BLOCK_SIZE + entity.offset.x,
            y: pos_grid.y * SMALL_BLOCK_SIZE + entity.offset.y,
        }

        entity.parent = this
        Body.setPosition(entity.body, pos_game)
        this.entites.push(entity)
        World.add(this.engine.world, entity.body)
    }

    remove_entity(entity) {
        if (entity.holded_by != null) {
            entity.holded_by.item = null
        }
        entity.on_remove()
        entity.parent = null
        World.remove(this.world, entity.body)
        let index = this.entites.findIndex(e => e.id == entity.id)
        this.entites.splice(index, 1)
    }

    get_entites() {
        return this.entites.map(entity => entity.get_entity())
    }

    translate(vector) {
        Body.translate(this.body, vector)
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
        this.holded_by = null
    }

    get world() {
        if (this.parent != null) {
            return this.parent.world
        } else {
            return null
        }
    }

    get pos_grid() {
        return Pos.to_grid(this.body.position)
    }

    get offset() {
        return {
            x: this.width / 2,
            y: this.height / 2
        }
    }

    get_entity() {
        return {
            id: this.id,
            x: this.parent.position.left + this.body.position.x,
            y: this.parent.position.top + this.body.position.y,
            width: this.width,
            height: this.height,
            angle: this.body.angle,
            image_key: this.image_key,
            is_background: [CATEGORY_WALL, CATEGORY_BACK].includes(this.body.collisionFilter.category)
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
            target: _ => null,
            can_execute: _ => false,
            execute: _ => {}
        }
    }

    get use() {
        return {
            target: _ => null,
            can_execute: _ => false,
            execute: _ => {} 
        }
    }

    get_cursor(event) {
        return new Cursor(
            CURSOR.DEFAULT, {
                target: this.use.target(event),
                can_use: this.use.can_execute(event)
            })
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

    update_cursor(event) {
        if (this.item && this.item.use.can_execute(event)) {
            this.cursor = this.item.get_cursor(event)
        } else if (this.grab_item.can_execute(event)) {
            this.cursor = new Cursor(
                CURSOR.GRAB, 
                {
                    can_use: true,
                    target: this.grab_item.target(event).get_entity(),
                })
        } else if (event.entites.some(e => e.left_button_down.can_execute(event))) {
            let entity = event.entites.find(e => e.left_button_down.can_execute(event))
            this.cursor = entity.get_cursor()
        } else if (this.item) {
            this.cursor = this.item.get_cursor(event)
        } else if (this.grab_item.target(event) != null) {
            this.cursor = new Cursor(CURSOR.GRAB, {can_use: false})
        } else {
            this.cursor = new Cursor(CURSOR.DEFAULT)
        }
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
            target: function(event) {
                return event.entites.find(e => e instanceof Box)
            },
            can_execute: function(event) {
                return player.item == null 
                && event.entites.some(e => e instanceof Box)
            },
            execute: function(event) {
                let entry = this.target(event)
                player.item = entry
                entry.holded_by = player
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
                player.item.holded_by = null
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
            target: function(event) {
                return event.entites.find(e => e instanceof Building)
            },
            can_execute: function(event) {
                return event.entites.some(e => e instanceof Building)
            },
            execute: function(event) {
                let building = this.target(event)
                let building_package = new BulidingPackage(building.constructor)
                event.ship.add_entity(building_package, building.pos_grid)
                event.ship.remove_entity(building)
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
            target: function(event) {
                return event.entites.find(e => e instanceof Box && e != shredder)
            },
            can_execute: function(event) {
                return event.entites.some(e => e instanceof Box && e != shredder)
            },
            execute: function(event) {
                let box = this.target(event)
                event.ship.remove_entity(box)
            }
        }
    }
}


class Enlargment extends Box {
    constructor() {
        super('enlargment.png')
    }

    get use() {
        let enlargment = this
        return {
            target: function(event){
                return null
            },  
            can_execute: function(event) {
                return event.pos_grid.x >= 0 
                && event.pos_grid.y >= 0
                && event.pos_grid.x < event.ship.width
                && event.pos_grid.y < event.ship.height
            },
            execute: function(event) {
                let entites_to_move = event.ship.entites.filter(
                    e => e.pos_grid.x > event.pos_grid.x
                )                
                entites_to_move.forEach(e => e.translate({x: SMALL_BLOCK_SIZE, y: 0}))
                event.ship.add_entity(new Brick(), {x: event.pos_grid.x + 1, y: 0})
                event.ship.add_entity(new Brick(), {x: event.pos_grid.x + 1, y: event.ship.height - 1})
                event.ship.remove_entity(enlargment)
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

class BulidingPackage extends Box {
    constructor(building_class) {
        let building = new building_class()
        super(building.image_key)
        this.building_class = building_class
        this.building = building
    }

    can_build(pos) {
        let bodyA = this.building.body
        Body.setPosition(bodyA, {
            x: pos.left + this.building.offset.x,
            y: pos.top + this.building.offset.y
        })
        let bodies = Composite.allBodies(this.world)
        let can_collide_with = bodies.filter(
            bodyB => Detector.canCollide(bodyA.collisionFilter, bodyB.collisionFilter)
        )
        let collisions = Query.collides(bodyA, can_collide_with)
        let is_not_colliding = collisions.length == 0
        let bounds = this.parent.bounds
        let pos_is_inside_ship = bounds.left < pos.x 
            && bounds.right > pos.x
            && bounds.top < pos.y
            && bounds.bottom > pos.y
        return is_not_colliding && pos_is_inside_ship
    }

    get use() {
        let building_package = this
        return {
            target: function(event) {
                return null
            },
            can_execute: function(event){
                return building_package.can_build(Pos.to_snap(event.pos_game))
            },
            execute: function(event) {
                building_package.parent.add_entity(building_package.building, event.pos_grid)
                building_package.parent.remove_entity(building_package)
            }
        }
    }

    get_cursor(event) {
        return new Cursor(
            CURSOR.BUILD, 
            {
                can_use: this.use.can_execute(event), 
                data: this.building.get_entity()
            }
        )
    }
}

var Pos = {
    to_grid: function(pos) {
        return {
            x: Math.floor(pos.x / SMALL_BLOCK_SIZE),
            y: Math.floor(pos.y / SMALL_BLOCK_SIZE)
        }
    },
    to_snap: function(pos) {
        let snapped = {
            x: pos.x,
            y: pos.y,
            left: pos.x - Math.abs(pos.x % SMALL_BLOCK_SIZE),
            top: pos.y - Math.abs(pos.y % SMALL_BLOCK_SIZE)
        }
        return snapped
    }
}

const CURSOR = {
    DEFAULT: 1,
    BUILD: 2,
    GRAB: 3,
}

class Cursor {
    constructor(action, options) {
        this.action = action
        this.target = null
        this.can_use = null
        this.data = null

        Object.assign(this, options)
        if (this.target && this.target instanceof Entity) {
            this.target = this.target.get_entity()
        }
    }

}

exports.Ship = Ship
exports.Player = Player
exports.Pos = Pos