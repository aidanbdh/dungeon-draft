'use strict'

import { roll } from "../../helper.js"

const actions = {
    // Feats
    
}

const events = {
    // Feats
    'Savage Attacker': {
        priority: 3,
        trigger: 'damage',
        range: 0,
        cost: [],
        target: 'self',
        func: function(_, __, state, log) {
            // Reroll the damage dice
            // Use the higher total for damage
            log.push('Savage Attacker')
        }
    }
}

export { actions, events }