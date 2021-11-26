var express = require('express')
var router = express.Router()
const fs = require('fs')
const path = require('path')
const DataBase = require('../scripts/database')
const isDev = require("../app").DEV

router.get('/:gameid/:gameTitle', function (req, res) {
    let id = req.params.gameid

    DataBase.FindGames({ "id": parseInt(id) }, (r) => {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        res.render(path.join(__dirname, '..', "dist", "gamepage"), { iframe: r[0].iframe, title: r[0].title, description: r[0].description });

        DataBase.IncrementGamePlays(parseInt(id));
        DataBase.IncrementTodayGamePlays(parseInt(id));
        DataBase.SaveIpData(ip)
    })


})

router.get('/:gameid/:gameTitle/thumb.jpg', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'src', 'data', 'games', 'folders', req.params.gameid, '512x512.jpg'))
})

router.get('/:gameid/data.json', function (req, res) {
    DataBase.FindGames({ id: parseInt(req.params.gameid) }, (result) => {
        res.send(result)
    })
})

module.exports = router;