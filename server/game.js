
const SMALL_BLOCK_SIZE = 32
const BIG_BLOCK_SIZE = 8 * SMALL_BLOCK_SIZE
const bound = 500

const {Ship, Player, Pos} = require('./ship.js')
const Matter = require('matter-js')
const Body = Matter.Body
const Bodies = Matter.Bodies
const Engine = Matter.Engine
const World = Matter.World
const Constraint = Matter.Constraint
const Query = Matter.Query
const Detector = Matter.Detector
const Composite = Matter.Composite
const players = new Map()

class GameMap {
    constructor(width, height) {
        this.fields = new Array(width)
        this.blocks = []
        for (let x = 0; x < width; x += 1) {
            this.fields[x] = new Array(height)
            for (let y = 0; y < height; y += 1) {
                if (y == height - 1 || x == 0 || x == width - 1 || y == 0) {
                    this.fields[x][y] = true
                    this.blocks.push(
                        {
                            x: x * BIG_BLOCK_SIZE, 
                            y: y * BIG_BLOCK_SIZE,
                            width: BIG_BLOCK_SIZE,
                            height: BIG_BLOCK_SIZE,
                            angle: 0,
                            image_key: 'brick.png'
                        })
                }
            }
        }
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

                let ship_speed = 75
                let ship = player.parent
                if (input.arrow_left) {
                    ship.translate({x: -ship_speed, y: 0})
                }

                if (input.arrow_right) {
                    ship.translate({x: +ship_speed, y: 0})
                }

                if (input.arrow_up) {
                    ship.translate({x: 0, y: -ship_speed})
                }

                if (input.arrow_down) {
                    ship.translate({x: 0, y: +ship_speed})
                }

                if ( dx != 0 || dy != 0) {
                    player.translate({x: dx, y: dy})
                }

                if (input.press_q) {
                    if (player.drop_item.can_execute()) {
                        player.drop_item.execute()
                    }
                }

                let event = {
                    from: player, 
                    ship: player.parent,
                    pos_game: input.mouse.pos_game,
                    pos_grid: Pos.to_grid(input.mouse.pos_game),
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
        Engine.update(game.engine)
        game.process_input_buffer()
    },

    init: function() {
        game.input_buffer = new Map() 
        game.ship = new Ship(12, 8)
        game.engine = Engine.create()
        game.world = game.engine.world
        game.map = new GameMap(40, 40)
        for (let block of game.map.blocks) {
            let body = Bodies.rectangle(
                block.x, 
                block.y,
                block.width,
                block.height,
                {
                    isStatic: true
                }
            )
            World.add(game.world, body)
        }
        World.add(game.world, game.ship.body)
    },

    get_map: function() {
        return game.map.blocks
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