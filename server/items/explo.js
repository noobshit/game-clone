module.exports.create_explo = create_explo

const {create_box} = require('./box.js')
const {stackable} = require('./stackable')

function create_explo(amount=1) {
    const box = create_box('explo.png')
    box.type = 'explo'
    
    return Object.assign(
        box,
        stackable(box, amount, 16)
    )
}