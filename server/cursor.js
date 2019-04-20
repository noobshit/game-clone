const CURSOR = {
    DEFAULT: 1,
    BUILD: 2,
    GRAB: 3,
}

class Cursor {
    constructor(action, options) {
        this.action = action
        this.target = null
        this.can_use = null
        this.data = null

        Object.assign(this, options)
    }

}

module.exports.Cursor = Cursor
module.exports.CURSOR = CURSOR