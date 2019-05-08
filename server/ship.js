module.exports = {
    create_ship,
}

const Matter = require('matter-js')
const Body = Matter.Body
const Vector = Matter.Vector

const create_entity = require('./entity.js')
const {create_world} = require('./world.js')
const Pos = require('./pos.js')

const {create_bullet} = require('./overworld')

function create_ship(width, height) {
    const entity = create_entity({
            width,
            height,
            options: {
            inertia: Infinity
        }
    })
        
    const state = {
        is_ship: true,
        hp_max: 1000,
        hp: 1000,
        hatch_queue: [],
    
        gather_loot(item) {
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
                const vect = Vector.rotate({x: 100, y: 0}, turret.barrel.angle)
                const pos = Vector.add(vect, turret.pos_world)
                const velocity = Vector.div(vect, 5)
                Body.setVelocity(bullet.body, velocity)
                this.parent.add_entity_to_pos(bullet, pos)
            }
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

    ship.events.on('death', function() {
        ship.respawn()
    })

    return ship
}