'use strict'

import { roll } from "../../helper.js"

const actions = {
    attack: {
        priority: 2,
        condition: [],
        cost: ['Action'],
        range: 0,
        target: 'creature',
        func: function(weapon, creature) {
            // Calculate damage potential from weapon and stats
            const mult = Number.parseInt(weapon.damage[0])
            const die = Number.parseInt(weapon.damage.slice(weapon.damage.indexOf('D') + 1, weapon.damage.indexOf(' ') + 1))
            const damageType = function() {
                switch (weapon.damage[weapon.damage.length - 1]) {
                    case 'B':
                        return 'Bludgeoning'
                    case 'P':
                        return 'Piercing'
                    case 'S':
                        return 'Slashing'
                    case 'F': // Use for any resistance bypassing damage for now
                        return 'Force'
                    default:
                        throw new Error(`Unsupported damage type ${weapon.damage[weapon.damage.length - 1]}`)
                }
            }()

            const mod = creature[weapon.ability].mod

            return function(creature, target, state, log) {
                // Roll for damage
                let damage = roll(die, mult, mod)
                return log.push(`${creature.name}'s attack dealt ${damage} ${damageType} damage`)
                // Modify damage
                if (target.immunity === 'any' || target.immunity.indexOf(damageType) !== -1)
                    damage = 0
                else if (target.resistance === 'any' || target.resistance.indexOf(damageType) !== -1)
                    damage = Math.floor(damage/2)
                // Apply damage
                target.hp -= damage
                // Trigger damage events *** Issue-28 ***
                // state.event.damage(damage, target, creature)
            }
        }
    },
    dodge: {
        priority: 1,
        condition: [],
        cost: ['Action'],
        range: 0,
        target: 'self',
        func: function(creature, _, __, log) {
            creature.dodge = true
            log.push('Dodge')
        }
    },
    disengage: {
        priority: 0,
        condition: ['todo'],
        cost: ['Action'],
        range: 0,
        target: 'self',
        func: function(creature, _, __, log) {
            creature.disengage = true
            log.push('Disengage')
        }
    }
}

export { actions }