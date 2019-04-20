
const CATEGORY_TRANSPARENT = 0x00
const CATEGORY_WALL = 0x01
const CATEGORY_BACK = 0x02
const CATEGORY_MOBILE = 0x04
const CATEGORY_PLAYER = 0x08

const MASK_BUILDING = CATEGORY_WALL | CATEGORY_BACK
const MASK_MOBILE = CATEGORY_WALL | CATEGORY_MOBILE | CATEGORY_PLAYER
const MASK_PLAYER = CATEGORY_WALL | CATEGORY_MOBILE
const MASK_TRANSPARENT = 0x00

const filter = {
    mobile: {
        category: CATEGORY_MOBILE,
        mask: MASK_MOBILE
    },

    building: {
        category: CATEGORY_BACK,
        mask: MASK_BUILDING
    },

    player: {
        category: CATEGORY_PLAYER,
        mask: MASK_PLAYER
    },

    transparent: {
        category: CATEGORY_TRANSPARENT,
        mask: MASK_TRANSPARENT
    },
}

exports.filter = filter