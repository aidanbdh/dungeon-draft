'use strict'

// Helpers for files

function roll(die, multiple = 1, bonus = 0, advantage = false, drop = [], options = {}, raw = false) {
    let rolls = []
    // Do required number of rolls
    while (multiple > 0) {
        let result = Math.floor((Math.random() * die) + 1)
        if (advantage) {
            const num = Math.floor((Math.random() * die) + 1)
            if (num > result)
                result = num
        }
        rolls.push(result)
        multiple--
    }
    // Sort rolls for ease of use
    rolls.sort((a, b) => a - b)
    // Change drop to array if needed
    if (typeof drop === 'string' || typeof drop === 'number')
        drop = [drop]
    // Drop any needed
    drop.forEach(drop => {
        if (drop === 'lowest')
            rolls.shift()
        else if (drop === 'highest')
            rolls.pop()
        else if(typeof drop === 'Number')
            rolls = rolls.filter(roll => roll !== drop)
    })
    // Handle number changes in options
    if (options.minimum)
        rolls = rolls.map(roll => roll < options.minimum ? options.minimum : roll)
    // Return all rolls if raw rolls are needed
    if (raw)
        return rolls
    // Return sum of all rolls
    return rolls.reduce((total, result) => total + result) + bonus
}

function check(creature, stat, DC, options = {}) {
    const mod = creature[stat] ? creature[stat].mod : creature.skills[stat].mod
    // Roll a D20 and add the modifier
    const result = roll(20, 1, mod, options.advantage, options.drop, options)
    // Check vs DC
    return result >= DC
}

function getMod(num) {
    num -= 10
    num /= 2
    num = Math.floor(num)
    return num
}

export { roll, getMod, check }