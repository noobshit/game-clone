const bound = 500

const players = new Map()
const entites = []

const game = {
    add_player: function(id) {
        let player = {
            x: Math.random() * bound,
            y: Math.random() * bound,
            width: 10 + Math.random() * 20, 
            height: 10 + Math.random() * 20,
            speed: 3,
            id: id
        }
        players.set(id, player)
    },

    remove_player: function(id) {
        players.delete(id)    
    },

    process_input: function(id, input) {
        if (game.input_buffer.has(id)) {
            game.input_buffer.get(id).push(input)
        } else {
            game.input_buffer.set(id, [input])
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
        
                if (input.move_left) {
                    player.x = Math.max(player.x - d, 0)
                } 
                if (input.move_right) {
                    player.x = Math.min(player.x + d, bound)
                }
                if (input.move_up) {
                    player.y = Math.max(player.y - d, 0)
                }
                if (input.move_down) {
                    player.y = Math.min(player.y + d, bound)
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
        game.add_ship()
    },

    add_ship: function() {
        let width = 12
        let height = 8

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (x == 0 || x == width - 1 || y == 0 || y == height - 1)
                {
                    entites.push({
                        x: x * 32,
                        y: y * 32,
                        width: 32,
                        height: 32,
                        image_key: 'brick.png'
                    })
                }
            }
        }
    }
}
game.init()


const events = {
    on_input: function(id, data) {
        game.process_input(id, data)
    },

    on_connection: function(id) {
        game.add_player(id)
    },

    on_disconnect: function(id) {
        game.remove_player(id)
    },
}

module.exports = game
game.players = players
game.events = events
game.entites = entites