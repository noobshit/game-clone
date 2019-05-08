module.exports.create_helm = create_helm

const {create_building} = require('./building')

function create_helm() {
    const building = create_building({
            width: 2,
            height: 2,
            image_key: 'helm.png', 
            options: {
                isStatic: true,
            }   
    })

    const state = Object.assign(
        building,
        {
            is_background: true,
            used_by: null,
            factory_function: create_helm,
        }
    )

    const behaviour = (state) => ({
        set_used_by(value) {
            state._used_by = value
            if (state.parent) {
                state.parent.controlled_by = value
            }
        },

        get_used_by() {
            return state._used_by
        },

        left_button_down: {
            target(event) {
                return null
            },
            can_execute(event) {
                return !state.get_used_by() && !event.ship.controlled_by
            },
            execute(event) {
                state.set_used_by(event.from)
                event.ship.controlled_by = event.from
                event.from.using_building = state
            }
        }
    })

    return Object.assign(
        state,
        behaviour(state)
    )
}