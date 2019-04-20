
const category = {
    transparent: 0x00,
    wall: 0x01,
    back: 0x02,
    mobile: 0x04,
    player: 0x08
}

const mask = {
    building: category.wall | category.back,
    mobile: category.wall | category.mobile | category.player,
    player: category.wall | category.mobile,
    transparent: 0x00
} 

const filter = {
    mobile: {
        category: category.mobile,
        mask: mask.mobile
    },

    building: {
        category: category.back,
        mask: mask.building
    },

    player: {
        category: category.player,
        mask: mask.player
    },

    transparent: {
        category: category.transparent,
        mask: mask.transparent
    },
}

exports.filter = filter