function tick() {    
    window.requestAnimationFrame(tick)

    check_input()
    
    displayer.clear()
    displayer.center_camera_on_entity(state.player)

    state.entites.forEach(displayer.draw_entity)

    let data = build_input_packet()
    socket.emit('input', data)
}


function check_input() {
    if (keyboard.is_key_pressed['f']) {
        displayer.zoom_in()
    }

    if (keyboard.is_key_pressed['r']) {
        displayer.zoom_out()
    }
}


function build_input_packet() {
    let input = {}
    for (let [key, value] of mouse.is_button_pressed) {
        if (value) {
            input['mouse' + key] = value
        }
    }
    

    return Object.assign(input, {
        move_left: keyboard.is_key_pressed['a'],
        move_right: keyboard.is_key_pressed['d'],
        move_up: keyboard.is_key_pressed['w'],
        move_down: keyboard.is_key_pressed['s'],
        press_q: keyboard.is_key_pressed['q'],
    })
}

tick()  
