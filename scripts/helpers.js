
const ejs = require('ejs')
var fs = require('fs');
const DataBase = require('./database')
const path = require('path')


//TODO MOVE FROM SYNC TO ASYNC
let listGameTemplate = fs.readFileSync(path.join(__dirname, '..', 'dist', 'gamecard.ejs'), 'utf-8');
let iggadvert = fs.readFileSync(path.join(__dirname, '..', 'dist', 'iggadvert.ejs'), 'utf-8');

module.exports.getSearchGameHtml = function (query, cb) {
    DataBase.FindGames({ "title": new RegExp(escapeRegExp(query), 'i') }, (r) => {
        if (r.length != 0) {
            module.exports.getGamesInHtmlList(r, (html) => {
                cb(html)
            })
        }
        else {
            cb("")
        }
    })
}

module.exports.getGamesInHtmlList = function (games, cb, advert = true) {
    this.getRandomAdvert("250x250", "kinguin_adverts", (advert) => {
        list = "";
        let alreadyAdvert = false
        let randomPlace = Math.floor(Math.random() * games.length)
        var i = 0;
        games.forEach(element => {

            if (i == randomPlace) {
                if (advert && !alreadyAdvert) {
                    list += ejs.render(iggadvert, {
                        size1: 2,
                        size2: 6,
                        advertLink: advert.link,
                        advertImg: advert.img,
                        advertImgDescription: advert.imgDescription
                    })

                    alreadyAdvert = true;

                }
            }


            list += getListGameData(element, 2, 6);

            i++;
        });

        cb(list);

    })
}

module.exports.getCategoryHTML = function (categoryId, cb) {
    if (categoryId == 1) {
        DataBase.FindGames({}, (r) => {
            module.exports.getGamesInHtmlList(r, (list) => {
                cb(list)
            })
        })
    }
    else {
        DataBase.FindGamesInCategory(false, [categoryId], (r) => {
            module.exports.getGamesInHtmlList(r, (list) => {
                cb(list)
            })
        })
    }
}

module.exports.getFrontPageData = function (mobile, cookies, cb) {
    DataBase.FrontPageData(mobile, cookies, (res) => {
        var bestPicks = "";
        var bestEver = "";
        var bestToday = "";
        var newest = "";

        res.BestToday.forEach(data => {
            bestToday += getListGameData(data, 2, 6);
        });

        res.BestEver.forEach(data => {

            bestEver += getListGameData(data, 2, 6);
        });

        res.Newest.forEach(data => {
            newest += getListGameData(data, 2, 6);
        });

        res.BestPicks.forEach(data => {
            bestPicks += getListGameData(data, 4, 12);
        });


        cb(bestPicks, bestToday, newest, bestEver)
    })
}

module.exports.returnRatePercentage = function (data) {
    let pos = data.likes;
    let neg = data.dislikes;
    return Math.floor((pos / (pos + neg)) * 100)
}

module.exports.nFormatter = function (num, digits) {
    var si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "k" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "G" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

module.exports.loadCategories = function (cb) {
    DataBase.FindCategory({}, (res) => {
        cb(res);
    })
}

module.exports.getRandomAdvert = function (type, collection, cb) {
    DataBase.GetRandomAdvert(type, collection, (res) => {
        cb(res)
    })
}

function getListGameData(data, s1, s2) {
    //var percentage = module.exports.returnRatePercentage(data)
    //var thumbs = percentage > 50 ? "fa-thumbs-up" : "fa-thumbs-down"
    var urltitle = (data.title.split(' ').join('-')).toLowerCase();
    var mobileElement;
    // var playElement = data.plays > 1000 ? `<div class="top-left rates"><i class="fas fa-eye"></i> ${module.exports.nFormatter(data.plays, 1)}</div> ` : ""
    // var thumbsElement = data.likes + data.dislikes > 20 ? `<div class="top-right rates"><i class="fas ${thumbs}"></i> ${percentage}%</div>` : ""

    if (s2 == 6) {
        mobileElement = data.mobile ? `<div class="mobile-icon-small"><i class="fas fa-mobile-alt"></i></div>` : ""
    }
    else {
        mobileElement = data.mobile ? `<div class="mobile-icon"><i class="fas fa-mobile-alt"></i></div>` : ""
    }



    return ejs.render(listGameTemplate, {
        size1: s1,
        size2: s2,
        gameid: data.id,
        gameurl: urltitle,
        mobile: mobileElement
        // playelement: playElement,
        // thumbselement: thumbsElement
    })
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
