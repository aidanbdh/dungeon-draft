'use strict'

import { Adventurer } from "../classes/adventurer.js"
import { Monster } from "../classes/monster.js"
import { State } from "../classes/state.js"

const dylan = new Adventurer('human', 'fighter', 'warrior', 'soldier', 2, {})

const rodZombie = new Monster('Zombie')

const samSkeleton = new Monster('Skeleton')

const state = new State([dylan], [rodZombie, samSkeleton])

// Test initiative correctness
const correctInitiative = [dylan, rodZombie, samSkeleton].sort((a, b) => b.initiative - a.initiative)
if (state.initiative[0] !== correctInitiative[0] || state.initiative[1] !== correctInitiative[1] || state.initiative[2] !== correctInitiative[2])
    console.log(`Potentially incorrect initiative. Check for ties.`)

// Take one turn
state.turn()

// Manually set dylan's hp to 1
dylan.hp = 1

// Keep fighting until dylan dies
while (dylan.hp > 0) {
    state.turn()
}

// Check for turn logs
console.log(state.log.join('\n'))

console.log('Done testing state.')