
module.exports.create_block = create_block

const create_entity = require('../entity.js')

function create_block() {
    return create_entity({
        width: 8, 
        height: 8,
        image_key: 'brick.png',
        options: {
            isStatic: true,
        }
    })
}