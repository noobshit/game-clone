module.exports.create_brick = create_brick

const {create_building} = require('./building')

function create_brick() {
    const building = create_building({
        width: 1,
        height: 1,
        image_key: 'brick.png', 
        options: {
            isStatic: true,
        }   
    })
    
    const state = {
        is_background: true,
        factory_function: create_brick
    }
    
    return Object.assign(
        building,
        state
    )
}
