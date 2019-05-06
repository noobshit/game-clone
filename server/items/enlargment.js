module.exports.create_enlargment = create_enlargment

const {create_box} = require('./box.js')
const {create_brick} = require('../buildings')
const Pos = require('../pos.js')
const SMALL_BLOCK_SIZE = 32

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
                        y: event.ship.bounds.bottom
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