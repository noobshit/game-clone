module.exports = {
    create_factory,
}

const buildings = require('./building.js')
const collision = require('./collision.js')
const box = require('./box.js')
const menu = require('./menu.js')
const package = box.create_building_package

const options =  [
    {
        factory_function: _ => package(buildings.create_brick),
        product: {
            amount: 1,
            label: 'Brick'
        },
        cost: {
            metal: 2,
            explo: 0
        }
    },
    {
        factory_function: _ => package(buildings.create_ladder),
        product: {
            amount: 1,
            label: 'Ladder'
        },
        cost: {
            metal: 4,
            explo: 0
        }
    },
    {
        factory_function: _ => box.create_wrench(),
        product: {
            amount: 1,
            label: 'Wrench'
        },
        cost: {
            metal: 4,
            explo: 0
        }
    },
]

function create_factory() {
    const building = buildings.create_building(
        2,
        2,
        'factory.png',
        {
            isStatic: true,
            collisionFilter: collision.filter.BUILDING
        }
    )

    const state = {
        options,
        factory_function: create_factory,
        metal: 0,
        explo: 0,

        left_button_down: {
            target(event) {
                return this
            },
            can_execute(event) {
                return true
            },
            execute(event) {
                event.player.using_building = building
                console.log('show_factory_menu')
                menu_options = options.map(
                    (entry, index) => ({
                        option: index,
                        product: entry.product,
                        cost: entry.cost
                    })
                )
                menu.show_factory_menu(event.player, building, menu_options)
            }
        },
    }

    building.events.on('menu_choice', function(data) {
        const choice = building.options[data.option]
        if (choice.cost.metal > building.metal
            || choice.cost.explo > building.explo) {
                console.log('Not enough resources')
            }
        else {
            building.metal -= choice.cost.metal
            building.explo -= choice.cost.explo
            const product = choice.factory_function()
            building.parent.add_entity_to_grid(product, building.pos_grid)
        }
    })

    return Object.assign(
        building,
        state
    )
}