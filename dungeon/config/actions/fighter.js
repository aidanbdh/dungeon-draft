'use strict'

import genericActions from "./general"

const actions = {
    "Second Wind": function(creature) {
        creature.hp += creature.level
    }
}

module.exports = { actions }