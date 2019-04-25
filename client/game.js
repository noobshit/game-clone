function tick() {    
    window.requestAnimationFrame(tick)

    check_input()
    
    displayer.clear()
    displayer.center_camera_on_entity(state.player)

    state.map.forEach(displayer.draw_entity)
    let background_entites = state.entites.filter(e => e.is_background)
    let front_entites = state.entites.filter(e => !e.is_background)
    background_entites.forEach(displayer.draw_entity)
    front_entites.forEach(displayer.draw_entity)
    displayer.draw_cursor(state.cursor)

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
    mouse.update()
    let input = {}
    for (let [key, value] of mouse.is_button_pressed) {
        if (value) {
            input['mouse' + key] = value
            mouse.is_button_pressed.set(key, false)
        }
    }
    input['mouse'] = {
        entites_ids: mouse.entites_ids,
        pos_game: mouse.game_pos
    }
    

    return Object.assign(input, {
        move_left: keyboard.is_key_pressed['a'],
        move_right: keyboard.is_key_pressed['d'],
        move_up: keyboard.is_key_pressed['w'],
        move_down: keyboard.is_key_pressed['s'],
        jump: keyboard.is_key_pressed[' '],
        press_q: keyboard.is_key_pressed['q'],
        arrow_left: keyboard.is_key_pressed['ArrowLeft'],
        arrow_right: keyboard.is_key_pressed['ArrowRight'],
        arrow_up: keyboard.is_key_pressed['ArrowUp'],
        arrow_down: keyboard.is_key_pressed['ArrowDown'],
    })
}

tick()  
