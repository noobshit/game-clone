module.exports.create_brick = create_brick

const {create_building} = require('./building')

function create_brick() {
    const building = create_building(
        1,
        1,
        'brick.png', 
        {
            isStatic: true,
        }   
    )
    
    const state = {
        is_background: true,
        factory_function: create_brick
    }
    
    return Object.assign(
        building,
        state
    )
}
