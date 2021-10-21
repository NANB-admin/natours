/* eslint-disable */
// import '@babel/polyfill';
// import { displayMap } from './mapbox';
// import { login, logout } from './login';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutButton = document.querySelector('.nav__el--logout');


if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.location);
    displayMap(locations)
    // console.log(locations);
}

// if (loginForm) {
// loginForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     login(email, password);
// }
// });

if (logoutButton) {
    console.log("LOGOUT")
    // logoutButton.addEventListener('click', logout);
}