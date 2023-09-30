'use strict'


/* ------- Nav Bar Functionality ------- */

const links = document.getElementsByClassName('nav-link')

for(const el of links) {
    el.addEventListener('click', switchView)
}

document.getElementById('home-button').addEventListener('click', switchView)


/* ------- Helper Functions ------- */

function switchView(event) {
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
    // Get the id of the new view
    const id = event.target.href.slice(event.target.href.lastIndexOf('#') + 1)
    // Get the view element
    const view = document.getElementById(id)
    // Show the new view
    view.classList.remove('hidden')
    // Make the new view the active element
    view.classList.add('active-view')
    // Make the new view nav active
    event.target.classList.add('active')
}