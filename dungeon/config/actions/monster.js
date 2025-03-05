'use strict'

// Contains any monster's custom actions

import { roll, check } from "../../helper.js"

const actions = {
    "Undead Fortitude": {
        priority: 0,
        trigger: 'death',
        range: 0,
        cost: [],
        target: 'self',
        func: function(creature, event, _, log) {
            // Set the HP to 1 if conditions are met
            if (event.damageType !== 'Radiant' && event.crit === false && check(creature, 'con', 5 + event.damage)) {
                creature.hp = 1
                log.push(`${creature.name} attempted Undead Fortitude and succeeded`)
            } else {
                log.push(`${creature.name} attempted Undead Fortitude and failed`)
            }

        }
    }
}

export { actions }