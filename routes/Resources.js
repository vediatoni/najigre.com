var express = require('express')
var router = express.Router()
const path = require('path')


router.get('/main.js', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'src', 'scripts', 'main.js'))
})

router.get('/gdpr.js', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'src', 'scripts', 'jquery.ihavecookies.js'))
})

router.get('/style', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'src', 'styles', 'style.css'))
})

router.get('/gamestyle', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'src', 'styles', 'gamestyle.css'))
})

module.exports = router;