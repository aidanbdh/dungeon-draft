'use strict'

// Contains any monster's custom actions

import { roll } from "../../helper.js"

const actions = {
    "Undead Fortitude": {
        priority: 0,
        trigger: 'test',
        range: 0,
        cost: [],
        target: 'self',
        func: function(creature, event, state, log) {
            // Log
            log.push('Undead Fortitude')
        }
    }
}

export { actions }