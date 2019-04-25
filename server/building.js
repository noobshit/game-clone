const Matter = require('matter-js')
const Body = Matter.Body
const Query = Matter.Query
const Detector = Matter.Detector
const Composite = Matter.Composite
const Vector = Matter.Vector
const collision = require('./collision.js')
const Entity = require('./entity.js')


class Building extends Entity {
    constructor(width, height, image_key, options) {
        super(width, height, image_key, options)
    }

    can_build(pos) {
        let bodyA = this.body
        Body.setPosition(bodyA, {
            x: pos.left + this.offset.x,
            y: pos.top + this.offset.y
        })
        let bodies = Composite.allBodies(this.world)
        let can_collide_with = bodies.filter(
            bodyB => Detector.canCollide(bodyA.collisionFilter, bodyB.collisionFilter)
        )
        let collisions = Query.collides(bodyA, can_collide_with)
        let is_not_colliding = collisions.length == 0
        let bounds = this.parent.bounds
        let pos_is_inside_ship = bounds.left < pos.x 
            && bounds.right > pos.x
            && bounds.top < pos.y
            && bounds.bottom > pos.y
        return is_not_colliding && pos_is_inside_ship
    }


    build(pos_grid) {
        this.parent.add_entity(this, pos_grid)
    }


    get bounds() {
        return {
            left: this.body.bounds.min.x,
            right: this.body.bounds.max.x,
            top: this.body.bounds.min.y,
            bottom: this.body.bounds.max.y,
        }
    }

}

class Brick extends Building {
    constructor() {
        super(
            1,
            1,
            'brick.png', 
            {
                isStatic: true,
            }   
        )

        this.is_background = true
    }
}


class Helm extends Building {
    constructor() {
        super(
            2,
            2,
            'helm.png', 
            {
                isStatic: true,
            }   
        )

        this.is_background = true
        this.used_by = null
    }

    set used_by(value) {
        this._used_by = value
        if (this.parent) {
            this.parent.controlled_by = value
        }
    }

    get used_by() {
        return this._used_by
    }

    get left_button_down() {
        let helm = this
        return {
            target(event) {
                return null
            },
            can_execute(event) {
                return !helm.used_by && !event.ship.controlled_by
            },
            execute(event) {
                helm.used_by = event.from
                event.ship.controlled_by = event.from
                event.from.using_building = helm
            }
        }
    }
}


class Ladder extends Building {
    constructor() {
        super(
            1, 
            1,
            'ladder.png',
            {
                isStatic: true,
                collisionFilter: collision.filter.BUILDING
            }
        )
    }
}


class Factory extends Building {
    constructor() {
        super(
            2,
            2,
            'factory.png',
            {
                isStatic: true,
                collisionFilter: collision.filter.BUILDING
            }
        )
    }
}


class Turret extends Building {
    constructor() {
        super(
            3, 
            1,
            'brick.png',
            {
                isStatic: true,
                collisionFilter: collision.filter.BUILDING
            }
        )

        this.barrel = new Barrel()
        this.angle = 0
    }

    get parent() {
        return this._parent
    }
    
    set parent(value) {
        this._parent = value

        if (this.barrel) {
            this.barrel.parent = value
        }
    }

    follow_point(point) {
        this.angle = Vector.angle(this.body.position, point)
        Body.setAngle(this.barrel.body, this.angle)
    }

    can_build(pos) {
        const ship_bounds = this.parent.bounds
        const is_left_wall = pos.left == ship_bounds.left 
        const is_right_wall = pos.right == ship_bounds.right 
        const is_vertical_wall = is_left_wall || is_right_wall
        const is_top_wall = pos.top == ship_bounds.top 
        const is_bottom_wall = pos.bottom == ship_bounds.bottom 
        const is_horizontal_wall = is_top_wall || is_bottom_wall

        const body = this.body
        const barrel = this.barrel.body
        if (is_top_wall) {
            const angle = 0
            Body.setAngle(body, angle)
            Body.setPosition(body, {
                x: pos.left + this.offset.x,
                y: pos.top + this.offset.y
            })

            Body.setAngle(barrel, 0 - Math.PI / 2)
            Body.setPosition(barrel, {
                x: pos.left + this.offset.x,
                y: pos.top + this.offset.y - this.offset.x,
            })
        } else if (is_right_wall) {
            const angle = 1 * Math.PI / 2
            Body.setAngle(body, angle)
            Body.setPosition(body, {
                x: pos.left + this.offset.y,
                y: pos.top + this.offset.x
            })

            Body.setAngle(barrel, angle - Math.PI / 2)
            Body.setPosition(barrel, {
                x: pos.left + this.offset.y + this.offset.x,
                y: pos.top  + this.offset.x,
            })
        } else if (is_bottom_wall) {
            Body.setAngle(body, 2 * Math.PI / 2)
            Body.setPosition(body, {
                x: pos.left + this.offset.x,
                y: pos.top + this.offset.y
            })
            
            Body.setAngle(barrel, 1 * Math.PI / 2)
            Body.setPosition(barrel, {
                x: pos.left + this.offset.x,
                y: pos.top + this.offset.y + this.offset.x,
            })
        } else if (is_left_wall) {
            Body.setAngle(body, 3 * Math.PI / 2)
            Body.setPosition(body, {
                x: pos.left + this.offset.y,
                y: pos.top + this.offset.x
            })

            Body.setAngle(barrel, 2 * Math.PI / 2)
            Body.setPosition(barrel, {
                x: pos.left + this.offset.y - this.offset.x,
                y: pos.top + this.offset.x,
            })
        } else {
            Body.setAngle(body, 0)
            Body.setPosition(body, {
                x: pos.left + this.offset.x,
                y: pos.top + this.offset.y
            })

            Body.setAngle(barrel, 0)
            Body.setPosition(barrel, {
                x: pos.left + this.offset.x,
                y: pos.top + this.offset.y,
            })
        }

        const is_corner = is_vertical_wall && is_horizontal_wall
        if (is_corner || !(is_vertical_wall || is_horizontal_wall)) {
            return false
        }

        return true
    }

    build(pos_grid) {
        this.parent.add_entity_base(this)
        this.parent.add_entity_base(this.barrel)
    }
}

class Barrel extends Building {
    constructor() {
        super(
            3, 
            0.5,
            'turret_barrel.png',
            {
                isStatic: true
            }
        )
    }
}

module.exports.Turret = Turret
module.exports.Brick = Brick
module.exports.Factory = Factory
module.exports.Helm = Helm
module.exports.Ladder = Ladder
module.exports.Building = Building