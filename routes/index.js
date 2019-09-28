const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
    const name = request.cookies.username;

    // response.send("<h1>I love Dave</h1>");
    // if (name) {

    //     response.render('index', { name: name });

    // }




});