module.exports = create_wrench

const create_box = require('./box.js')
const create_building_package = require('./building_package')

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