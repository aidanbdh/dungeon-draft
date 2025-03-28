'use strict'

// Contains any monster's custom actions

import { roll, check } from "../../helper.js"

const actions = {
    "Nimble Escape": {
        priority: 0,
        range: 0,
        cost: ["Bonus Action"],
        target: 'self',
        func: function(creature, _, state, log) {
            // Check for movement
            if (creature.movement <= 0)
                return
            let newPosition = creature.position + (creature.movement / 5)
            // Adjust position for end of room
            if (newPosition >= state.room.length)
                newPosition = state.room.length - 1
            // Move with no opportunity attacks
            creature.disengage = true
            log.push(`${creature.name} used Nimble Escape to Disengage`)
            if (newPosition !== creature.position)
                state.move(creature, newPosition)
        }
    },
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