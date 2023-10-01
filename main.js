'use strict'


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



/* ------- Helper Functions ------- */

function switchView(event) {
    // Get the id of the new view
    const id = event.target.href.slice(event.target.href.lastIndexOf('#') + 1)
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