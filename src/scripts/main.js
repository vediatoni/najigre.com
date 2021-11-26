$(function () {
    cookiesHandler();
});

function cookiesHandler() {
    $('body').ihavecookies({
        title: "Cookies and privacy",
        message: "This website uses cookies to ensure you get the best experience on our site.",

        link: "/privacy-policy/",
        expires: 30,
        delay: 2000,
        cookieTypes: [
            {
                type: 'Site Preferences',
                value: 'preferences',
                description: 'These are cookies that are related to your site preferences, e.g. remembering your username, site colours, etc.'
            },
            {
                type: 'Analytics',
                value: 'analytics',
                description: 'Cookies related to site visits, browser types, etc.'
            },
        ],
        onAccept: function () {
            var myPreferences = $.fn.ihavecookies.cookie();
        },
    });

    if ($.fn.ihavecookies.preference('marketing') === true) {
    }

    $('#ihavecookiesBtn').on('click', function () {
        $('body').ihavecookies(options, 'reinit');
    });
}

function navigateToGame(gameId) {
    setGameCookie(gameId)
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setGameCookie(gameId) {
    let gValue = getCookie("recentlyPlayed");
    if (gValue != "") {
        let splitValues = gValue.split(',');
        if (splitValues.length <= 4) {
            if (splitValues[splitValues.length - 1] != gameId) {
                splitValues.push(gameId);
                document.cookie = `recentlyPlayed = ${splitValues.toString()};`
            }
        }
        else {
            document.cookie = `recentlyPlayed = ${gameId};`
        }
    }
    else {
        document.cookie = `recentlyPlayed = ${gameId};`
    }
}

function changeLanguage() {
    let languageSelected = document.getElementById("languageSelector");
    document.cookie = `locale = ${languageSelected.value};`;
    window.location.href = '/';
}