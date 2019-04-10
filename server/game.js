const bound = 500

const players = new Map()

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
        const player = players.get(id)
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
    },
}


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

exports.players = players
exports.events = events