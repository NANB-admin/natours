/* eslint-disable */
// import axios from 'axios';

const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        });

        if (res.data.status === 'success') {
            alert('Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/')
            }, 1500);
        }
    }
    catch (err) {
        alert(err.response.data.message);
    }
};


document.querySelector('.form--login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
});


const logoutButton = document.querySelector('.nav__el--logout');

const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
        });
        if (res.data.status === 'success') location.reload(true);
    } catch (err) {
        alert('Error logging out! Try again.');
    }
    window.setTimeout(() => {
        location.assign('/')
    }, 500);
}


document.querySelector('.nav__el--logout').addEventListener('click', logout);