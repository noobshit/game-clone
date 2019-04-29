module.exports = {
    create_ship,
    create_bullet,
    create_world
}

const Matter = require('matter-js')
const Body = Matter.Body
const Engine = Matter.Engine
const World = Matter.World
const Vector = Matter.Vector
const Events = Matter.Events

const create_entity = require('./entity.js')
const Pos = require('./pos.js')
const {
    create_building_package,
    create_wrench, 
    create_shredder, 
    create_explo, 
    create_enlargment
} = require('./box.js')
const {
    create_brick, 
    create_ladder, 
    create_factory, 
    create_turret, 
    create_helm, 
    create_hatch
} = require('./building.js')

function create_world() {
    const world = {
        engine: Engine.create(),
        entites: [],
        
        get_world() {
            return this.engine.world
        },

        add_entity(entity) {
            entity.set_parent(this)
            this.entites.push(entity)
            World.add(this.get_world(), entity.body)        
        },
    
        remove_entity(entity) {
            entity.on_remove({player: entity})
            entity.set_parent(null)
            World.remove(this.get_world(), entity.body)
            let index = this.entites.findIndex(e => e.id == entity.id)
            this.entites.splice(index, 1)
        },

        handle_collisions(event) {
            for (let pair of event.pairs) {
                const entityA = this.get_entity_from_body(pair.bodyA)
                const entityB = this.get_entity_from_body(pair.bodyB)
    
                if (entityA && entityB) {
                    entityA.on_collision_start({
                        collided_with: entityB 
                    })
                    entityB.on_collision_start({
                        collided_with: entityA 
                    })
                } 
                
            }
        },

        get_entity_from_body(body) {
            return this.entites.find(e => e.body == body)
        },
    }
    Events.on(world.engine, 'collisionStart', (e) => world.handle_collisions(e))
    return world
}

function create_ship(width, height) {
    const entity = create_entity(
        width,
        height,
        '',
        {
            inertia: Infinity
        }
    )
        
    const state = {
        hp_max: 1000,
        hp: 1000,
        hatch_queue: [],
    
        add_loot(item) {
            this.hatch_queue.push(item)
        },

        add_entity_to_grid(entity, pos_grid) {
            this.add_entity(entity)
            Body.setPosition(entity.body, Pos.grid_to_game(pos_grid, entity))
        },
    
        get_display_data() {
            return this.entites.map(entity => entity.get_display_data()).flat()
        },
    
        update_turret_angle(position) {
            let turrets = this.entites.filter(e => e.type === 'turret') 
            turrets.forEach(e => e.follow_point(position))
        },
    
        fire(event) {
            const turret = this.entites.find(e => e.type === 'turret')
            if (turret) {
                const bullet = create_bullet(1500) 
                const vect = Vector.rotate({x: 100, y: 0}, turret.angle)
                const pos = Vector.add(vect, turret.pos_world)
                const velocity = Vector.div(vect, 5)
                Body.setVelocity(bullet.body, velocity)
                this.parent.add_entity_to_pos(bullet, pos)
            }
        },
    
        on_tick() {
            this.entites.forEach(e => e.on_tick())
        },
    
        on_death() {
            this.respawn()
        },
    
        respawn() {
            this.hp = this.hp_max
            const x = Math.random() * 3000
            const y = Math.random() * 3000
            Body.setPosition(this.body, {x, y})
        },
    }

    const ship =  Object.assign(
        entity,
        create_world(),
        state
    )
        
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (x == 0 || x == width - 1 || y == 0 || y == height - 1) {
                ship.add_entity_to_grid(create_brick(), {x, y})
            }
        }
    }

    ship.add_entity_to_grid(create_hatch(), {x: 1, y: 1})
    ship.add_entity_to_grid(create_factory(), {x: 7, y: 5})
    ship.add_entity_to_grid(create_ladder(), {x: 4, y: 4})
    ship.add_entity_to_grid(create_ladder(), {x: 4, y: 5})
    ship.add_entity_to_grid(create_ladder(), {x: 4, y: 6})
    ship.add_entity_to_grid(create_brick(), {x: 1, y: 4})
    ship.add_entity_to_grid(create_brick(), {x: 2, y: 4})
    ship.add_entity_to_grid(create_brick(), {x: 3, y: 4})
    ship.add_entity_to_grid(create_helm(), {x: 9, y: 5})
    ship.add_entity_to_grid(create_building_package(create_helm), {x: 9, y: 5})
    ship.add_entity_to_grid(create_explo(), {x: 1, y: 6})
    ship.add_entity_to_grid(create_explo(), {x: 5, y: 6})
    ship.add_entity_to_grid(create_wrench(), {x: 5, y: 5})
    ship.add_entity_to_grid(create_shredder(), {x: 5, y: 4})
    ship.add_entity_to_grid(create_enlargment(), {x: 5, y: 3})
    ship.add_entity_to_grid(create_building_package(create_turret), {x: 5, y: 2})

    return ship
}

function create_bullet(lifetime=1500) {
    const entity = create_entity(
            1,
            1,
            'wrench.png'
    )

    const state = {
        lifetime,
        created: Date.now(),
        damage: 100,

        on_tick() {
            const has_expired = this.created + this.lifetime < Date.now()
            if (has_expired && this.parent) {
                this.parent.remove_entity(this)
            }
        },
    
        on_collision_start(event) {
            if (event.collided_with.hp > 0) {
                event.collided_with.on_damage(this.damage)
            } 
            this.parent.remove_entity(this)
        },
    }

    return Object.assign(
        entity, 
        state
    )
    
}