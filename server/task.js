module.exports.create_task = create_task

function create_task({
    entity,
    duration = 0,
    on_finish = _ => {},
    on_cancel = _ => {}
}) {
    let is_in_progress = false

    const behaviour = {
        get is_in_progress() {
            return is_in_progress
        },

        get percent_done() {
            const time_elapsed = Date.now() - behaviour.start_time
            return Math.min(100, time_elapsed * 100 / duration)
        },

        start() {
            behaviour.start_time = Date.now()
            entity.events.on('tick', behaviour.on_tick)
            is_in_progress = true
            return this
        },
        
        on_tick() {
            if (behaviour.start_time + duration < Date.now()) {
                behaviour.finish()
            }
        },

        finish() {
            is_in_progress = false
            on_finish()
            entity.events.removeListener('tick', behaviour.on_tick)
        },

        cancel() {
            if (is_in_progress) {
                is_in_progress = false
                on_cancel()
                entity.events.removeListener('tick', _ => behaviour.on_tick)
            }
        }
    }
    return behaviour
}