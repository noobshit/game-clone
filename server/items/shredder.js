module.exports.create_shredder = create_shredder

const {create_box} = require('./box.js')

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