const {Ship} = require('./ship.js')
const Player = require('./player.js')
const GameMap = require('./gameMap.js')

const Matter = require('matter-js')
const Body = Matter.Body
const Engine = Matter.Engine
const Vector = Matter.Vector
const players = new Map()

const game = {
    add_player(socket_id, socket) {
        let player = new Player(socket)
        this.ship.add_entity(player, {x: 3, y: 3})
        players.set(socket_id, player)
    },

    remove_player(socket_id) {
        let entity = players.get(socket_id)
        game.ship.remove_entity(entity)
        players.delete(socket_id)    
    },

    process_input(socket_id, input) {
        if (game.input_buffer.has(socket_id)) {
            game.input_buffer.get(socket_id).push(input)
        } else {
            game.input_buffer.set(socket_id, [input])
        }
    },

    process_input_buffer() {
        for ([key, value] of game.input_buffer) {
            for (let input of value) {
                const player = players.get(key)
                if (!player) {
                    continue
                }

                const ship = player.parent
                const mouse_pos_inside_ship = {
                    x: input.mouse.pos_game.x - ship.position.left,
                    y: input.mouse.pos_game.y - ship.position.top
                }
                const event = {
                    from: player, 
                    ship: player.parent,
                    pos_game: mouse_pos_inside_ship,
                    pos_grid: Pos.to_grid(mouse_pos_inside_ship),
                    entites_ids: input.mouse.entites_ids,
                    entites: player.parent.entites.filter(e => input.mouse.entites_ids.includes(e.id))
                }

                const move_vector = {
                    x: 0,
                    y: 0
                }

                if (input.move_left) {
                    move_vector.x -= 1
                } 
                if (input.move_right) {
                    move_vector.x += 1
                }
                if (input.move_up) {
                    move_vector.y -= 1
                }
                if (input.move_down) {
                    move_vector.y += 1
                }

                if (!player.using_building) {
                    player.translate(Vector.mult(move_vector, player.speed ))
                } 

                if (ship.controlled_by == player) {
                    const ship_force = Vector.mult(move_vector, 0.001 * ship.body.mass)
                    Body.applyForce(ship.body, ship.body.position, ship_force)
                    ship.update_turret_angle(event.pos_game)
                }

                if (input.press_q) {
                    if (player.drop_item.can_execute()) {
                        player.drop_item.execute()
                    }
                }

                if (input.mouse0) {
                    player.on_left_button_down(event)
                }

                player.update_cursor(event)
            }

            game.input_buffer.set(key, [])
        }
    },

    tick() {
        game.ship.on_tick()
        game.map.on_tick()
        Engine.update(game.ship.engine)
        Engine.update(game.map.engine)
        game.process_input_buffer()
    },

    init() {
        game.input_buffer = new Map() 
        game.ship = new Ship(12, 8)
        game.map = new GameMap(40, 40)
        game.map.add_ship(game.ship)

        game.ship_2 = new Ship(12, 8)
        game.map.add_ship(game.ship_2)
    },

    get_map() {
        return game.map.get_entites()
    },
}
game.init()


const events = {
    on_input(socket_id, data) {
        game.process_input(socket_id, data)
    },

    on_connection(socket_id, socket) {
        game.add_player(socket_id, socket)
    },

    on_disconnect(socket_id) {
        game.remove_player(socket_id)
    },
}

module.exports = game
game.players = players
game.events = events