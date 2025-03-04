'use strict'
import { Action } from "../classes/action.js"

/* 
    Events are any actions with an additional property of trigger
    Events are added to state or the creature depending on target
    Events are just actions with a different name (for now)

    Triggers:
        damage
            dealt
            taken
*/

class Event extends Action {
    constructor(eventName, type, archetype = {}, equipment, creature) {
        console.log( 'wtf')
        // Default options from action
        super(eventName, type, archetype, equipment, creature)
    }
}

export { Event }