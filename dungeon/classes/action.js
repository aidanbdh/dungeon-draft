'use strict'

// Get generic actions
import { actions as generalActions } from '../config/actions/general.js'
// Get class options for actions
import { actions as fighterActions } from '../config/actions/fighter.js'
// Get monster options for actions
import { actions as monsterActions } from '../config/actions/monster.js'
// Get adventurer options for actions
import { actions as adventurerActions } from '../config/actions/adventurer.js'

const actions = {
    general: generalActions,
    fighter: fighterActions,
    monster: monsterActions,
    adventurer: adventurerActions
}

class Action {

    /*
        name
        priority
        cost
        condition
        range
        target
        func
    */

    constructor(actionName, type, archetype = {}, equipment, creature) {
        // Find the action based on class then general
        let action = actions[type][actionName] || actions.adventurer[actionName] || actions.general[actionName] || actionName
        // Handle attack actions
        if (actionName.indexOf('Attack-') !== -1) {
            // Create a copy of the generic action
            action = JSON.parse(JSON.stringify(actions.general.attack))
            // Find the right equipment
            equipment = equipment.filter(({ name }) => {
                return name === actionName.slice(actionName.indexOf('-') + 1)
            })[0]

            action.range = equipment.range || 5
            // Figure out what ability to use for damage
            equipment.ability = equipment.range ? 'dex' : equipment.properties.indexOf('Finesse') === -1 ? 'str' : creature.str.score >= creature.dex.score ? 'str' : 'dex'
            // Construct the attack function
            action.func = actions.general.attack.func(equipment, creature)
        }
        // Error on invalid action
        if (!action || typeof action !== 'object')
            throw new Error(`Invalid action ${action} with type ${type}`)
        // Set parameters from action config
        this.name = actionName
        this.priority = archetype.actions && archetype.actions[actionName] ? archetype.actions[actionName] : false || action.priority || 0
        // When attempting an action, start by checking the cost
        this.cost = action.cost || null
        // Then check for conditions
        this.condition = action.condition || []
        // Then check for valid target within range and potentially trigger movement
        this.range = action.range || 0
        this.target = action.target
        // Execute the function
        this.func = action.func
        // Add trigger for Events
        if (action.trigger)
            this.trigger = action.trigger
    }

}

export { Action }