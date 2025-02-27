'use strict'

import { roll } from "../../helper.js"

const actions = {
    // Feats
    'Savage Attacker': {
        priority: 3,
        trigger: 'damage',
        range: 0,
        cost: [],
        target: 'self',
        func: function(_, __, event) {
            // Reroll the damage dice
            // Use the higher total for damage
        }
    }
}

export { actions }