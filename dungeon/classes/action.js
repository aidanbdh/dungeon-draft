'use strict'

// Get generic actions
import { actions as generalActions } from '../config/actions/general.js'
// Get class options for actions
import { actions as fighterActions } from '../config/actions/fighter.js'

const actions = {
    general: generalActions,
    fighter: fighterActions
}

class Action {

    constructor(actionName, type, archetype, equipment, creature) {
        // Find the action based on class then general
        let action = actions[type][actionName] || actions.general[actionName] || actionName
        // Handle attack actions
        if (actionName.indexOf('Attack') !== -1) {
            action = actions.general.attack
            // Find the right equipment
            equipment = equipment.filter(({ name }) => {
                return name === actionName.slice(actionName.indexOf('-') + 1)
            })[0]

            action.range = equipment.range || 0
            // Figure out what ability to use for damage
            equipment.ability = equipment.range ? 'dex' : equipment.properties.indexOf('Finesse') === -1 ? 'str' : creature.str.score >= creature.dex.score ? 'str' : 'dex'
            // Construct the attack function
            action.func = action.func(equipment, creature)
        }
        // Error on invalid action
        if (!action || typeof action !== 'object')
            throw new Error(`Invalid action ${action} with type ${type}`)
        // Set parameters from action config
        this.name = actionName
        this.priority = archetype.actions[actionName] || action.priority || 0
        // Set triggers for reactions or passive abilities
        this.trigger = action.trigger || null
        // When attempting an action, start by checking the cost
        this.cost = action.cost || null
        // Then check for conditions
        this.condition = action.condition || []
        // Then check for valid target within range and potentially trigger movement
        this.range = action.range || 0
        this.target = action.target
        // Execute the function
        this.func = action.func
    }

}

export { Action }