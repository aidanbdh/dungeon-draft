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
        // Add each event with corresponding trigger
        this.room.forEach(creature => {
            // Skip empty spots in the room or creatures with no events
            if(!creature || !creature.events)
                return
            // Add events from that creature's events array to the overall events
           creature.events.forEach(event => {
                // Add event to events object
                this.events[`${creature.name || creature.type}-${event}`] = {executor: creature, event }
            })
        })
        // Initialize Log
        this.log = ['Combat Start']
    }
}

export { State }