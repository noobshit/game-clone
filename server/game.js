const bound = 500

const Ship = require('./ship.js')
const players = new Map()
const entites = []

const game = {
    add_player: function(socket_id) {
        let player = this.ship.add_player()
        players.set(socket_id, player)
    },

    remove_player: function(socket_id) {
        let entity = players.get(socket_id)
        game.ship.remove_entity(entity)
        players.delete(socket_id)    
    },

    process_input: function(socket_id, input) {
        if (game.input_buffer.has(socket_id)) {
            game.input_buffer.get(socket_id).push(input)
        } else {
            game.input_buffer.set(socket_id, [input])
        }
    },

    process_input_buffer: function() {
        for ([key, value] of game.input_buffer) {
            for (let input of value) {
                const player = players.get(key)
                if (!player) {
                    continue
                }
                const d = player.speed 
                let dx = 0
                let dy = 0

                if (input.move_left) {
                    dx -= d
                } 
                if (input.move_right) {
                    dx += d
                }
                if (input.move_up) {
                    dy -= d
                }
                if (input.move_down) {
                    dy += d
                }

                if ( dx != 0 || dy != 0) {
                    player.translate({x: dx, y: dy})
                }
            }

            game.input_buffer.set(key, [])
        }
    },

    tick: function() {
        game.process_input_buffer()
    },

    init: function() {
        game.input_buffer = new Map() 
        game.ship = new Ship(12, 8)
    },
}
game.init()


const events = {
    on_input: function(socket_id, data) {
        game.process_input(socket_id, data)
    },

    on_connection: function(socket_id) {
        game.add_player(socket_id)
    },

    on_disconnect: function(socket_id) {
        game.remove_player(socket_id)
    },
}

module.exports = game
game.players = players
game.events = events
game.entites = entites