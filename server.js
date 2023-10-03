'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const { GoogleSpreadsheet } = require('google-spreadsheet')
const { JWT } = require('google-auth-library')
const fs = require('fs')
const config = fs.existsSync('./config.json') ? require('./config.json') : {}

const app = express()

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())

app.get('/', (_, res) => {
    res.send('index.html')
    
})

// Route to get a user's profile information from google sheets
app.get('/login', async (req, res) => {
    // Name to retrieve from google sheets
    const name = req.query.name.trim().toLowerCase()
    // Authenticate with google sheets
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || config.google.email,
        key: process.env.GOOGLE_PRIVATE_KEY || config.google.key,
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    })
    // Get the google sheet
    const doc = new GoogleSpreadsheet('1uQd7Xx5HGGmdinT9Rret-IS0bZHQeBEPePrGM5-Patg', serviceAccountAuth);
    // Load the sheet data
    await doc.loadInfo()
    // Get the dungeons sheet
    const dungeonSheet = await doc.sheetsByTitle['Dungeons']
    // Load the rows from the dungeon sheet
    const dungeons = await dungeonSheet.getRows()
    // Find the dungeon from the name
    const profile = dungeons.find(el => el.get('Player').trim().toLowerCase() === name)
    // Error out if no profile found
    if(!profile)
        return res.sendStatus(404)
    // Format the dungeon output
    res.send({ dungeon: [
        { trap: profile.get('Entrance (T)') },
        { monster: profile.get('Floor 2 (M)') },
        { monster: profile.get('Floor 1 (M)') },
        { boss: profile.get('Boss (M)') }
    ]})
})

app.get('/draft', async (req, res) => {
    // Name to retrieve from google sheets
    const type = req.query.type.trim().toLowerCase()
    // Authenticate with google sheets
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || config.google.email,
        key: process.env.GOOGLE_PRIVATE_KEY || config.google.key,
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    })
    // Get the google sheet
    const doc = new GoogleSpreadsheet('1uQd7Xx5HGGmdinT9Rret-IS0bZHQeBEPePrGM5-Patg', serviceAccountAuth);
    // Load the sheet data
    await doc.loadInfo()
    // Get the sheet for the correct draft
    const draftSheet = await doc.sheetsByTitle[type.charAt(0).toUpperCase() + type.slice(1) + ' Draft']
    // Load cells from the sheet
    await draftSheet.loadCells('A1:H100')
    // Variable for holding formatted sheet data
    const data = {}
    // Start at the top of the sheet and process downward
    let i = 0
    let status = 'empty'
    // Variable to reduce queries by storing date
    let date = ''
    while (status !== 'end' && i < 100) {
        // Check for empty cells
        const value = draftSheet.getCell(i, 0).formattedValue
        if (!value) {
            if (!(draftSheet.getCell(i, 1).formattedValue))
                if (status === 'empty') {
                    break
                } else {
                    status = 'empty'
                    i++
                    continue
                }
        }
        // Handle non-empty cells
        if (status === 'empty') {
            date = value
            data[date] = []
            status = 'rows'
        } else if (status === 'rows') {
            // Add a new row to data
            data[date].push([draftSheet.getCell(i, 0).value])
            // Iterate over a row to get the value
            let j = 1
            let cellValue = draftSheet.getCell(i, j).value
            while(cellValue || (typeof cellValue === 'number' && cellValue === 0)) {
                data[date][data[date].length - 1].push(cellValue)
                j++
                cellValue = draftSheet.getCell(i, j).value
            }
        }

        // Increment i
        i++
    }
    if(type === 'monsters')
        console.log(data)
    res.send(data)
})

app.listen(process.env.PORT || 80, () => {
    console.log(`Listening on ${process.env.PORT || 80}`)
})