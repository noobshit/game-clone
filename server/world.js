module.exports = {
    create_world
}

const Matter = require('matter-js')
const Engine = Matter.Engine
const World = Matter.World
const Events = Matter.Events

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