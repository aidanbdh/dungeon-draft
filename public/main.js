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
    const profile = await rawData.json()
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