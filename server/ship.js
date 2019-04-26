const Matter = require('matter-js')
const Body = Matter.Body
const Engine = Matter.Engine
const World = Matter.World
const Vector = Matter.Vector

const Entity = require('./entity.js')
const Pos = require('./pos.js')
const {BuildingPackage, Wrench, Shredder, Explo, Enlargment} = require('./box.js')
const {Brick, Ladder, Factory, Turret, Helm} = require('./building.js')

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

        this.entites = []
        this.engine = Engine.create()
        this.hp_max = 1000
        this.hp = this.hp_max
        
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (x == 0 || x == width - 1 || y == 0 || y == height - 1) {
                    this.add_entity_to_grid(new Brick(), {x, y})
                }
            }
        }

        this.add_entity_to_grid(new Factory(), {x: 7, y: 5})
        this.add_entity_to_grid(new Ladder(), {x: 4, y: 4})
        this.add_entity_to_grid(new Ladder(), {x: 4, y: 5})
        this.add_entity_to_grid(new Ladder(), {x: 4, y: 6})
        this.add_entity_to_grid(new Brick(), {x: 1, y: 4})
        this.add_entity_to_grid(new Brick(), {x: 2, y: 4})
        this.add_entity_to_grid(new Brick(), {x: 3, y: 4})
        this.add_entity_to_grid(new Explo(), {x: 1, y: 6})
        this.add_entity_to_grid(new Explo(), {x: 5, y: 6})
        this.add_entity_to_grid(new Wrench(), {x: 5, y: 5})
        this.add_entity_to_grid(new Shredder(), {x: 5, y: 4})
        this.add_entity_to_grid(new Enlargment(), {x: 5, y: 3})
        this.add_entity_to_grid(new BuildingPackage(Turret), {x: 5, y: 2})
        this.add_entity_to_grid(new Helm(), {x: 9, y: 5})
    }

    get world() {
        return this.engine.world
    }

    add_entity(entity) {
        entity.parent = this
        this.entites.push(entity)
        World.add(this.engine.world, entity.body)        
    }

    add_entity_to_grid(entity, pos_grid) {
        this.add_entity(entity)
        Body.setPosition(entity.body, Pos.grid_to_game(pos_grid, entity))
    }

    remove_entity(entity) {
        entity.on_remove()
        entity.parent = null
        World.remove(this.world, entity.body)
        let index = this.entites.findIndex(e => e.id == entity.id)
        this.entites.splice(index, 1)
    }

    get_display_data() {
        return this.entites.map(entity => entity.get_display_data()).flat()
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

    on_death() {
        this.respawn()
    }

    respawn() {
        this.hp = this.hp_max
        const x = Math.random() * 3000
        const y = Math.random() * 3000
        Body.setPosition(this.body, {x, y})
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
        this.damage = 100
    }

    get has_expired() {
        return this.created + this.lifetime < (new Date()).getTime()
    }

    on_tick() {
        if (this.has_expired && this.map) {
            this.map.remove_entity(this)
        }
    }

    on_collision_start(event) {
        if (event.collided_with.hp > 0) {
            event.collided_with.on_damage(this.damage)
        } 
        this.map.remove_entity(this)
    }
}

exports.Ship = Ship
exports.Bullet = Bullet