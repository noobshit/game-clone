const Matter = require('matter-js')
const Body = Matter.Body
const Bodies = Matter.Bodies
const Engine = Matter.Engine
const World = Matter.World
const Query = Matter.Query
const Detector = Matter.Detector
const Composite = Matter.Composite
const Vector = Matter.Vector

const Entity = require('./entity.js')
const Cursor = require('../shared/cursor.js')
const Pos = require('./pos.js')
const Box = require('./box.js')
const collision = require('./collision.js')

const SMALL_BLOCK_SIZE = 32

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
            500,
            500,
            this.width * SMALL_BLOCK_SIZE,
            this.height * SMALL_BLOCK_SIZE,
            {
                inertia: Infinity
            }
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
        this.add_entity(new Turret(), {x: 0, y: 0})
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

    update_turret_angle(position) {
        let turrets = this.entites.filter(e => e instanceof Turret) 
        turrets.forEach(e => e.follow_point(position))
    }
}


class Wrench extends Box {
    constructor() {
        super('wrench.png')
    }

    get use() {
        return {
            target(event) {
                return event.entites.find(e => e instanceof Building)
            },
            can_execute(event) {
                return event.entites.some(e => e instanceof Building)
            },
            execute(event) {
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
            target(event) {
                return event.entites.find(e => e instanceof Box && e != shredder)
            },
            can_execute(event) {
                return event.entites.some(e => e instanceof Box && e != shredder)
            },
            execute(event) {
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
            target(event){
                return null
            },  
            can_execute(event) {
                return event.pos_grid.x >= 0 
                && event.pos_grid.y >= 0
                && event.pos_grid.x < event.ship.width
                && event.pos_grid.y < event.ship.height
            },
            execute(event) {
                let entites_to_move = event.ship.entites.filter(
                    e => e.pos_grid.x > event.pos_grid.x
                )                
                entites_to_move.forEach(e => e.translate({
                    x: SMALL_BLOCK_SIZE, 
                    y: 0
                }))
                event.ship.add_entity(new Brick(), {
                    x: event.pos_grid.x + 1, 
                    y: 0
                })
                
                event.ship.add_entity(new Brick(), {
                    x: event.pos_grid.x + 1, 
                    y: event.ship.height - 1
                })
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

        this.is_background = true
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
                collisionFilter: collision.filter.BUILDING
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
                collisionFilter: collision.filter.BUILDING
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

    set parent(value) {
        this._parent = value
        if (this.building) {
            this.building.parent = value
        }
    }

    get parent() {
        return this._parent
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
            target(event) {
                return null
            },
            can_execute(event){
                return building_package.can_build(Pos.to_snap(event.pos_game))
            },
            execute(event) {
                building_package.parent.add_entity(building_package.building, event.pos_grid)
                building_package.building = null
                building_package.parent.remove_entity(building_package)
            }
        }
    }

    get_cursor(event) {
        return new Cursor(
            Cursor.type.BUILD, 
            {
                can_use: this.use.can_execute(event), 
                data: this.building.get_entity()
            }
        )
    }
}

class Turret extends Building {
    constructor() {
        super(
            3, 
            0.5,
            'turret_barrel.png',
            {
                isStatic: true,
                collisionFilter: collision.filter.BUILDING
            }
        )
    }

    follow_point(point) {
        let angle = Vector.angle(this.body.position, point)
        Body.setAngle(this.body, angle)
    }

exports.Ship = Ship