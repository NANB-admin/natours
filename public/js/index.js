/* eslint-disable */
// import '@babel/polyfill';
// import { displayMap } from './mapbox';
// import { login } from './login';

const locations = JSON.parse(document.getElementById('map').dataset.location);
displayMap(locations)
// console.log(locations);

// document.querySelector('.form').addEventListener('submit', (e) => {
//     e.preventDefault();
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     login(email, password);

// });