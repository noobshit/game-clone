const SMALL_BLOCK_SIZE = 32

Pos = {
    to_grid(pos) {
        return {
            x: Math.floor(pos.x / SMALL_BLOCK_SIZE),
            y: Math.floor(pos.y / SMALL_BLOCK_SIZE)
        }
    },
    to_snap(pos) {
        let snapped = {
            x: pos.x,
            y: pos.y,
            left: pos.x - Math.abs(pos.x % SMALL_BLOCK_SIZE),
            right: pos.x - Math.abs(pos.x % SMALL_BLOCK_SIZE) + SMALL_BLOCK_SIZE,
            top: pos.y - Math.abs(pos.y % SMALL_BLOCK_SIZE),
            bottom: pos.y - Math.abs(pos.y % SMALL_BLOCK_SIZE) + SMALL_BLOCK_SIZE,
        }
        return snapped
    }
}

module.exports = Pos