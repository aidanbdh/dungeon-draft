'use strict'
import { Action } from "../classes/action.js"

/* 
    Events are any actions with an additional property of trigger
    Events are added to state or the creature depending on target
*/

class Event extends Action {
    constructor(eventName, type, archetype = {}, equipment, creature, trigger) {
        // Default options from action
        super(eventName, type, archetype = {}, equipment, creature)
        // Add trigger to event
        this.trigger = trigger
    }
}

export { Event }