'use strict'

// Generic creature
export default class Creature {
    constructor() {
        // Default options
        this.hp = 0
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
}