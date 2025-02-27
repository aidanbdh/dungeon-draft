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
    },
    "Action Surge": {
        priority: 2,
        trigger: 'attack',
        cost: ['actionSurgeUses'],
        range: 0,
        target: 'self',
        func: function(creature, _, __) {
            creature.Action += 1
        }
    },
    "Tactical Mind": {
        priority: 0,
        trigger: 'abilitycheck-fail',
        range: 0,
        cost: ['secondWindUses'],
        target: 'self',
        func: function(_, __, event) {
            // Reroll and add 10 to the check
        }
    }
}

export { actions }