import requestPromise from "request-promise"

const GD = "https://catalog.api.gamedistribution.com/api/v1.0/rss/All/?collection=all&categories=All&type=all&mobile=all&rewarded=all&amount=40&page=1&format=json"
const GM = "https://gamemonetize.com/rssfeed.php?format=json&category=All&type=html5&company=All&amount=40"
const GA = "https://www.gamearter.com/export/v1/games"
const FA = "https://api.famobi.com/feed"

var GD_LIST: Array<any> = new Array();
var GM_LIST: Array<any> = new Array();
var GA_LIST: Array<any> = new Array();
var FA_LIST: Array<any> = new Array();

export const GetLists = async (): Promise<void> => {
    GD_LIST = JSON.parse(await requestPromise(GD))
    // GM_LIST = JSON.parse(await requestPromise(GM))
    GA_LIST = JSON.parse(await requestPromise(GA))
    FA_LIST = (JSON.parse(await requestPromise(FA))).games
}

export const GetGame = async (uri: string, creds: string): Promise<{ title: string, description: string, instructions: string, iframe: string, link: string, assets: string, mobile: boolean, categories: string, tags: string, res: boolean } | { res: boolean; msg: any; }> => {
    let dbGames = await requestPromise(uri, {
        method: "get",
        json: true,
        headers: {
            Authorization: 'Basic ' + creds,
        }
    })
        .catch(err => { return { res: false, msg: err } })
        .then(res => { return { res: true, msg: res } })

    if (!dbGames.res) return dbGames;
    else {
        var game: { title: string, description: string, instructions: string, iframe: string, link: string, assets: string, mobile: boolean, categories: string, tags: string, res: boolean } = null
        while (game == null) {
            game = await getGamePromise().catch((err) => {
                return null;
            });

            try {
                if (game != null) {
                    for (let i = 0; i < dbGames.msg.length; i++) {
                        const element = dbGames.msg[i];
                        if (element.title.includes(game.title) || !game.assets) {
                            game = null;
                        }
                    }
                }
            } catch (error) {
                game = null
            }
        }
        return game;
    }
}

const getGamePromise = async (): Promise<{ title: string, description: string, instructions: string, iframe: string, link: string, assets: string, mobile: boolean, categories: string, tags: string, res: boolean }> => {
    try {
        var listRand = betterRandom(1, 4);

        switch (listRand) {
            case 1:
                var g = getRandomGame(GD_LIST);

                var iframe = `<iframe src="${g.url}" width="1050" height="720" scrolling="none" frameborder="0"></iframe>`
                var categories = "";
                var tags = "";

                g.categoryList.forEach(element => {
                    categories += " " + element.name + ","
                });
                g.tagList.forEach(element => {
                    tags += " " + element.name + ","
                });

                categories = categories.substring(0, categories.length - 1);
                tags = tags.substring(0, tags.length - 1);

                var thumbnailLink = await getGDThumbnail(g.assetList);

                return {
                    title: g.title,
                    description: g.description,
                    instructions: g.instructions,
                    iframe: iframe,
                    link: g.url,
                    assets: thumbnailLink,
                    mobile: g.gameMobile,
                    categories: categories,
                    tags: tags,
                    res: true,
                }

            case 2:
                var g = getRandomGame(GM_LIST);
                var mobile = g.tags.includes('Mobile')
                var iframe = `<iframe src="${g.url}" width="450" height="750" scrolling="none" frameborder="0"></iframe>`
                var thumbnailLink = await getGMThumbnail(g.thumb);
                return {
                    title: g.title,
                    description: g.description,
                    instructions: g.instructions,
                    iframe: iframe,
                    link: g.url,
                    assets: thumbnailLink,
                    mobile: mobile,
                    categories: g.category,
                    tags: g.tags,
                    res: true,
                }


            case 3:
                var g = getRandomGame(GA_LIST);

                if (g.revenue_share != null) {
                    let category = g.category ? g.category.toString() : "none";

                    var iframe = `<iframe src="${g.url}" width="100%" height="100%" allow="fullscreen" scrolling="none" frameborder="0"></iframe>`
                    return {
                        title: g.name,
                        description: g.description,
                        instructions: g.controls,
                        iframe: iframe,
                        link: g.url,
                        assets: g.thumbnail,
                        mobile: g.mobile,
                        categories: category,
                        tags: "none",
                        res: true,
                    }
                }

                break;
            case 4:
                var g = getRandomGame(FA_LIST);

                var affiliate_key = "A-XEYMF"
                var iframe = `<iframe id="fg-frame-bubble-woods" width="640" height="640" data-aspect-ratio="1" src="" frameborder="0"></iframe><script>(function(d, url, fgJS, firstJS){fgJS = d.createElement('script');firstJS=d.getElementsByTagName('script')[0];fgJS.src=url;fgJS.onload=function() {var fg_frame=document.getElementById('fg-frame-bubble-woods');var fg_url='${g.link}/${affiliate_key}';var mobileRedirect=false;var mobileTablet=false;famobi_embedFrame(fg_frame, fg_url, mobileRedirect, mobileTablet);};firstJS.parentNode.insertBefore(fgJS, firstJS);})(document, 'https://games.cdn.famobi.com/html5games/plugins/embed.js?v=2.1')</script>`
                return {
                    title: g.name,
                    description: g.description,
                    instructions: g.description,
                    iframe: iframe,
                    link: g.link,
                    assets: g.thumb,
                    mobile: true,
                    categories: g.categories.toString(),
                    tags: "none",
                    res: true,
                }
        }

        return null;
    } catch (error) {
        return null;
    }
};

const getGMThumbnail = async (link: string): Promise<string> => {
    // https://img.gamemonetize.com/up2tplehdk6ox408ro32nj3me3di8eg2/512x384.jpg
    var split = link.split('/')
    var link512x512 = split[0] + "//" + split[2] + "/" + split[3] + "/512x512.jpg"
    var result = await requestPromise({ uri: link512x512, json: true, resolveWithFullResponse: true });

    if (result.request.uri.href == "https://html5.gamemonetize.com/404.html") {
        return (link)
    }
    else {
        return (link512x512)
    }
}

const getGDThumbnail = async (assetList: Array<{ name: string }>): Promise<string> => {
    // [
    //     {
    //       name: 'https://img.gamedistribution.com/0193bca624b34b0586c9686499e237c6-512x384.jpeg'
    //     },
    //     {
    //       name: 'https://img.gamedistribution.com/0193bca624b34b0586c9686499e237c6-512x512.jpeg'
    //     },
    //     {
    //       name: 'https://img.gamedistribution.com/0193bca624b34b0586c9686499e237c6-512x340.jpeg'
    //     }
    //   ]

    for (let i = 0; i < assetList.length; i++) {
        const element = assetList[i];

        if (element.name.includes("512x512.jpeg") || element.name.includes("512x512.jpg")) {
            return element.name;
        }
    }

    return assetList[0].name
}

function getRandomGame(LIST) {
    var a = LIST[betterRandom(0, LIST.length)];
    return a;
}

function betterRandom(min: number, max: number) {
    return Math.floor(Math.random() * max) + min;
}