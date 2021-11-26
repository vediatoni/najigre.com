var express = require('express')
var router = express.Router()
const DataBase = require('../scripts/database')
const path = require('path')
const request = require('request');
const sharp = require("sharp")
const multer = require('multer');
const upload = multer();
const fs = require("fs");

router.get('/categories.json', (req, res) => {
    DataBase.FindCategory({}, (result) => {
        res.send(result);
    })
})

router.get('/admin/allgames', upload.single('optionalThumbnailFile'), function (req, res) {
    const credsPath = process.env.USER == "antonio" ? "/home/antonio/Desktop/dev/apiCreds.json" : "/home/admin/apiCreds.json"
    const auth = JSON.parse(fs.readFileSync(credsPath))

    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    if (login && password && login === auth.login && password === auth.password) {
          DataBase.FindGames({},(result)=>{
              res.send(JSON.stringify(result))
          })
    }
    else {
        res.set('WWW-Authenticate', 'Basic realm="401"')
        res.status(401).send('Authentication required.')
    }
})

router.post('/admin/newgame', upload.single('optionalThumbnailFile'), function (req, res) {
    const credsPath = process.env.USER == "antonio" ? "/home/antonio/Desktop/dev/apiCreds.json" : "/home/admin/apiCreds.json"
    const auth = JSON.parse(fs.readFileSync(credsPath))

    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    if (login && password && login === auth.login && password === auth.password) {
        console.log('\x1b[32m%s\x1b[0m', `Adding a game: ${req.body.title}`)
        req.body.mobile = req.body.mobile === "false" ? false : true;
        req.body.rate = parseFloat(req.body.rate);
        req.body.categories = req.body.categories.split(',')

        DataBase.NewGame(req.body, (e, r, id) => {
            var whichPath = path.join(__dirname, '..', 'src', 'data', 'games', 'folders', String(id))
            var imagePath = path.join(whichPath, 'original.jpg')
            if (e) {
                console.log('\x1b[32m%s\x1b[0m', `Failed to add a game: ${req.body.title}, message: ${e}`)
                res.send(e)
            }
            else {
                try {
                    fs.mkdirSync(whichPath);
                    if (req.file) {
                        fs.writeFileSync(whichPath + "/512x512.jpg", req.file.buffer);
                        fs.writeFile(whichPath + "/512x512.jpg", req.file.buffer, (err) => {
                            if (err) {
                                fs.rmdirSync(whichPath);
                                DataBase.RemoveGame({ id: id })
                                res.send("Failed to upload the game ", err)
                            }
                            else {
                                res.send("Successfully uploaded the game")
                            }
                        })
                    }
                    else {
                        downloadHTTPImage(req.body.thumbnail, imagePath, () => {
                            sharp(imagePath)
                                .resize(512, 512, { fit: 'fill' })
                                .toFile(whichPath + "/512x512.jpg", (err, info) => {
                                    if (err) {
                                        fs.rmdirSync(whichPath);
                                        DataBase.RemoveGame({ id: id })
                                        res.send("Failed to upload the game ", err)
                                    }
                                    else {
                                        res.send("Successfully uploaded the game")
                                    }
                                })
                        })
                    }
                } catch (error) {
                    fs.rmdirSync(whichPath);
                    DataBase.RemoveGame({ id: id })
                    res.send("Failed to upload the game ")
                }

            }
        })
    }
    else {
        res.set('WWW-Authenticate', 'Basic realm="401"')
        res.status(401).send('Authentication required.')
    }
})

router.post('/admin/newcategory', upload.any(), function (req, res) {
    const credsPath = process.env.USER == "antonio" ? "/home/antonio/Desktop/dev/apiCreds.json" : "/home/admin/apiCreds.json"
    const auth = JSON.parse(fs.readFileSync(credsPath))

    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    if (login && password && login === auth.login && password === auth.password) {
        console.log('\x1b[32m%s\x1b[0m', `Adding a category: ${req.body.categoryName}`)

        DataBase.NewCategory(req.body.categoryName, (e, r) => {
            if (e) res.send(e)
            else {
                res.send("Successfully published category " + req.body.categoryName)
            }
        })
    }
    else {
        res.set('WWW-Authenticate', 'Basic realm="401"')
        res.status(401).send('Authentication required.')
    }
})

router.post('/admin/test', upload.any(), function (req, res) {
    const credsPath = process.env.USER == "antonio" ? "/home/antonio/Desktop/dev/apiCreds.json" : "/home/admin/apiCreds.json"
    const auth = JSON.parse(fs.readFileSync(credsPath))

    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    if (login && password && login === auth.login && password === auth.password) {
        res.status(200).send('Success')
    }
    else {
        res.set('WWW-Authenticate', 'Basic realm="401"')
        res.status(401).send('Authentication required.')
    }
})

router.get('/admin/backup', (req, res) => {
    const credsPath = process.env.USER == "antonio" ? "/home/antonio/Desktop/dev/apiCreds.json" : "/home/admin/apiCreds.json"
    const auth = JSON.parse(fs.readFileSync(credsPath))

    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    if (login && password && login === auth.login && password === auth.password) {
        DataBase.GetBackupData((result) => {
            res.send(result);
        })
    }
    else {
        res.set('WWW-Authenticate', 'Basic realm="401"')
        res.status(401).send('Authentication required.')
    }
})

var downloadHTTPImage = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};


module.exports = router;