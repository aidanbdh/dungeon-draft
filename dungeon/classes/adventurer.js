'use strict'

import fs from "fs"
import { roll, getMod } from "../helper.js"
import Creature from "./creature.js"
import speciesConfig from "../config/species.json" with { type: 'json' }
import backgroundConfig from "../config/backgrounds.json" with { type: 'json' }
import featsConfig from "../config/feats.json" with { type: 'json' }
import equipmentConfig from "../config/equipment.json" with { type: 'json' }
import { Action } from "../classes/action.js"
import eventsConfig from "../config/events.json" with { type: 'json' }


/*
Adventurer  <- species, class, archetype, background, level, options
            -> New Adventurer
*/

class Adventurer extends Creature {
    constructor(species, type, archetype, background, level, options ) {
        // Default options from creature
        super()
        // Default adventurer options
        this.feats = []
        this.scores = []
        this.level = level
        this.inspiration = false
        this.name = ["David", "Hulk of House Hogan", "Steve", "Brandt the Slandt", "Carl the Wheezer"][Math.floor(Math.random() * 5)]
        // Randomize Alignment
        this.alignment = this.randomAlignment()
        // Get species info from config file
        species = speciesConfig[species]
        // Throw an error if invalid species
        if(!species)
            throw new Error('Invalid species selection.')
        // Set defaults based on species
        this.size = species.size
        this.speed = species.speed
        // Gain benefits from species abilities
        species = this.applyAbilities(species.abilities)

        // Get background info from config file
        background = backgroundConfig[background]
        // Throw an error if invalid background
        if(!background)
            throw new Error('Invalid background selection.')
        // Gain benefits from background abilities
        background = this.applyAbilities(background.abilities)

        // Get class info from config file
        type = JSON.parse(fs.readFileSync(`./dungeon/config/classes/${type}.json`))
        // Get archetype info from config file
        archetype = type.archetypes[archetype]
        // Get feats, events, and abilities from levels
        this.applyLevels(type, level, archetype)
        // Apply feats
        this.applyFeats(archetype)
        // Roll for and improve stats
        this.rollForStats(archetype)

        // *** Abilities done prior to below steps ***

        // Add equipment and actions based on equipment
        this.applyEquipment(type, archetype)
        // Set movement available based on speed
        this.movement = this.speed
        // Apply actions
        this.applyActions(type, archetype)
        // Apply events *** Issue-26 ***
        this.applyEvents(type, archetype)
        // Set hp
        this.initializeHp(type.hitDie, level, this.con.mod)


    }

