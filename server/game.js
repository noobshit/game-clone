
const SMALL_BLOCK_SIZE = 32
const BIG_BLOCK_SIZE = 8 * SMALL_BLOCK_SIZE

const {Ship} = require('./ship.js')
const Player = require('./player.js')
const Entity = require('./entity.js')

const Matter = require('matter-js')
const Body = Matter.Body
const Bodies = Matter.Bodies
const Engine = Matter.Engine
const World = Matter.World
const players = new Map()

class GameMap {
    constructor(width, height) {
        this.engine = Engine.create()
        this.world = this.engine.world
        this.world.gravity.y = 0
        this.entites = []
        for (let x = 0; x < width; x += 1) {
            for (let y = 0; y < height; y += 1) {
                if (y == height - 1 || x == 0 || x == width - 1 || y == 0) {
                    this.add_block({x, y})
                }
            }
        }
    }
    
    add_block(pos_grid) {
        this.add_entity(new Block(), {
            x: pos_grid.x * 8 * SMALL_BLOCK_SIZE, 
            y: pos_grid.y * 8 * SMALL_BLOCK_SIZE
        })
    }

    add_entity(entity, pos) {
        Body.setPosition(entity.body, pos)
        World.add(this.world, entity.body)
        this.entites.push(entity)
    }

    get_entites() {
        return this.entites.map(e => e.get_entity())
    }

    add_ship(ship) {
        World.add(this.world, ship.body)
    }
}

class Block extends Entity {
    constructor() {
        super(
            8, 
            8,
            'brick.png',
            {
                isStatic: true,
            }
        )
    }
}

const game = {
    add_player: function(socket_id, socket) {
        let player = new Player(socket)
        this.ship.add_entity(player, {x: 3, y: 3})
        players.set(socket_id, player)
    },

    remove_player: function(socket_id) {
        let entity = players.get(socket_id)
        game.ship.remove_entity(entity)
        players.delete(socket_id)    
    },

    process_input: function(socket_id, input) {
        if (game.input_buffer.has(socket_id)) {
            game.input_buffer.get(socket_id).push(input)
        } else {
            game.input_buffer.set(socket_id, [input])
        }
    },

    process_input_buffer: function() {
        for ([key, value] of game.input_buffer) {
            for (let input of value) {
                const player = players.get(key)
                if (!player) {
                    continue
                }
                const d = player.speed 
                let dx = 0
                let dy = 0

                if (input.move_left) {
                    dx -= d
                } 
                if (input.move_right) {
                    dx += d
                }
                if (input.move_up) {
                    dy -= d
                }
                if (input.move_down) {
                    dy += d
                }

                let ship_force = 0.001
                let force = {x: 0, y: 0}
                let ship = player.parent
                if (input.arrow_left) {
                    force.x -= ship_force
                }

                if (input.arrow_right) {
                    force.x += ship_force
                }

                if (input.arrow_up) {
                    force.y -= ship_force
                }

                if (input.arrow_down) {
                    force.y += ship_force
                }

                force.x = force.x * ship.body.mass
                force.y = force.y * ship.body.mass
                
                Body.applyForce(ship.body, ship.body.position, force)

                if ( dx != 0 || dy != 0) {
                    player.translate({x: dx, y: dy})
                }

                if (input.press_q) {
                    if (player.drop_item.can_execute()) {
                        player.drop_item.execute()
                    }
                }

                mouse_pos_inside_ship = {
                    x: input.mouse.pos_game.x - ship.position.left,
                    y: input.mouse.pos_game.y - ship.position.top
                }
                let event = {
                    from: player, 
                    ship: player.parent,
                    pos_game: mouse_pos_inside_ship,
                    pos_grid: Pos.to_grid(mouse_pos_inside_ship),
                    entites_ids: input.mouse.entites_ids,
                    entites: player.parent.entites.filter(e => input.mouse.entites_ids.includes(e.id))
                }

                if (input.mouse0) {
                    player.on_left_button_down(event)
                }

                player.update_cursor(event)
            }

            game.input_buffer.set(key, [])
        }
    },

    tick: function() {
        Engine.update(game.ship.engine)
        Engine.update(game.map.engine)
        game.process_input_buffer()
    },

    init: function() {
        game.input_buffer = new Map() 
        game.ship = new Ship(12, 8)
        game.map = new GameMap(40, 40)
        game.map.add_ship(game.ship)

        game.ship_2 = new Ship(12, 8)
        game.map.add_ship(game.ship_2)
    },

    get_map: function() {
        return game.map.get_entites()
    },
}
game.init()


const events = {
    on_input: function(socket_id, data) {
        game.process_input(socket_id, data)
    },

    on_connection: function(socket_id, socket) {
        game.add_player(socket_id, socket)
    },

    on_disconnect: function(socket_id) {
        game.remove_player(socket_id)
    },
}

module.exports = game
game.players = players
game.events = events