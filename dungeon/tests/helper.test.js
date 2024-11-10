'use strict'

import { expect } from 'chai'

import { roll, getMod } from '../helper.js'

describe('helper.js', function() {

    describe('roll', function() {

        it('can roll each kind of die', function() {

            const data = [2, 3, 4, 6, 8, 10, 12, 20, 100]
            data.forEach(die => {
                for(let i = 0; i < die * 10; i++) {
                    const result = roll(die)
                    expect(result).to.be.lessThanOrEqual(die)
                    expect(result).to.be.greaterThan(0)
                }
            })

        })

        it('can roll multiple of a single kind of die', function() {
            const data = [2, 7, 20, 100]
            data.forEach(mult => {
                for(let i = 0; i < (mult + 10) * 10; i++) {
                    const result = roll(6, mult)
                    expect(result).to.be.lessThanOrEqual(6 * mult)
                    expect(result).to.be.greaterThanOrEqual(mult)
                }
            })
        })

        it('can add a modifier to a die roll', function() {
            const data = [4, 5, 6, 7, 8, 9]
            let maxTries = 1000
            while(data.length > 0 && maxTries > 0) {
                const result = roll(6, undefined, 3)
                const index = data.indexOf(result)
                if(index !== -1)
                    data.splice(index, 1)
                maxTries--
            }
            expect(data).to.be.empty
            expect(maxTries).to.not.equal(0)
        })

        it('can give advantage to a die roll', function() {
            // Roll 10000 d20s with advantage and check the average
            const result = roll(20, 10000, 0, true)
            expect(result/10000).to.be.greaterThan(13)
        })

        it('can drop the lowest of die rolls', function() {
            let total = 0
            // Roll 4d6 drop the lowest 10000 times and check the average
            for (let i = 0; i < 10000; i++) {
                total += roll(6, 4, 0, false, ['lowest'])
            }
            expect(total/10000).to.be.greaterThan(12)
        })

        it('can drop the highest of die rolls', function() {
            let total = 0
            // Roll 4d6 drop the highest 10000 times and check the average
            for (let i = 0; i < 10000; i++) {
                total += roll(6, 4, 0, false, ['highest'])
            }
            expect(total/10000).to.be.lessThan(10)
        })

        it('can reroll any 1 or 2', function() {
            let total = 0
            // Roll 2d8 reroll 1s and 2s 10000 times and check the average
            for (let i = 0; i < 10000; i++) {
                total += roll(8, 2, 0, false, [1, 2])
            }
            expect(total/10000).to.be.greaterThan(8)
            expect(total/10000).to.be.lessThan(9.5)
        })

        it('can return all rolls if raw options is selected', function() {
            // Roll 4d6 and return all rolls
            const result = roll(6, 4, 0, false, [], true)
            expect(result).to.be.an('array')
            expect(result.length).to.equal(4)
        })

    })

    describe('getMod', function() {

        it('calculates the modifier based on score', function() {
            // test data
            const data = [
                { score: 0, mod: -5 },
                { score: 1, mod: -5 },
                { score: 2, mod: -4 },
                { score: 3, mod: -4 },
                { score: 4, mod: -3 },
                { score: 5, mod: -3 },
                { score: 6, mod: -2 },
                { score: 7, mod: -2 },
                { score: 8, mod: -1 },
                { score: 9, mod: -1 },
                { score: 10, mod: 0 },
                { score: 11, mod: 0 },
                { score: 12, mod: 1 },
                { score: 13, mod: 1 },
                { score: 14, mod: 2 },
                { score: 15, mod: 2 },
                { score: 16, mod: 3 },
                { score: 17, mod: 3 },
                { score: 18, mod: 4 },
                { score: 19, mod: 4 },
                { score: 20, mod: 5 },
                { score: 21, mod: 5 },
                { score: 22, mod: 6 },
                { score: 23, mod: 6 },
                { score: 24, mod: 7 },
                { score: 25, mod: 7 },
                { score: 26, mod: 8 },
                { score: 27, mod: 8 },
                { score: 28, mod: 9 },
                { score: 29, mod: 9 },
                { score: 30, mod: 10 }
            ]
            // Check each data point vs output
            data.forEach(input => {
                const result = getMod(input.score)
                expect(result).to.equal(input.mod)
            })
        })

    })

})