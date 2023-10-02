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
    const name = req.query.name
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
    const profile = dungeons.find(el => el.get('Player') === name)
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

app.listen(process.env.PORT || 80, () => {
    console.log(`Listening on ${process.env.PORT || 80}`)
})