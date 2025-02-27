'use strict'

class State {

    /*
        This class holds the board state and needs to track the following:
            Position of stuff in room
            Events to be triggered
            Log of events
    */

    constructor(adventurers, monsters) {
        // Initialize the room with adventurers
        this.room = [...adventurers.reverse()]
        // Add 30ft of space between the adventurers and monsters
        this.room.push(...[null, null, null, null, null, null])
        // Add the monsters
        this.room.push(...monsters)
        // Initialize events object
        this.events = []
        // Add each event
        this.room.forEach(creature => {
            // Skip empty spots in the room or creatures with no events
            if(!creature)
                return
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
            if (a.initiative !== b.initiative)
                return a.initiative - b.initiative
            // Resolve ties with dex score
            if (a.dex.score !== b.dex.score)
                return a.dex.score - b.dex.score
            // Resolve ties randomly
            return Math.floor(Math.random()) === 0 ? -1 : 1
        })
        // Log the initiative order
        this.log.push(`Turn order: ${this.initiative.map(({name}) => name).join()}`)
    }
}

export { State }