    // Helpers
    rollForStats({ scores, skills }) {
        // Roll base scores
        const rolls = [10, 10, 10, 10, 10, 10].map(() => roll(6, 4, 0, false, 'lowest'))
        rolls.sort((a, b) => b - a)
        for (let i = 0; i < 6; i++) {
            this[scores[i]].score = rolls[i]
        }

        // Handle score improvements and formatting
        // Sort score improvements by most specific to least specific
        this.scores = this.scores.sort((a, b) => a.match(/|/g).length - b.match(/|/g).length)
        // Improve scores based on archetype
        while (this.scores.length > 0) {
            const score = this.scores.shift().split('|')
            // Check score priority from archetype
            for (let i = 0; i < 6; i++) {
                if(score.indexOf(scores[i]) !== -1 && this[scores[i]].score < 20 ) {
                    // Check next ability if score is even and next priority is odd
                    if (this[scores[i]].score % 2 === 0)
                        if (this[scores[i + 1]].score % 2 !== 0)
                            i++
                        // Check next ability if current ability is 3 or more points higher
                        else if (this[scores[i]].score - this[scores[i + 1]].score > 2)
                            i++
                    // Update score
                    this[scores[i]].score++
                    break
                }
            }
        }
        // Update modifiers
        const stats = ['str', 'dex', 'con', 'wis', 'int', 'cha']
        while (stats.length > 0) {
            const stat = stats.shift()
            this[stat].mod = getMod(this[stat].score)
            this[stat].save = this[stat].mod
        }
        // Remove empty scores array
        delete this.scores
        // Set base value for skills
        for (let skill in this.skills) {
            this.skills[skill].mod = this[this.skills[skill].ability].mod
        }
        // Sort proficiencies by most specific to least specific
        this.proficiencies = this.proficiencies.sort((a, b) =>  {
            // Check for any value
            if (a === 'any' && b !== 'any')
                return 1
            if (a !== 'any' && b === 'any')
                return -1
            // Check specificity
            return a.match(/|/g).length - b.match(/|/g).length
        })
        // Apply proficiencies to skills
        for (let i = 0; i < this.proficiencies.length; i++) {
            // Select any skill to increase
            if (this.proficiencies[i] === 'any') {
                this.proficiencies[i] = "Acrobatics|Animal Handling|Athletics|History|Insight|Intimidation|Persuasion|Perception|Survival",
                "Acrobatics|Animal Handling|Athletics|History|Insight|Intimidation|Persuasion|Perception|Survival"
            }
            // Select skill to increase from archetype list
            if (this.proficiencies[i].indexOf('|')) {
                for (let l = 0; l < skills.length; l++) {
                    // Update if skill is found
                    if (this.proficiencies[i].indexOf(skills[l]) !== -1) {
                        this.proficiencies[i] = skills[l]
                        delete skills[l]
                        break
                    }
                }
            }

            // Select random skill to increase from scores
            while (this.proficiencies[i].indexOf('|') !== -1) {
                const list = this.proficiencies[i].split('|')
                const l = Math.floor(Math.random() * list.length)
                // Check if selected random skill has been modified before
                if (this.proficiencies.indexOf(list[l]) === -1) { // this.skills[list[i]].mod === this[this.skills[list[i]].ability].mod
                    this.proficiencies[i] = list[l]
                    break
                } else {
                    // Remove the skill from possible list if not
                    delete list[l]
                    this.proficiencies[i] = list.join('|')
                }
            }
            // Check for saving throw proficiency
            if (this.proficiencies[i].indexOf('-save') !== -1)
                this[this.proficiencies[i].slice(0, 3)].save += this.proficiencyBonus
            else // Increase if skill
                this.skills[this.proficiencies[i]].mod += this.proficiencyBonus
            // Remove the skill from archetype skills list
            if (skills.indexOf(this.proficiencies[i]) !== -1)
                skills.splice(skills.indexOf(this.proficiencies[i]), 1)
        }
    
    }

    applyAbilities(abilities) {
        // Check for abilities that just change values
        // This should probably change
        // for(const ability in abilities) {
        //     if (Object.keys(this).indexOf(ability !== -1))
        //         this[ability] = abilities[ability]
        // }

        // Handle more complicated abilities
        // Skill modifying abilities
        if (abilities.skill) {
            if (abilities.skill.proficiency) // Give proficiency in skill/s
                this.proficiencies.push(...abilities.skill.proficiency)
            if (abilities.skill.expertise) // Give expertise in skill/s
                this.proficiencies.push(...abilities.skill.expertise)
            if (abilities.skill.advantage) // Give "advantage" in skill/s *** Issue-24 ***
                this.proficiencies.push(...abilities.skill.advantage)
        }
        // Feat abilities
        if (abilities.feat) // Gain feat/s
            this.feats.push(...abilities.feat)
        // Score modifying abilities
        if (abilities.score)
            if (abilities.score.increase) // Improve abilities
                this.scores.push(...abilities.score.increase)
        // Saving throw proficiencies
        if (abilities.savingThrow)
            if (abilities.savingThrow.proficiency)
                this.proficiencies.push(...(abilities.savingThrow.proficiency.map(score => `${score}-save`)))
        // Event abilities
        if (abilities.event)
            this.events.push(...abilities.event)
        // Inspiration abilities
        if (abilities.inspiration)
            this.inspiration = true
    }

    applyLevels({ level, abilities }, lv, { subclass }) {
        // Apply base abilities
        this.applyAbilities(abilities)
        // Apply all level ups in order
        for (let i = 0; i < lv; i++) {
            // Check for subclass ability improvements
            if (level[i].subclassFeature)
                Object.assign(level[i], level[i].subclassFeature[subclass])
            // Generically apply new abilities from level
            if (level[i].abilities)
                this.applyAbilities(level[i].abilities)
            // Add any new actions from level
            if (level[i].action)
                for (let l = 0; l < level[i].action.length; l++) {
                    this.actions.push(level[i].action[l])
                }
            // Add feats or ability increases
            if (level[i].abilityIncrease)
                this.feats.push('any')
            // Add custom resources
            if (level[i].resources)
                for (let key in level[i].resources)
                    this[key] = level[i].resources[key]
        }
        // Get proficiency bonus
        this.proficiencyBonus = 2
    }

