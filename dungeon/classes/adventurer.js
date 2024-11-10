'use strict'

import fs from "fs"
import { roll, getMod } from "../helper.js"
import Creature from "./creature.js"
import speciesConfig from "../config/species.json" with { type: 'json' }
import backgroundConfig from "../config/backgrounds.json" with { type: 'json' }
import featsConfig from "../config/feats.json" with { type: 'json' }
import generalActionsConfig from "../config/actions/general.js"
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
        this.level = 0
        this.inspiration = false
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

        // Apply actions *** Issue-25 ***
        this.applyActions()
        // Apply events *** Issue-26 ***
        this.applyEvents()
        // Set hp
        this.initializeHp(type.hitDie, level, this.con.mod)


    }

    // Setters
    set hp(hp) {
        if (hp < 0) {
            if (hp * -1 >= this.maxHp)
                this.dead = true
            this.hp = 0
        } else {
            if (hp > this.maxHp)
                this.hp = this.maxHp
        }
        
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
        }
        // Remove empty scores array
        delete this.scores
        // Set base value for skills
        for (let skill in this.skills) {
            this.skills[skill].mod = this[this.skills[skill].ability].mod
        }
        this.Initiative = this.dex.mod
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
            // Increase the selected skill
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
                this.proficiencies.push(...abilities.savingThrow.proficiency)
        // Event abilities
        if (abilities.event)
            this.events.push(...abilities.event)
        // Inspiration abilities
        if (abilities.inspiration)
            this.inspiration = true
    }

    applyLevels({ level }, lv, { subclass }) {
        // Apply all level ups in order
        for (let i = 1; i < lv; i++) {
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
            // Add ability score improvement to feats array if empty
            if (feats.length <= 0)
                feats = ['Ability Score Improvement']
        }
        // Delete empty feats array
        delete this.feats
    }

    applyEvents() {
        // This function should look up each possible event and format it based on trigger
        // Issue-26
    }

    applyActions() {
        // This function should look up each possible action for the adventurer to take and format it based on priority.
        // Issue-25
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
}

export { Adventurer }