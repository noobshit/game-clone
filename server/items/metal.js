module.exports = create_metal

const create_box = require('./box.js')
const stackable = require('./stackable')

function create_metal(amount=1) {
    const box = create_box('metal.png')
    box.type = 'metal'

    return Object.assign(
        box,
        stackable(box, amount, 16)
    )
}