console.log('events')

const bound = 500

module.exports = {
    on_input: function(id, data) {
        let player = players.get(id)
        if (data.move_left) {
            player.x = Math.max(player.x - player.speed, 0)
        } 
        if (data.move_right) {
            player.x = Math.min(player.x + player.speed, bound)
        }
        if (data.move_up) {
            player.y = Math.max(player.y - player.speed, 0)
        }
        if (data.move_down) {
            player.y = Math.min(player.y + player.speed, bound)
        }
    },

    on_connection: function(id) {
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

    on_disconnect: function(id) {
        players.delete(id)    
    },
}
module.exports.players = new Map()
