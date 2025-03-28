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
            const parsedDamage = parseDamage(weapon.damage)
            const mult = parsedDamage.mult
            const die = parsedDamage.die
            const damageType = parsedDamage.damageType

            const mod = creature[weapon.ability].mod

            // Fix any entry errors
            if (!weapon.bonus)
                weapon.bonus = []

            return function(creature, target, state, log) {
                // Check for advantage to hit
                let advantage = false
                // Handle pack tactics
                if (creature.traits && creature.traits.indexOf('Pack Tactics') !== -1 && state.room[creature.position].filter(c => !c.incapacitated).length > 1)
                    advantage = true
                // Handle hiding
                if (creature.hidden)
                    advantage = true
                // Check for disadvantage
                let disadvantage = false
                // Handle dodge action
                if (target.dodge) {
                    disadvantage = true
                }
                // Check for advantage and disadvantage
                if (advantage && disadvantage) {
                    advantage = false
                    disadvantage = false
                }
                // Roll to hit
                let attackRoll = roll(20, 1, mod + creature.proficiencyBonus, advantage)
                // Handle dodge action
                if (disadvantage) {
                    const disadvantageAttackRoll = roll(20, 1, mod + creature.proficiencyBonus)
                    if (disadvantageAttackRoll < attackRoll)
                        attackRoll = disadvantageAttackRoll
                }
                // Check vs AC
                if (attackRoll < target.ac)
                    return log.push(`${creature.name}'s attack missed ${target.name} with a ${attackRoll}`)
                // For storing temporary damage increases to weapons
                const tempWeaponBonus = []
                // Add extra damage from advantage abilities
                let advantageBonusDamage = creature.traits ? creature.traits.filter(str => str.indexOf('Bonus Advantage ') !== -1)[0] : false
                if (advantageBonusDamage && advantage) {
                    // Add extra damage to bonus
                    tempWeaponBonus.push(advantageBonusDamage.slice(16) + ' W')
                }
                // Construct options
                const options = {}
                advantage  = false
                // *** FEATS ***
                // Great Weapon Fighting
                if (creature['Great Weapon Fighting'] && !weapon.range && (weapon.properties.indexOf('Two-Handed') !== -1 || weapon.properties.indexOf('Versatile') !== -1))
                    options.minimum = 3
                // Savage Attacker
                if (creature['Savage Attacker'])
                    advantage = true

                // Roll for damage
                let damage = roll(die, mult, mod, advantage, [], options)
                // Modify damage for immunity and resistance
                if (target.immunity === 'any' || target.immunity.indexOf(damageType) !== -1)
                    damage = 0
                else if (target.resistance === 'any' || target.resistance.indexOf(damageType) !== -1)
                    damage = Math.floor(damage/2)
                // Handle bonus damage
                let parsedBonusDamage = []
                if (weapon.bonus.length > 0 || tempWeaponBonus.length > 0) {
                    (weapon.bonus.concat(tempWeaponBonus)).forEach(bonus => {
                        const bonusDamage = parseDamage(bonus, damageType)
                        // Roll for damage
                        bonusDamage.damage = roll(bonusDamage.die, bonusDamage.mult, bonusDamage.mod, false, [])
                        // Modify damage for immunity and resistance
                        if (target.immunity === 'any' || target.immunity.indexOf(bonusDamage.damageType) !== -1)
                            bonusDamage.damage = 0
                        else if (target.resistance === 'any' || target.resistance.indexOf(bonusDamage.damageType) !== -1)
                            bonusDamage.damage = Math.floor(bonusDamage.damage/2)
                        // Add new damage to bonus damage
                        parsedBonusDamage.push(bonusDamage)
                    })
                   
                }
                // // Save event for triggering other events
                // target.latestEvent = {
                //     damage,
                //     damageType, // update to include bonus damage type if necessary
                //     crit: false
                // }
                // Log damage
                log.push(`${creature.name}'s attack dealt ${damage} ${damageType} damage ${parsedBonusDamage.length > 0 ? parsedBonusDamage.reduce((str, bonusDamage) => str + `and ${bonusDamage.damage} ${bonusDamage.damageType} damage `, '') : ''}to ${target.name}`)
                // Apply damage
                target.hp -= damage + (parsedBonusDamage.length > 0 ? parsedBonusDamage.reduce((total, {damage}) => total + damage, 0) : 0)
                // Remove hidden
                creature.hidden = false
                return
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
            log.push(`${creature.name} dodged`)
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

function parseDamage(damage, weaponDamageType) {
    const mult = Number.parseInt(damage[0])
    const die = Number.parseInt(damage.slice(damage.toUpperCase().indexOf('D') + 1, damage.indexOf(' ') + 1))
    const damageType = function() {
        switch (damage[damage.length - 1]) {
            case 'B':
                return 'Bludgeoning'
            case 'P':
                return 'Piercing'
            case 'S':
                return 'Slashing'
            case 'N':
                return 'Necrotic'
            case 'F': // Use for any resistance bypassing damage for now
                return 'Force'
            case 'W': // Same damage type as weapon
                return weaponDamageType
            default:
                throw new Error(`Unsupported damage type ${damage[damage.length - 1]}`)
        }
    }()

    return { mult, die, damageType }
}

export { actions }