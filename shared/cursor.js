const type = {
    DEFAULT: 1,
    BUILD: 2,
    GRAB: 3,
}

function create(action, options) {
    const state = {
        action,
        target: null,
        can_use: null,
        data: null,
    }

    return Object.assign(
        state, 
        options
    )

}

Cursor = {
    type
}

if (typeof module !== 'undefined') {
    module.exports = {
        type,
        create
    }
} 