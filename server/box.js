const Entity = require('./entity.js')
const collison = require('./collision.js')
const Cursor = require('../shared/cursor.js')
const {Building, Brick} = require('./building.js')
const Pos = require('./pos.js')
const SMALL_BLOCK_SIZE = 32

class Box extends Entity {
    constructor(image_key) {
        super(
            0.8,
            0.8,
            image_key,
            {
                collisionFilter: collison.filter.MOBILE
            }
        )
    }
}


class Wrench extends Box {
    constructor() {
        super('wrench.png')
    }

    get use() {
        return {
            target(event) {
                return event.entites.find(e => e instanceof Building)
            },
            can_execute(event) {
                return event.entites.some(e => e instanceof Building)
            },
            execute(event) {
                let building = this.target(event)
                let building_package = new BuildingPackage(building.constructor)
                event.ship.add_entity_to_grid(building_package, building.pos_grid)
                event.ship.remove_entity(building)
            }
        }
    }
}


class Shredder extends Box {
    constructor() {
        super('shredder.png')
    }

    get use() {
        let shredder = this
        return {
            target(event) {
                return event.entites.find(e => e instanceof Box && e != shredder)
            },
            can_execute(event) {
                return event.entites.some(e => e instanceof Box && e != shredder)
            },
            execute(event) {
                let box = this.target(event)
                event.ship.remove_entity(box)
            }
        }
    }
}


class Enlargment extends Box {
    constructor() {
        super('enlargment.png')
    }

    get use() {
        let enlargment = this
        return {
            target(event){
                return null
            },  
            can_execute(event) {
                return event.pos_game.x >= 0 
                && event.pos_game.y >= 0
                && event.pos_game.x < event.ship.width
                && event.pos_game.y < event.ship.height
            },
            execute(event) {
                let entites_to_move = event.ship.entites.filter(
                    e => e.pos_grid.x > event.pos_grid.x
                )                
                entites_to_move.forEach(e => e.translate({
                    x: SMALL_BLOCK_SIZE, 
                    y: 0
                }))
                event.ship.add_entity_to_grid(new Brick(), {
                    x: event.pos_grid.x + 1, 
                    y: 0
                })
                
                const pos = Pos.to_grid({
                    x: event.pos_game.x,
                    y: event.ship.bounds.bottom
                })
                pos.x += 1
                pos.y -= 1
                event.ship.add_entity_to_grid(new Brick(), pos)
                event.ship.remove_entity(enlargment)
            }
        }
    }
}


class Explo extends Box {
    constructor() {
        super('explo.png')
    }
}


class Metal extends Box {
    constructor() {
        super('metal.png')
    }
}


class BuildingPackage extends Box {
    constructor(building_class) {
        let building = new building_class()
        super(building.image_key)
        this.building_class = building_class
        this.building = building
    }

    set parent(value) {
        this._parent = value
        if (this.building) {
            this.building.parent = value
        }
    }

    get parent() {
        return this._parent
    }

    get use() {
        let building_package = this
        return {
            target(event) {
                return null
            },
            can_execute(event){
                return building_package.building.can_build(Pos.to_snap(event.pos_game))
            },
            execute(event) {
                building_package.building.build(event.pos_grid)        
                building_package.building = null
                building_package.parent.remove_entity(building_package)
            }
        }
    }

    get_cursor(event) {
        return new Cursor(
            Cursor.type.BUILD, 
            {
                can_use: this.use.can_execute(event), 
                data: this.building.get_entity()
            }
        )
    }
}

module.exports.Box = Box
module.exports.BuildingPackage = BuildingPackage
module.exports.Metal = Metal
module.exports.Explo = Explo
module.exports.Wrench = Wrench
module.exports.Shredder = Shredder
module.exports.Enlargment = Enlargment