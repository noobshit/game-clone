const SMALL_BLOCK_SIZE = 32

Pos = {
    to_grid: function(pos) {
        return {
            x: Math.floor(pos.x / SMALL_BLOCK_SIZE),
            y: Math.floor(pos.y / SMALL_BLOCK_SIZE)
        }
    },
    to_snap: function(pos) {
        let snapped = {
            x: pos.x,
            y: pos.y,
            left: pos.x - Math.abs(pos.x % SMALL_BLOCK_SIZE),
            top: pos.y - Math.abs(pos.y % SMALL_BLOCK_SIZE)
        }
        return snapped
    }
}

module.exports = Pos