module.exports = stackable

function stackable(entity, stack_amount=1, stack_limit=16) {
    const state = {
        stack_amount,
        stack_limit,
        stack_with(target) {
            const [bigger, smaller] = [entity, target].sort((a,b) => b.stack_amount - a.stack_amount)
            const move_amount = Math.min(
                bigger.stack_limit - bigger.stack_amount,
                smaller.stack_amount
            )

            if (move_amount > 0) {
                smaller.stack_amount -= move_amount
                bigger.stack_amount += move_amount

                if (smaller.stack_amount == 0) {
                    smaller.parent.remove_entity(smaller)
                }
            }
        }
    }

    entity.events.on('collision_start', function(event) {
        if (event.collided_with.type === entity.type) {
            entity.stack_with(event.collided_with)
        }
    })

    return state
}