    applyFeats({ feats }) {
        // Sort feats by most specific to least specific
        this.feats = this.feats.sort((a, b) => {
            if (a === b)
                return 0
            if (a === 'origin')
                return 1
            if (a === 'any')
                return b === 'origin' ? -1 : 1
        })
        // Handle each feat
        while(this.feats.length > 0) {
            // Handle the next feat
            let feat = this.feats.shift()
            // Handle feat selections
            // Check for the next possible feat from the archetype
            if (feat === 'any')
                feat = feats.shift() || 'Ability Score Improvement'
            // Check for the next possible origin feat from the archetype
            else if (feat === 'origin') {
                for (let i = 0; i < feats.length; i++) {
                    if (featsConfig[feats[i]].type === 'origin') {
                        feat = feats[i]
                        delete feats[i]
                        break
                    }
                }
            }
            // Check for the next possible fighting style from the archetype
            else if (feat === 'fightingStyle') {
                for (let i = 0; i < feats.length; i++) {
                    if (featsConfig[feats[i]].type === 'fightingStyle') {
                        feat = feats[i]
                        delete feats[i]
                        break
                    }
                }
            }
            // Handle no more origin feats available
            if (feat === 'origin')
                continue
            // Get feat details from feat config
            feat = featsConfig[feat]
            // Apply feat
            if (feat.event)
                this.events.push(feat.event)
            if (feat.action)
                this.actions.push(feat.action)
            if (feat.score)
                this.scores.push(feat.score)
            if (feat.score2)
                this.scores.push(feat.score2)
            if (feat.hp)
                this.maxHp *= feat.hp
            // Add ability score improvement to feats array if empty
            if (feats.length <= 0)
                feats = ['Ability Score Improvement']
        }
        // Delete empty feats array
        delete this.feats
    }

    applyEquipment(type, archetype) {
        // Get the equipment loadout from archetype
        const equipments = type.equipment[archetype.equipment]
        // Handle each piece of equipment
        for (let i = 0; i < equipments.length; i++) {
            // Get equipment details from config
            const equipment = equipmentConfig[equipments[i]]
            equipment.name = equipments[i]
            // Add equipment to adventurer
            this.equipment[i] = equipment
            // Handle armor
            if (equipment.type === 'Armor') {
                this.ac = equipment.AC || equipment.ac
                // Give Dex bonus up to max
                if (this.dex.mod > 0)
                    this.ac += this.dex.mod > equipment.dexBonus ? equipment.dexBonus : this.dex.mod
            } else if (equipment.type === 'Weapon') { // Handle weapons
                // Register a new action based on the weapon properties
                this.actions.push(`Attack-${equipments[i]}`)
            }
        }
    }

    applyActions(type, archetype) {
        // The new action format object
        const obj = {}
        // This function should look up each possible action for the adventurer to take and format it based on priority.
        for (let i = 0; i < this.actions.length; i++) {
            // Create the action object based on action name, class and archetype.
            const action = new Action(this.actions[i], type.name, archetype, this.equipment, this)
            // Handle reactions and passive abilities as events
            if (action.trigger)
                this.events.push(action)
            else // Add to or create an entry for actions at the priority level
                obj[action.priority] ? obj[action.priority].push(action) : obj[action.priority] = [action]
        }
        this.actions = obj
    }

    // This organizes events (actions) by trigger and priority
    applyEvents(type, archetype) {
    //     // The new events format object
    //     const obj = {}
    //     // This function should look up each possible action for the adventurer to take and format it based on priority.
    //     for (let i = 0; i < this.events.length; i++) {
    //         // Create the action object based on action name, class and archetype.
    //         const event = new Action(this.events[i], type.name, archetype, this.equipment, this)
    //         // Initialize trigger if needed
    //         obj[event.trigger] ? null : obj[event.trigger] = []
    //         // Add to or create an entry for events at the trigger and priority level
    //         obj[event.trigger][event.priority] ? obj[event.trigger][event.priority].push(event) : obj[event.trigger][event.priority] = [event]
    //     }
    //     this.events = obj
    }

    initializeHp(hitDie, level, con) {
        // Set level 1 hp
        this.maxHp += hitDie + con
        level--
        // Handle subsequent levels if over level 1
        if (level > 0)
            this.maxHp += roll(hitDie, level, con * level)
        // "Heal" to full
        this.hp = this.maxHp
    }

    randomAlignment() {
        return `${Math.random() >= 0.5 ? "Chaotic" : "Lawful"} ${Math.random() >= 0.5 ? "Evil" : "Good"}`
    }
}

export { Adventurer }