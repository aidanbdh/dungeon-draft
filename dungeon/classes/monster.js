'use strict'

import fs from "fs"
import { roll, getMod } from "../helper.js"
import Creature from "./creature.js"
import monsterConfig from "../config/monsters.json" with { type: 'json' }
import equipmentConfig from "../config/equipment.json" with { type: 'json' }
import { Action } from "../classes/action.js"
import eventsConfig from "../config/events.json" with { type: 'json' }


/*
Monster  <- name, type
            -> New Monster
*/

class Monster extends Creature {
    constructor(name, type = null, options ) {
        // Default options from creature
        super()
        // Get monster stats from config
        const monster = monsterConfig[name.toLowerCase()]
        // Error if unknown monster
        if (!monster)
            throw new Error(`Unknown creature ${name}`)
        // Apply stats from config
        this.size = monster.size
        this.species = monster.species
        this.alignment = monster.alignment
        this.ac = monster.ac
        this.initiative = monster.initiative
        this.speed = monster.speed
        this.languages = monster.languages || []
        this.cr = monster.cr
        this.traits = monster.traits || []
        this.actions = monster.actions
        this.proficiencyBonus = monster.proficiencyBonus
        this.proficiencies = monster.proficiencies || []
        // Set hp
        this.initializeHp(monster.hp)
        // Apply traits
        this.applyTraits(monster.traits)
        // Calculate Scores
        this.setupStats(monster.scores)
        // Apply equipment
        this.applyEquipment(monster.equipment || [], monster.customEquipment || [])
        // Apply actions
        this.applyActions(monster)
        // Apply events *** Issue-26 ***
        this.applyEvents()
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
    setupStats(scores) {
        // Apply scores
        for (let score in scores) {
            this[score].score = scores[score]
            this[score].mod = getMod(scores[score])
            this[score].save = this[score].mod
        }
        // Set base value for skills
        for (let skill in this.skills) {
            this.skills[skill].mod = this[this.skills[skill].ability].mod
        }
        // Apply proficiencies to skills
        for (let i = 0; i < this.proficiencies.length; i++) {
            // Check for saving throw proficiency
            if (this.proficiencies[i].indexOf('-save') !== -1)
                this[this.proficiencies[i].slice(0, 3)].save += this.proficiencyBonus
            else // Increase if skill
                this.skills[this.proficiencies[i]].mod += this.proficiencyBonus
        }
    }

    applyTraits(traits) {
        // Skill modifying abilities
        if (traits.skill) {
            if (traits.skill.proficiency) // Give proficiency in skill/s
                this.proficiencies.push(...traits.skill.proficiency)
            if (traits.skill.expertise) // Give expertise in skill/s
                this.proficiencies.push(...traits.skill.expertise)
            if (traits.skill.advantage) // Give "advantage" in skill/s *** Issue-24 ***
                this.proficiencies.push(...traits.skill.advantage)
        }
        // Feat abilities
        if (traits.feat) // Gain feat/s
            this.feats.push(...traits.feat)
        // Saving throw proficiencies
        if (traits.savingThrow)
            if (traits.savingThrow.proficiency)
                this.proficiencies.push(...traits.savingThrow.proficiency)
        // Event abilities
        if (traits.event)
            this.events.push(...traits.event)
    }

    applyEquipment(equipments, customEquipment) {
        // Handle each piece of normal equipment
        for (let i = 0; i < equipments.length; i++) {
            // Get equipment details from config
            const equipment = equipmentConfig[equipments[i]]
            // Error if unknown equipment
            if (!equipment)
                throw new Error(`Unknown equipment "${equipments[i]}"`)
            equipment.name = equipments[i]
            // Add equipment to monster
            this.equipment[i] = equipment
        }
        // Handle each piece of custom equipment
        for (let i = 0; i < customEquipment.length; i++) {
            // Add equipment to monster
            this.equipment[i + equipments.length] = customEquipment[i]
            
        }
        // Handle equipment
        for (let i = 0; i < this.equipment.length; i++) {
            // Handle weapons
            if (this.equipment[i].type === 'Weapon') {
                // Register a new action based on the weapon properties
                this.actions.push(`Attack-${this.equipment[i].name}`)
            }
        }
       
    }

    applyActions({ priorities }) {
        // The new action format object
        const obj = {}
        // This function should look up each possible action for the adventurer to take and format it based on priority.
        for (let i = 0; i < this.actions.length; i++) {
            // Create the action object based on action name, monster attack priorities, and equipment
            const action = new Action(this.actions[i], 'monster', priorities, this.equipment, this)
            // Handle reactions and passive abilities as events
            if (action.trigger)
                this.events.push(action)
            else // Add to or create an entry for actions at the priority level
                obj[action.priority] ? obj[action.priority].push(action) : obj[action.priority] = [action]
        }
        this.actions = obj
    }

    applyEvents() {
        // This function should look up each possible event and format it based on trigger
        // Issue-26
    }

    initializeHp(hp) {
        // Parse hp string
        hp = hp.split(' ')
        hp[0] = hp[0].split('D')
        const mult = Number.parseInt(hp[0][0])
        const die = Number.parseInt(hp[0][1])
        const add = Number.parseInt(hp.pop())
        // Set max hp
        this.maxHp = roll(die, mult, add)
        // "Heal" to full
        this.hp = this.maxHp
    }
}

export { Monster }