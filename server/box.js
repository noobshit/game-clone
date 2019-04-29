module.exports = {
    create_box,
    create_wrench,
    create_shredder,
    create_enlargment,
    create_explo,
    create_metal,
    create_building_package
}

const create_entity = require('./entity.js')
const collison = require('./collision.js')
const Cursor = require('../shared/cursor.js')
const {create_brick} = require('./building.js')
const Pos = require('./pos.js')
const SMALL_BLOCK_SIZE = 32

function create_box(image_key) {
    const entity = create_entity(
        0.8,
        0.8,
        image_key,
        {
            collisionFilter: collison.filter.MOBILE
        }
    )

    const state = {
        is_box: true
    }

    return Object.assign(
        entity,
        state
    )
}


function create_wrench() {
    const box = create_box('wrench.png')

    const state = {
        use: {
            target(event) {
                return event.entites.find(e => e.is_building)
            },
            can_execute(event) {
                return event.entites.some(e => e.is_building)
            },
            execute(event) {
                let building = this.target(event)
                let building_package = create_building_package(building.factory_function)
                event.ship.add_entity_to_grid(building_package, building.pos_grid)
                event.ship.remove_entity(building)
            }
        }
    }

    return Object.assign(
        box,
        state
    )
}


function create_shredder() {
    const box = create_box('shredder.png')

    const state = {
         use: {
            target(event) {
                return event.entites.find(e => e.is_box && e != state)
            },
            can_execute(event) {
                return event.entites.some(e => e.is_box && e != state)
            },
            execute(event) {
                let box = this.target(event)
                event.ship.remove_entity(box)
            }
        }
    }

    return Object.assign(
        box,
        state
    )
}


function create_enlargment() {
    const box = create_box('enlargment.png')

    const state = {
        get use() {
            let enlargment = box
            return {
                target(event){
                    return null
                },  
                can_execute(event) {
                    return event.pos_game.x >= 0 
                    && event.pos_game.y >= 0
                    && event.pos_game.x < event.ship.width
                    && event.pos_game.y < event.ship.height
                },
                execute(event) {
                    let entites_to_move = event.ship.entites.filter(
                        e => e.pos_grid.x > event.pos_grid.x
                    )                
                    entites_to_move.forEach(e => e.translate({
                        x: SMALL_BLOCK_SIZE, 
                        y: 0
                    }))
                    event.ship.add_entity_to_grid(create_brick(), {
                        x: event.pos_grid.x + 1, 
                        y: 0
                    })
                    
                    const pos = Pos.to_grid({
                        x: event.pos_game.x,
                        y: event.ship.da.bottom
                    })
                    pos.x += 1
                    pos.y -= 1
                    event.ship.add_entity_to_grid(create_brick(), pos)
                    event.ship.remove_entity(enlargment)
                }
            }
        }
    }

    return Object.assign(
        box,
        state
    )
}


function create_explo() {
    return create_box('explo.png')
}


function create_metal() {
    return create_box('metal.png')
}


function create_building_package(building_class) {
    const building = building_class()
    const box = create_box(building.image_key)

    const state = {
        building_class,
        building,
    
        set_parent(value) {
            this.parent = value
            if (this.building) {
                this.building.parent = value
            }
        },

        get use() {
            let building_package = box
            return {
                target(event) {
                    return null
                },
                can_execute(event){
                    return building_package.building.can_build(Pos.to_snap(event.pos_game))
                },
                execute(event) {
                    building_package.building.build(event.pos_grid)        
                    building_package.building = null
                    building_package.parent.remove_entity(building_package)
                }
            }
        },

        get_cursor(event) {
            return new Cursor(
                Cursor.type.BUILD, 
                {
                    can_use: this.use.can_execute(event), 
                    data: this.building.get_display_data()
                }
            )
        }
    }

    return Object.assign(
        box,
        state
    )
}