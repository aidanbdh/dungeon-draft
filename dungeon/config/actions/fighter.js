'use strict'

import { roll } from "../../helper.js"

const actions = {
    "Second Wind": {
        priority: 2,
        condition: ['bloody'],
        cost: ['Bonus Action', 'secondWindUses'],
        range: 0,
        target: 'self',
        func: function(creature, _, __) {
            creature.hp += roll(10, 1, creature.level)
        }
    }
}

export { actions }