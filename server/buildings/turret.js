module.exports.create_turret = create_turret

const {create_building} = require('./building.js')
const create_entity = require('../entity')
const collision = require('../collision.js')

const Matter = require('matter-js')
const Body = Matter.Body

function create_turret() {
    return create_vertical_turret()
}

function create_vertical_turret() {
    const building = create_building(
        1, 
        3,
        'brick.png',
        {
            isStatic: true,
            collisionFilter: collision.filter.BUILDING
        }
    )

    const base = create_entity(
        1,
        3,
        'brick.png',
        {
            isStatic: true
        }
    )

    const barrel = create_entity(
        3, 
        0.5,
        'turret_barrel.png',
        {
            isStatic: true
        }
    )
    barrel.is_background = false

    const turret = Object.assign(
        building,
        {
            base,
            barrel,
            factory_function: create_turret,
        }
    )
    
    for (let part of [barrel, base]) {
        part.parent = turret
        part.translate(turret.offset)
        part.id = turret.id
    }
    barrel.translate({
        x: barrel.offset.x, 
        y: 0
    })
    
    const behaviour = {
        get_display_data() {
            return [ 
                ...turret.base.get_display_data(), 
                ...turret.barrel.get_display_data()
            ]
        },

        rotate(angle) {
            Body.rotate(
                turret.barrel.body, 
                angle, 
                turret.offset
            )
        }
    }
    behaviour.rotate(0)
    return Object.assign(
        turret,
        behaviour
    )
}

function create_horizontal_turret() {
    const building = create_building(
        3, 
        1,
        'brick.png',
        {
            isStatic: true,
            collisionFilter: collision.filter.BUILDING
        }
    )

    const base = create_entity(
        3,
        1,
        'brick.png',
        {
            isStatic: true
        }
    )

    const barrel = create_entity(
        3, 
        0.5,
        'turret_barrel.png',
        {
            isStatic: true
        }
    )
    barrel.is_background = false

    const turret = Object.assign(
        building,
        {
            base,
            barrel,
            factory_function: create_turret,
        }
    )
    
    for (let part of [barrel, base]) {
        part.parent = turret
        part.translate(turret.offset)
        part.id = turret.id
    }
    barrel.translate({
        x: turret.offset.x, 
        y: 0
    })
    
    const behaviour = {
        get_display_data() {
            return [ 
                ...turret.base.get_display_data(), 
                ...turret.barrel.get_display_data()
            ]
        },

        rotate(angle) {
            Body.rotate(
                turret.barrel.body, 
                angle, 
                turret.offset
            )
        }
    }
    behaviour.rotate(-Math.PI / 2)
    return Object.assign(
        turret,
        behaviour
    )
}