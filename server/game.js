const {create_ship} = require('./ship')
const create_player = require('./player')
const {create_game_map} = require('./overworld')

const Matter = require('matter-js')
const Body = Matter.Body
const Engine = Matter.Engine
const Vector = Matter.Vector
const players = new Map()

const game = {
    add_player(socket_id, socket) {
        let player = create_player(socket)
        this.ship.add_entity_to_grid(player, {x: 3, y: 3})
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
                    player,
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
                if (input.jump) {
                    Body.setVelocity(player.body, {
                        x: player.body.velocity.x,
                        y: -5
                    })
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
                    if (player.drop_item.can_execute(event)) {
                        player.drop_item.execute(event)
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

    on_menu_choice(socket_id, data) {
        const player = players.get(socket_id)
        const owner = player.parent.entites.find(e => e.id == data.menu_owner)
        if (!owner) {
            return
        }

        owner.events.emit('menu_choice', {
                player,
                ...data
            }
        )
    },

    on_menu_close(socket_id) {
        const player = players.get(socket_id)
        if (player) {
            player.using_building = null
        }
    },

    tick() {
        game.sockets = game.sockets.filter(socket => socket.connected)

        game.ship.world_events.emit('tick')
        game.map.world_events.emit('tick')
        Engine.update(game.ship.engine)
        Engine.update(game.map.engine)
        game.process_input_buffer()
    
        game.sockets.forEach(socket => {
            let player = game.players.get(socket.id)
            socket.emit('update', {
                entites: player.parent.get_display_data(),
                player: player.get_display_data(),
                cursor: player.cursor,
                map: game.get_map(),
            })
        })
    },

    init(io) {
        game.sockets = []
        game.input_buffer = new Map() 
        game.ship = create_ship(12, 8)
        game.map = create_game_map(40, 40)
        game.map.add_ship(game.ship)

        game.ship_2 = create_ship(12, 8)
        game.map.add_ship(game.ship_2)

        io.on('connection', (socket) => { 
            let {id} = socket
            game.add_player(id, socket)
            socket.on('input', data => game.process_input(id, data))
            socket.on('disconnect', data => game.remove_player(id))
            socket.on('menu_choice', data => game.on_menu_choice(id, data))
            socket.on('menu_close', _ => game.on_menu_close(id))
            game.sockets.push(socket)
        })

        setInterval(game.tick, 1000 / 60)
    },

    get_map() {
        return game.map.get_display_data()
    },
}

module.exports = game
game.players = players