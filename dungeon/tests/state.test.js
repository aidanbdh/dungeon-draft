'use strict'

import { Adventurer } from "../classes/adventurer.js"
import { Monster } from "../classes/monster.js"
import { State } from "../classes/state.js"

const dylan = new Adventurer('human', 'fighter', 'warrior', 'soldier', 1, {})

const rodZombie = new Monster('Zombie')

const samSkeleton = new Monster('Skeleton')

const state = new State([dylan], [rodZombie, samSkeleton])

// Test initiative correctness
const correctInitiative = [dylan, rodZombie, samSkeleton].sort((a, b) => b.initiative - a.initiative)
if (state.initiative[0] !== correctInitiative[0] || state.initiative[1] !== correctInitiative[1] || state.initiative[2] !== correctInitiative[2])
    console.log(`Potentially incorrect initiative. Check for ties.`)

// // Take one turn
// state.turn()

// // Keep fighting until dylan dies or is the victor
// while (dylan.hp > 0 && !!state.initiative.filter(val => val)[1]) {
//     state.turn()
// }

// Check for turn logs
console.log(state.log.join('\n'))

console.log('Done testing state 1.')

console.log('\n\nTesting state 2')

const eylan = new Adventurer('human', 'fighter', 'warrior', 'soldier', 2, {})

const enemies = ['Bandit', 'Cultist', 'Giant Rat', 'Giant Rat'].map(monster => new Monster(monster))

const state2 = new State([eylan], enemies)

// Keep fighting until eylan dies or is the victor
while (eylan.hp > 0 && !!state2.initiative.filter(val => val)[1]) {
    state2.turn()
}

console.log(state2.log.join('\n'))

console.log('Done testing state 2.')