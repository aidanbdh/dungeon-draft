'use strict'

import { roll } from "../helper.js"

// Generic creature
export default class Creature {
    constructor() {
        // Default options
        this.hitPoints = 0
        this.maxHp = 0
        this.tempHp = 0
        this.speed = 30
        this.equipment = []
        // Data structure for Actions
        this.actions = ['dodge', 'disengage']
        this.Action = 1
        this["Bonus Action"] = 1
        this.Reaction = 1
        this.proficiencies = []
        this.proficiencyBonus = 0
        this.initiative = 0
        this.initiativeBonus = 0
        this.position = null
        this.dead = false
        this.str = {}
        this.dex = {}
        this.con = {}
        this.wis = {}
        this.int = {}
        this.cha = {}
        this.events = []
        this.skills = {
            Athletics: {
                mod: 0,
                ability: "str"
            },
            Acrobatics: {
                mod: 0,
                ability: "str"
            },
            Sleight_Of_Hand: {
                mod: 0,
                ability: "dex"
            },
            Stealth: {
                mod: 0,
                ability: "dex"
            },
            Arcana: {
                mod: 0,
                ability: "int"
            },
            History: {
                mod: 0,
                ability: "int"
            },
            Investigation: {
                mod: 0,
                ability: "int"
            },
            Nature: {
                mod: 0,
                ability: "int"
            },
            Religion: {
                mod: 0,
                ability: "int"
            },
            Animal_Handling: {
                mod: 0,
                ability: "wis"
            },
            Insight: {
                mod: 0,
                ability: "wis"
            },
            Medicine: {
                mod: 0,
                ability: "wis"
            },
            Perception: {
                mod: 0,
                ability: "wis"
            },
            Survival: {
                mod: 0,
                ability: "wis"
            },
            Deception: {
                mod: 0,
                ability: "cha"
            },
            Intimidation: {
                mod: 0,
                ability: "cha"
            },
            Performance: {
                mod: 0,
                ability: "cha"
            },
            Persuasion: {
                mod: 0,
                ability: "cha"
            }
        }
    }

    
    // Protected values
    set hp(hp) {
        // Check for death
        if (hp < 0) {
            if (hp * -1 >= this.maxHp)
                this.dead = true
            this.hp = 0
        } else {
            if (hp > this.maxHp)
                this.hp = this.maxHp
            this.hitPoints = hp
        }
    }

    get hp() { 
        return this.hitPoints 
    }

    rollInitiative(surprised = false) {
        // Roll a d20 and add dex
        this.initiative = roll(20, 1, this.initiativeBonus || this.dex.mod)
        // Check for surprised (disadvantage)
        if (surprised) {
            // Roll again
            const num = roll(1, 20, this.initiativeBonus || this.dex.mod)
            // Keep the lower initative roll
            if (num < this.initative)
                this.initative = num
        }
    }
}