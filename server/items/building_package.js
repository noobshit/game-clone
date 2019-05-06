module.exports = create_building_package

const create_box = require('./box.js')
const Cursor = require('../../shared/cursor.js')
const Pos = require('../pos.js')

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
            let package = box
            return {
                target(event) {
                    return null
                },
                can_execute(event){
                    return package.building.can_build(Pos.to_snap(event.pos_game))
                },
                execute(event) {
                    package.building.build(event.pos_grid)        
                    package.building = null
                    package.parent.remove_entity(package)
                }
            }
        },

        get_cursor(event) {
            return Cursor.create(
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