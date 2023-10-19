'use strict'

/* ------- Profile Variables ------- */
let loggedIn = false
let profile = null


/* ------- Nav Bar Functionality ------- */

// Add change view functionality to nav bar items
const links = document.getElementsByClassName('nav-link')
for(const el of links) {
    el.addEventListener('click', switchView)
}

// Add change view functionality to other items
document.getElementById('home-button').addEventListener('click', switchView)
document.getElementById('get-started-btn').addEventListener('click', switchView)
document.getElementById('rules-btn').addEventListener('click', switchView)
const cardLinks = document.getElementsByClassName('card-link')
for(const el of cardLinks) {
    el.addEventListener('click', switchView)
}

/* ------- Login popup ------- */
document.getElementById('closeLoginModal').addEventListener('click', switchView)

document.getElementById('submitLoginModal').addEventListener('click', async function() {
    // Get input value
    const name = document.getElementById('login-name').value
    // Log in
    console.log('logging in...')
    await login(name)
})

/* ------- Draft pages ------- */

renderDraft('adventurers')
renderDraft('traps')
renderDraft('monsters')
renderDraft('bosses')

/* ------- Helper Functions ------- */

function switchView(event) {
    // Get the new view target
    const target = event.target.href || '#home'
    // Get the id of the new view
    const id = target.slice(target.lastIndexOf('#') + 1)
    // Get the view element
    const view = document.getElementById(id)
    // Do nothing if new view is currently active
    if(view.classList.contains('active'))
        return
    // Get the current view element
    const activeView = document.getElementsByClassName('active-view')[0]
    // Hide the current view
    activeView.classList.add('hidden')
    // Make the current view inactive
    activeView.classList.remove('active-view')
    // Find the current nav
    const activeNav = document.getElementsByClassName('active')[0]
    // Make the current nav inactive
    activeNav.classList.remove('active')
    // Show the new view
    view.classList.remove('hidden')
    // Make the new view the active element
    view.classList.add('active-view')
    // Find the new view nav
    const viewNav = document.getElementById(`${id}-button`)
    // Make the new view nav active
    viewNav.classList.add('active')
}

async function login(name) {
    // Get the profile from the server
    const rawData = await fetch(`/login?name=${name}`, {
        headers: {
          Accept: 'application/json',
          'Content-type': 'application/json'
        },
        method: 'GET'
    })
    profile = await rawData.json()
    profile.name = name
    // Update dungeon page
    document.getElementById('dungeon-entrance-trap').innerHTML = profile.dungeon[0].trap
    document.getElementById('dungeon-entrance-details').href = `https://www.dndbeyond.com/monsters/${profile.dungeon[0].trap}`
    document.getElementById('dungeon-floor1-monster').innerHTML = profile.dungeon[1].monster
    document.getElementById('dungeon-floor1-details').href = `https://www.dndbeyond.com/monsters/${profile.dungeon[1].monster.replace(/ /g,"-")}`
    document.getElementById('dungeon-floor2-monster').innerHTML = profile.dungeon[2].monster
    document.getElementById('dungeon-floor2-details').href = `https://www.dndbeyond.com/monsters/${profile.dungeon[2].monster.replace(/ /g,"-")}`
    document.getElementById('dungeon-boss-boss').innerHTML = profile.dungeon[3].boss
    document.getElementById('dungeon-boss-details').href = `https://www.dndbeyond.com/monsters/${profile.dungeon[3].boss.replace(/ /g,"-")}`
}

// Variable for holding table formats
const formats = {
    adventurers: [3, 1, 1, 4, 3],
    traps: [2, 2, 2, 2, 1, 3],
    monsters: [2, 3, 1, 1, 2, 3],
    bosses: [3, 4, 1, 4]
}

async function renderDraft(type) {
    // Get the draft info from the server
    const rawData = await fetch(`/draft?type=${type}`, {
        headers: {
          Accept: 'application/json',
          'Content-type': 'application/json'
        },
        method: 'GET'
    })
    const parsedData = await rawData.json()
    // Array to hold draft tables to render
    const tables = []
    // Format each table
    Object.keys(parsedData).forEach((key, day) => {
        // Access data for date
        const data = parsedData[key]
        // Add the table html to the list of tables
        let tableContent = `
        <div class="draft">
            <h4 class="draft-date">${key}</h4>
            <div class="row text-light draft-table draft-table-heading">`
        formats[type].forEach((width, i) => {
            tableContent +=` <div class="col-${width} border-dark border">${data[0][i]}</div>`
        })
        tableContent += '</div>'
        // Process the data
        data.forEach((el, i) => {
            // Skip the header element
            if(i == 0)
                return
            tableContent += `<div class="row text-dark bg-light draft-table">`
            // Add a button if it is today's pick and has not been picked
            if (day === 0 && !el[0])
                tableContent += `
                <div class="col-${formats[type][0]} border-dark border">
                    <button class="btn btn-light text-dark btn-sm btn-${type} draft-pick" id="btn-${type}-${i}" type="button" >
                        Choose
                    </button>
                </div>`
            else
                tableContent += 
                    `<div class="col-${formats[type][0]} border-dark border">${el[0]}</div>`
            // Add each element to the table
            el.forEach((line, i) => {
                if (i == 0)
                    return
                tableContent += `<div class="col-${formats[type][i]} border-dark border">${line}</div>`
            })
            // End div
            tableContent += '</div>'
        })
        // End div
        tableContent += `</div>`
        // Add the table to the list of tables
        tables.push(tableContent)
    })
    // Find the parent element
    const parent = document.getElementById(type)
    // Empty the parent element
    parent.innerHTML = ''
    // Add each table to the parent element 
    tables.forEach(table => {
        parent.innerHTML += table
    })
    updateButtons(type)
}

function updateButtons(type) {
    // Get the draft buttons
    const pickButtons = document.getElementsByClassName(`btn-${type} draft-pick`)
    // Add listeners to each button
    for(let i = 0; i < pickButtons.length; i++) {
        const el = pickButtons[i]
        el.onclick = async function() {
            // Disable the button
            el.setAttribute("disabled", "")
            // Show loading modal
            showLoading()
            // Pick the draft item chosen
            await fetch(`/pick/${type}`, {
                headers: {
                  Accept: 'application/json',
                  'Content-type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    player: profile.name,
                    index: el.id[el.id.length - 1]
                })
            })
            // Re-render the draft page
            renderDraft(type)
            // Be done loading
            doneLoading()
        }
    }
}

function showLoading() {
    // WIP
}

function doneLoading() {
    // WIP
}