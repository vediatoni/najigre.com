const express = require('express')
var router = express.Router()
const path = require('path')
const Helper = require('../scripts/helpers')
const device = require('express-device');
const favicon = require('serve-favicon')
const http = require('http')
const fs = require('fs');
var optionsGAMEDISTRIBUTION = {
    host: 'gamedistribution.com',
    path: '/ads.txt'
}

var optionsSOFTGAMES = {
    host: 'softgames.com',
    path: '/ads.txt'
}

router.use(device.capture());

router.use(favicon(path.join(__dirname, '..', 'src', 'public', 'favicon.ico')))

router.get('/', (req, res) => {
    let mobile = req.device.type.toUpperCase() != "DESKTOP"
    Helper.loadCategories((categories) => {
        Helper.getFrontPageData(mobile, req.cookies.recentlyPlayed, (bestPicks, bestToday, newest, bestEver) => {
            Helper.getRandomAdvert("728x90", "kinguin_adverts", (advert) => {
                res.render(path.join(__dirname, '..', "dist", "index"),
                    {
                        bestToday: bestToday,
                        bestEver: bestEver,
                        bestPicks: bestPicks,
                        newest: newest,
                        categories: categories,
                        advertLink: advert.link,
                        advertImg: advert.img,
                        advertImgDescription: advert.imgDescription
                });
            })
        })
    })

})

router.get('/privacy-policy', (req, res) => {
    Helper.loadCategories((categories) => {
        res.render(path.join(__dirname, '..', "dist", "privacy-policy"),
            {
                categories: categories
            });
    })
})

router.get('/categories', (req, res) => {
    Helper.loadCategories((categories) => {
        res.render(path.join(__dirname, '..', "dist", "categoryindex"),
            {
                categories: categories
            });
    })

});

router.get('/category/:categoryid/:categoryname', (req, res) => {
    Helper.loadCategories((categories) => {
        Helper.getCategoryHTML(req.params.categoryid, (html) => {
            res.render(path.join(__dirname, '..', "dist", "categorypage"),
                {
                    categoryName: req.params.categoryname,
                    gamesList: html,
                    categories: categories
                });
        })
    })
})


router.get('/category/:categoryid/img/thumb.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'src', 'data', 'categories', req.params.categoryid, 'thumb.jpg'))

})

router.get('/search/', (req, res) => {
    Helper.loadCategories((categories) => {
        Helper.getSearchGameHtml(String(req.query.query), (html) => {
            res.render(path.join(__dirname, '..', "dist", "search"),
                {
                    searchResult: req.query.query,
                    gamesList: html,
                    categories: categories
                });
        });
    })
});

router.get(("/BingSiteAuth.xml"), (req, res) => {
    let p = path.join(__dirname, '..', "src", "data", "BingSiteAuth.xml");
    res.sendFile(p);
})

router.get('/gamearter_srvc/domain-verification.txt', (req, res) => {
    let p = path.join(__dirname, '..', "src", "data", "domain-verification.txt");
    res.sendFile(p);
})

router.get('/index.html', (req, res) => {
    res.redirect('/')
});

router.get('/ads.txt', (req, res) => {
    let p = path.join(__dirname, '..', "src", "data", "ads.txt");
    let suffix = `
google.com, pub-2504503821144226, RESELLER, f08c47fec0942fa0

google.com, pub-5519830896693885, DIRECT, f08c47fec0942fa0
google.com, pub-4764333688337558, DIRECT, f08c47fec0942fa0
google.com, pub-9427048641572074, DIRECT, f08c47fec0942fa0
google.com, pub-4529402052683454, DIRECT, f08c47fec0942fa0

google.com, pub-5908399841745966, DIRECT, f08c47fec0942fa0
google.com, pub-4529402052683454, DIRECT, f08c47fec0942fa0

#CPMSTAR#
cpmstar.com, 50553, RESELLER
#SmartAdServer#
smartadserver.com, 3653, RESELLER
#HeaderLift#
google.com, pub-3374111250836391, RESELLER, f08c47fec0942fa0
`
    var requestGAMEDISTRIBUTION = http.request(optionsGAMEDISTRIBUTION, function (r) {
        var datagd = '';
        var datasg = "";
        r.on('data', function (chunk) {
            datagd += chunk;
        });
        r.on('end', function () {
            //TODO REMOVE SYNC AND MOVE IT TO ASYNC
            fs.writeFileSync(p, "#GameDistribution.com \r\n" + datagd + suffix)
            res.sendFile(p);

            // var requestSOFTGAMES = http.request(optionsSOFTGAMES, function (r) {
            //     r.on('data', function (chunk) {
            //         datasg += chunk;
            //     });
            //     r.on('end', function () {
            //         fs.writeFileSync(p, "#GameDistribution.com \r\n" + datagd + suffix + datasg)
            //         res.sendFile(p);
            //     });
            // });

            // requestSOFTGAMES.on('error', function (e) {
            //     console.log(e.message);
            // });
            // requestSOFTGAMES.end();

        });
    });

    requestGAMEDISTRIBUTION.on('error', function (e) {
        console.log(e.message);
    });
    requestGAMEDISTRIBUTION.end();
})

router.get('/index.html', (req, res) => {
    res.redirect('/')
});

router.use(express.static(path.join(__dirname, '..', 'src', "public")))


module.exports = router;
