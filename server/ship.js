const Matter = require('matter-js')
const Body = Matter.Body
const Bodies = Matter.Bodies
const Engine = Matter.Engine
const World = Matter.World
const Vector = Matter.Vector

const Entity = require('./entity.js')
const {BuildingPackage, Wrench, Shredder, Explo, Enlargment} = require('./box.js')
const {Brick, Ladder, Factory, Turret, Helm} = require('./building.js')

const SMALL_BLOCK_SIZE = 32

class Ship extends Entity {
    constructor(width, height) {
        super(
            width,
            height,
            '',
            {
                inertia: Infinity
            }
        )
        Body.setPosition(this.body, {x: 500, y: 500})

        this.map = null
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
        this.add_entity(new BuildingPackage(Turret), {x: 5, y: 2})
        this.add_entity(new Helm(), {x: 9, y: 5})
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


    add_entity_base(entity) {
        entity.parent = this
        this.entites.push(entity)
        World.add(this.engine.world, entity.body)        
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

    update_turret_angle(position) {
        let turrets = this.entites.filter(e => e instanceof Turret) 
        turrets.forEach(e => e.follow_point(position))
    }

    fire(event) {
        const turret = this.entites.find(e => e instanceof Turret)
        if (turret) {
            const bullet = new Bullet(1500) 
            const vect = Vector.rotate({x: 100, y: 0}, turret.angle)
            const pos = Vector.add(vect, turret.pos_world)
            const velocity = Vector.div(vect, 5)
            Body.setVelocity(bullet.body, velocity)
            this.map.add_entity(bullet, pos)
        }
    }

    on_tick() {
        this.entites.forEach(e => e.on_tick())
    }
    
}

class Bullet extends Entity {
    constructor(lifetime) {
        super(
            1,
            1,
            'wrench.png'
        )

        this.lifetime = lifetime
        this.created = (new Date()).getTime()
    }

    get has_expired() {
        return this.created + this.lifetime < (new Date()).getTime()
    }

    on_tick() {
        if (this.has_expired && this.map) {
            this.map.remove_entity(this)
        }
    }
}

exports.Ship = Ship
exports.Bullet = Bullet