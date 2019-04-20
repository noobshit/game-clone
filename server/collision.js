
const category = {
    TRANSPARENT: 0x00,
    WALL: 0x01,
    BACK: 0x02,
    MOBILE: 0x04,
    PLAYER: 0x08
}

const mask = {
    BUILDING: category.WALL | category.BACK,
    MOBILE: category.WALL | category.MOBILE | category.PLAYER,
    PLAYER: category.WALL | category.MOBILE,
    TRANSPARENT: 0x00
} 

const filter = {
    MOBILE: {
        category: category.MOBILE,
        mask: mask.MOBILE
    },

    BUILDING: {
        category: category.BACK,
        mask: mask.BUILDING
    },

    PLAYER: {
        category: category.PLAYER,
        mask: mask.PLAYER
    },

    TRANSPARENT: {
        category: category.TRANSPARENT,
        mask: mask.TRANSPARENT
    },
}

exports.filter = filter