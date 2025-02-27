'use strict'

import { roll } from "../../helper.js"

const actions = {
    "Second Wind": {
        priority: 2,
        condition: ['bloody'],
        cost: ['Bonus Action', 'secondWindUses'],
        range: 0,
        target: 'self',
        func: function(creature, _, __, log) {
            creature.hp += roll(10, 1, creature.level)
            log.push('Second Wind')
        }
    },
    "Action Surge": {
        priority: 3,
        cost: ['actionSurgeUses'],
        range: 0,
        target: 'self',
        func: function(creature, _, __, log) {
            creature.Action += 1
            log.push('Action Surge')
        }
    },
    "Tactical Mind": {
        priority: 0,
        trigger: 'abilitycheck-fail',
        range: 0,
        cost: ['secondWindUses'],
        target: 'self',
        func: function(_, __, state, log) {
            // Reroll and add 10 to the check
            log.push('Tactical Mind')
        }
    }
}

export { actions }