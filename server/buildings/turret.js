module.exports.create_turret = create_turret

const {create_building} = require('./building.js')
const create_entity = require('../entity')
const collision = require('../collision.js')
const Pos = require('../pos')

const Matter = require('matter-js')
const Body = Matter.Body
const Vector = Matter.Vector

function create_turret() {
    const turret_horizontal = create_turret_body({
        width: 3,
        height: 1,
        factory_function: create_turret
    })

    return Object.assign(
        turret_horizontal,
        turret_behaviour(turret_horizontal)
    )

}

function turret_behaviour(turret) {
    return {
        get_display_data() {
            return [ 
                ...turret.base.get_display_data(), 
                ...turret.barrel.get_display_data()
            ]
        },

        set_barrel_angle(angle) {
            const angle_diff = angle - turret.barrel.angle
            Body.rotate(
                turret.barrel.body, 
                angle_diff, 
                turret.barrel.offset
            )
        },

        set_position(pos) {
            const ship = turret.parent
            let angle = 0
            if (pos.top == 0) {
                angle = 0 * Math.PI / 2
            }
            else if (pos.right == ship.width) {
                angle = 1 * Math.PI / 2
            }
            else if (pos.bottom == ship.height) {
                angle = 2 * Math.PI / 2
            }
            else if (pos.left == 0) {
                angle = 3 * Math.PI / 2
            } 
            Body.setAngle(turret.body, angle)
            Body.setAngle(turret.base.body, angle)
            turret.set_barrel_angle(angle - Math.PI / 2)

            Body.setPosition(turret.body, {
                x: pos.left + turret.offset.x % 32,  
                y: pos.top + turret.offset.y % 32
            })
        },

        can_build() {
            const pos = Pos.to_snap(turret.position)
            const ship = turret.parent

            return Pos.is_inside(pos, ship.bounds)
            && (pos.top == 0
            || pos.right == ship.width
            || pos.bottom == ship.height
            || pos.left == 0)
        },
        
        build() {
            turret.parent.add_entity(turret)
        },

        follow_point(point) {
            const angle = Vector.angle(turret.body.position, point)
            this.set_barrel_angle(angle)
        }
    }
} 

function create_turret_body({width, height, factory_function}) {

    const building = create_building({
        width, 
        height,
        image_key: 'brick.png',
        options: {
            isStatic: true,
            collisionFilter: collision.filter.BUILDING
        }
    })

    const base = create_building({
        width,
        height,
        image_key: 'brick.png',
        options: {
            isStatic: true
        }
    })
    
    const barrel = create_entity({
        width: 3, 
        height: 0.5,
        image_key: 'turret_barrel.png',
        options: {
            isStatic: true
        }
    })
    barrel.is_background = false
    barrel.translate({
        x: barrel.offset.x, 
        y: 0
    })

    const turret = Object.assign(
        building,
        {
            base,
            barrel,
            factory_function,
            type: 'turret'
        }
    )
    
    for (let part of [barrel, base]) {
        part.parent = turret
        part.translate(turret.offset)
        part.factory_function = factory_function
        part.id = turret.id
    }
    
    return turret
}