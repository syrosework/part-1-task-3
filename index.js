'use strict';

const express = require('express');
const app = express();
const Transform = require('stream').Transform;

class Translitartor extends Transform {
    constructor(options) {
        super(options);
    }

    _transform(chunk, encoding, callback) {
        
    }
}


const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

//Set timer middleware
app.use(function (req, res, next) {
    req.timer = process.hrtime();
    next();
});

//---------Middle-wares----------------

//Request url middle-ware
app.use(function (req, res, next) {
    let reqUrl = req.method + ' ' + req.url;
    res.set('X-Request-Url', reqUrl);
    console.log(reqUrl);
    next();
});

//Cookie parser middleware
app.use(function (req, res, next) {
    req.cookies = {};
    let array = [];
    if (req.headers.cookie) {
        array = req.headers.cookie.replace('; ', ';').split(';');
    }
    for (let i = 0; i < array.length; i ++) {
        let cookie = array[i].split('=');
        req.cookies[cookie[0]] = cookie[1];
    }
    next();
});

//Check auth middleware
app.use(function (req, res, next) {
    if (!req.cookies.authorize) {
        throw {
            status : 403,
            message : 'User unauthorized'
        };
    }
    next();
});

app.get('/', function (req, res, next) {
    throw {
        status : 503,
        message : 'Unknown request'
    }
});

//------------Log Timer-------------

//Set timer middleware
app.use(function (req, res, next) {
    let time = process.hrtime(req.timer);
    let formatTime = Number(time[0] + '.' + time[1]).toFixed(3);
    res.set('X-Time', formatTime);
    console.log(formatTime);
    next();
});

//-----------Routes-----------------

app.get('/v1/', function (req, res) {
    res.sendStatus(200);
});

//-----------Error Handler----------

app.use(function(err, req, res, next) {
    if (err) {
        console.error(err);
        res.set('X-Request-Error', err.message);
        res.status(err.status).send(err.message);
    }
});

app.use(function(req, res, next) {
    let err = {
        status : 404,
        message : 'Unknown request'
    };
    console.error(err);
    res.set('X-Request-Error', err.message);
    res.status(err.status).send(err.message);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;