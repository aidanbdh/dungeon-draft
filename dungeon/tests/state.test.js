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

const enemies = ['Bandit', 'Cultist', 'Giant Rat', 'Goblin Minion', 'Goblin Warrior'].map(monster => new Monster(monster))

const state2 = new State([eylan], enemies)

// Keep fighting until eylan dies or is the victor
while (eylan.hp > 0 && !!state2.initiative.filter(val => val)[1]) {
    state2.turn()
}

console.log(state2.log.join('\n'))

console.log('Done testing state 2.')

console.log('\n\nTesting state 3')

const flan = new Adventurer('human', 'fighter', 'warrior', 'soldier', 2, {})

const enemies3 = ['Needle Blight', 'Needle Blight', 'Twig Blight', 'Wolf'].map(monster => new Monster(monster))

const state3 = new State([flan], enemies3)

// Keep fighting until eylan dies or is the victor
while (flan.hp > 0 && !!state3.initiative.filter(val => val)[1]) {
    state3.turn()
}

console.log(state3.log.join('\n'))

console.log('Done testing state 3.')