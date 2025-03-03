'use strict'

class State {

    /*
        This class holds the board state and needs to track the following:
            Position of stuff in room
            Events to be triggered
            Log of events
    */

    constructor(adventurers, monsters) {
        // Initialize
        this.turnNumber = 0
        // Initialize the room with adventurers
        this.room = [...adventurers.reverse()]
        // Add 30ft of space between the adventurers and monsters
        this.room.push(...[null, null, null, null, null, null])
        // Add the monsters
        this.room.push(...monsters)
        // Initialize events object
        this.events = []
        // Add each event
        this.room.forEach((creature, position) => {
            // Skip empty spots in the room or creatures with no events
            if(!creature)
                return
            // Save each creature's position
            creature.position = position
            // Save state reference for each creature
            creature.state = this
            // Roll initiative for each creature
            creature.rollInitiative()
            // Skip creatures with no events
            if(!creature.events)
                return
            // Add events from that creature's events array to the overall events
           creature.events.forEach(event => {
                // Add event to events object
                this.events[`${creature.name || creature.type}-${event}`] = {executor: creature, event }
            })
        })
        // Initialize Log
        this.log = ['Combat Start']
        // Sort initiative order
        this.initiative = adventurers.concat(monsters).sort((a, b) => {
            // Sort by initiative order
            if (b.initiative !== a.initiative)
                return b.initiative - a.initiative
            // Resolve ties with dex score
            if (b.dex.score !== a.dex.score)
                return b.dex.score - a.dex.score
            // Resolve ties randomly
            return Math.floor(Math.random()) === 0 ? -1 : 1
        })
        // Log the initiative order
        this.log.push(`Turn order: ${this.initiative.map(({name, initiative}) => `${initiative}-${name}`).join(', ')}\n`)
    }

    turn() {
        this.turnNumber++
        this.log.push(`--- Turn ${this.turnNumber} start ---\n`)
        // Handle each creature in initiative order
        this.initiative.forEach(creature => {
            // Handle dead or fled creatures
            if (!creature)
                return
            // Log start of turn
            this.log.push(`* Start of ${creature.name}'s turn *`)
            // Refresh applicable resources
            creature.Action = 1
            creature["Bonus Action"] = 1
            creature.Reaction = 1
            // Get a list of all priorities
            const priorities = Object.keys(creature.actions).sort((a, b) => b - a)
            // Iterate over each action priority
            for (let i = 0; i < priorities.length; i++) {
                // Get actions from priority
                const actions = creature.actions[priorities[i]].sort(() => Math.random() - 0.5)
                // Check each action for conditions
                for (let j = 0; j < actions.length; j++) {
                    // Check costs for each action
                    if (actions[j].cost.filter(cost => !creature[cost] || creature[cost] < 1)[0])
                        continue
                    // Handle conditions for actions
                    if(conditionNotFulfilled(actions[j].condition, creature))
                        continue
                    // Check for valid target within range
                    let target = null
                    if (actions[j].target === 'self')
                        target = creature
                    else
                        target = checkRange(actions[j].range, creature, this)
                    // If still no valid target, skip the action
                    if(!target)
                        continue
                    // Execute action
                    actions[j].func(creature, target, this, this.log)
                    // Pay costs
                    actions[j].cost.forEach(cost => {
                        if (typeof creature[cost] === 'boolean')
                            creature[cost] = false
                        else 
                            creature[cost] -= 1
                    }) 

                }
            }
            // Log end of turn
            this.log.push(`* End of ${creature.name}'s turn *\n`)
        })
    }

    death(creature) {
        // Remove creature from initiative
        this.initiative[this.initiative.indexOf(creature)] = null
        // Remove creature from room
        this.room[creature.position] = null
        // Log the death of the creature
        this.log.push(`${creature.name} died`)
    }
}

function conditionNotFulfilled(conditions, creature) {
    // List conditions NOT fulfilled
    for (let i in conditions) {
        // Switch based on condition, return if NOT fulfilled
        switch(conditions[i]) {
            // Creature is at half hp or less
            case 'bloodied':
                if(creature.hp <= creature.maxHp/2 )
                    break
                else
                    return true
            case 'todo':
                console.log(`Placeholder condition ${conditions[i]} found. Skipping...`)
                break
            default:
                console.log(`Unkown condition ${conditions[i]}`)
        }

    }
}

function checkRange(range, creature, state) {
    // Exit if creature is dead or fled
    if (creature.position === null)
        return false
    // Check if the creature is a monster or adventurer
    const type = creature.constructor.name
    // Temporary handler for ranged weapons
    if (Array.isArray(range))
        range = range[0]
    // Update range from ft to squares
    range /= 5
    
    let target = null
    // Find any targets to the left
    for (let x = creature.position - 1; x >= 0 && x >= creature.position - range; x--) {
        if (state.room[x] && state.room[x].constructor.name !== type) {
            target = state.room[x]
            break
        }
    }

    // Find any targets to the right (Override if monster)
    if (!target || type !== 'Monster')
        for (let y = creature.position + 1; y < state.room.length && y <= creature.position + range; y++) {
            if (state.room[y] && state.room[y].constructor.name !== type) {
                target = state.room[y]
                break
            }
        }
    if(target)
        return target
    // If no valid target, try to move into range
    const movement = creature.speed / 5
    let direction = 0
    // Find any targets to the left
    for (let x = creature.position - 1 - range; x >= 0; x--) {
        if (state.room[x] && !state.room[x + 1] && state.room[x].constructor.name !== type) {
            // Check if the creature's move can move to be in range
            if (x >= creature.position - range - movement) {
                target = state.room[x]
                // Move to the target
                move(creature, x + 1, state)
            } else {
                /// Set the move direction
                direction = -1
            }
            break
        }
    }

    // Find any targets to the right (Override if monster)
    if (!target || type !== 'Monster')
        for (let y = creature.position + 1 + range; y < state.room.length; y++) {
            if (state.room[y] && !state.room[y - 1] && state.room[y].constructor.name !== type) {
                // Check if the creature's move can move to be in range
                if (y <= creature.position + range + movement) {
                    target = state.room[y]
                    // Move to the target
                    move(creature, y - 1, state)
                    direction = 0
                } else {
                    /// Set the move direction
                    direction = 1
                }
                break
            }
        }
    // Move towards a target IF no movement happened
    if (direction !== 0)
        move(creature, creature.position + movement * direction, state)
    // Return the target or null
    return target
}

function move(creature, newPosition, state) {
    if (state.room[newPosition])
        throw new Error(`Location ${newPosition} already occupied by ${state[newPosition].name}.`)
    state.log.push(`${creature.name} moved ${Math.abs(newPosition - creature.position) * 5} ft.`)
    state.room[creature.position] = null
    state.room[newPosition] = creature
    creature.position = newPosition
}

export { State }