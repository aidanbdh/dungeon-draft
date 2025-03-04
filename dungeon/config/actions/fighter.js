'use strict'

import { roll } from "../../helper.js"

const actions = {
    "Second Wind": {
        priority: 2,
        condition: ['bloodied'],
        cost: ['Bonus Action', 'secondWindUses'],
        range: 0,
        target: 'self',
        func: function(creature, _, __, log) {
            const healing = roll(10, 1, creature.level)
            creature.hp += healing
            log.push(`Used Second Wind to regain ${healing} hp.`)
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
    }
}

const events = {
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

export { actions, events }