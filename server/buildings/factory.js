module.exports.create_factory = create_factory

const collision = require('../collision.js')
const {create_building} = require('./building')
const {create_brick} = require('./brick')
const {create_ladder} = require('./ladder')
const {create_task} = require('../task')
const box = require('../items')
const menu = require('../menu.js')

function create_factory() {
    const building = create_building({
        width: 2,
        height: 2,
        image_key: 'factory.png',
        options: {
            isStatic: true,
            collisionFilter: collision.filter.BUILDING
        }
    })

    const state = {
        options,
        factory_function: create_factory,
        metal: 100,
        explo: 100,
        production_queue: [],

        left_button_down: {
            target(event) {
                return this
            },
            can_execute({player}) {
                return !player.using_building
            },
            execute({player, ship}) {
                if (player.item) {
                    if (player.item.type === 'metal') {
                        building.metal += player.item.stack_amount
                        ship.remove_entity(player.item)
                    } else if (player.item.type === 'explo') {
                        building.explo += player.item.stack_amount
                        ship.remove_entity(player.item)
                    }
                } else {
                    player.using_building = building
                    menu_options = options.map(
                        (entry, index) => ({
                            option: index,
                            product: entry.product,
                            cost: entry.cost
                        })
                    )
                    menu.show_factory_menu(player, building, menu_options)
                }
            }
        },
    }

    building.events.on('menu_choice', function(data) {
        const choice = building.options[data.option]
        building.production_queue.push(choice)
    })

    building.events.on('tick', function() {
        const is_already_producing = building.task && building.task.is_in_progress
        const nothing_to_produce = building.production_queue.length == 0
        if (is_already_producing || nothing_to_produce) {
            return
        }

        const choice = building.production_queue[0]
        if (choice.cost.metal > building.metal
            || choice.cost.explo > building.explo) {
                return
        }
        else {
            building.production_queue.shift()
            building.metal -= choice.cost.metal
            building.explo -= choice.cost.explo

            building.task = create_task({
                entity: building,
                duration: choice.time,
                on_finish: () => {
                    const product = choice.factory_function()
                    building.parent.add_entity_to_grid(product, building.pos_grid)
                },
                on_cancel: () => {
                    building.metal += choice.cost.metal
                    building.explo += choice.cost.explo
                }
            }).start()
        }
    }) 

    return Object.assign(
        building,
        state
    )
}

const options =  [
    {
        factory_function: _ => box.create_building_package(create_brick),
        product: {
            amount: 1,
            label: 'Brick'
        },
        cost: {
            metal: 2,
            explo: 0
        },
        time: 3000,
    },
    {
        factory_function: _ => box.create_building_package(create_ladder),
        product: {
            amount: 1,
            label: 'Ladder'
        },
        cost: {
            metal: 4,
            explo: 0
        },
        time: 3000,
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
        },
        time: 7000,
    },
]