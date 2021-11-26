const MongoClient = require('mongodb').MongoClient;
const options = { useNewUrlParser: true, useUnifiedTopology: true };

module.exports.uri = require('../data').MONGODB_URI_STRING_DEV;

module.exports.FindGames = function (filter, cb) {
  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) console.log("Error at adding connecting to database", err)

    const collection = client.db("najigre").collection("igre");
    collection.find(filter).toArray((err, res) => {
      if (err) throw err
      cb(res);
      client.close();
    });
  })
}

module.exports.GetBackupData = function (cb) {
  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) console.log("Error at adding connecting to database", err)
    const igre = client.db("najigre").collection("igre");
    const kategorije = client.db("najigre").collection("kategorije");
    const playsByDate = client.db("najigre").collection("playsByDate");
    const kinguin_adverts = client.db("najigre").collection("kinguin_adverts");
    const ip_data = client.db("najigre").collection("ip_data");
    igre.find({}).toArray((err, i) => {
      if (err) throw err
      kategorije.find({}).toArray((er, k) => {
        if (er) throw err
        playsByDate.find({}).toArray((er, p) => {
          if (er) throw err
          kinguin_adverts.find({}).toArray((er, ka) => {
            if (er) throw err
            ip_data.find({}).toArray((er, ipd) => {
              if (er) throw err
              cb({ games: i, categories: k, plays: p, adverts: ka, ip_data: ipd});
              client.close();
            });
          });
        });
      });
    });
  })
}

module.exports.FindCategory = function (filter, cb) {
  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) console.log("Error at adding connecting to database", err)

    const collection = client.db("najigre").collection("kategorije");

    collection.find(filter).toArray((err, res) => {
      if (err) throw err
      cb(res);
      client.close();
    });
  })
}

module.exports.NewGame = function (obj, cb) {
  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) console.log("Error at adding connecting to database", err)
    const collection = client.db("najigre").collection("igre");
    module.exports.FindGames({ title: obj.title }, (res) => {
      if (res.length == 0) {
        getLatestID(collection, (id) => {
          let date = new Date();
          collection.insertOne({
            id: id,
            plays: 0,
            likes: 0,
            dislikes: 0,
            title: obj.title,
            description: obj.description,
            instructions: obj.instructions,
            mobile: obj.mobile,
            rate: obj.rate,
            categories: obj.categories,
            date: date,
            iframe: obj.iframe
          }, (err, res) => {
            cb(err, res, id)
            client.close();
          });
        })
      }
      else {
        cb(`Game titled: ${obj.title} already exists`, false, 0)
      }
    })
  })
}

module.exports.NewCategory = function (name, cb) {
  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) console.log("Error at connecting to database", err)
    const collection = client.db("najigre").collection("kategorije");

    getLatestID(collection, (id) => {
      collection.insertOne({
        id: id,
        title: name
      }, (err, res) => {
        cb(err, res)
        client.close();
      });
    })
  })
}

module.exports.IncrementGamePlays = function (id) {
  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) console.log("Error at connecting to database", err)

    const collection = client.db("najigre").collection("igre");
    collection.updateOne(
      { id: id },
      { $inc: { plays: 1 } },
      (err, res) => {
        if (err) throw err;

        client.close();
      });
  })
}

module.exports.IncrementTodayGamePlays = function (gameid) {
  var dateObj = new Date();
  var month = dateObj.getUTCMonth(); //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();
  let newDate = new Date(year, month, day);

  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) console.log("Error at connecting to database", err)

    const collection = client.db("najigre").collection("playsByDate");

    collection.find({ date: newDate }).toArray((err, res) => {
      if (err) console.log(err)

      else if (res.length == 0) {
        collection.insertOne({
          date: newDate,
          [gameid]: 1,
        }, (err, res) => {
          if (err) throw err;

          client.close();
        })
      }

      else {
        collection.updateOne(
          { date: newDate },
          { $inc: { [gameid]: 1 } },
          (err, res) => {
            if (err) throw err;

            client.close();
          });
      }
    });
  })
}

module.exports.SaveIpData = function (ip) {
  var dateObj = new Date();

  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) console.log("Error at connecting to database", err)

    const collection = client.db("najigre").collection("ip_data");

    collection.insertOne({
      ip: ip,
      date: dateObj
    }, (err, res) => {
      if (err) throw err;

      client.close();
    })
  })
}

module.exports.FrontPageData = function (mobile, cookies, cb) {
  gamesForYou(mobile, cookies, (gamesForYou) => {
    bestGamesEver(mobile, 24, (bestEver) => {
      latestGames(mobile, 18, (latestGames) => {
        topGamesToday(mobile, 18, (topGamesToday) => {
          cb({
            "BestToday": topGamesToday,
            "BestEver": bestEver,
            "Newest": latestGames,
            "BestPicks": gamesForYou
          })
        })
      })
    })
  })

}

module.exports.FindGamesInCategory = function (mobile, categories, cb) {
  if (mobile) module.exports.FindGames({ categories: { "$in": categories }, mobile: true }, cb)
  else module.exports.FindGames({ categories: { "$in": categories } }, cb)
}

module.exports.TestConnection = function (cb) {
  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) cb(false, err)
    else {
      console.log("Hey")
      cb(true, "Success")
      client.close();
    }
  })
}

module.exports.RemoveGame = function (filter, cb) {
  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) cb(false, err)
    else {
      const collection = client.db("najigre").collection("igre");
      collection.deleteOne(filter, (err, res) => {
        console.log("Cleaned up after game publishing failure")
        client.close();
      })
    }
  })
}

module.exports.GetRandomAdvert = function (type, col, cb) {
  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) cb(false, err)
    else {
      const collection = client.db("najigre").collection(col);
      collection.find({ size: type }).toArray((err, res) => {
        if (err) throw err
        var advert = res[Math.floor(Math.random() * res.length)];
        cb(advert);
        client.close();
      });
    }
  })
}


function getLatestID(collection, cb) {
  collection.find({}).sort({ id: -1 }).toArray((err, res) => {
    cb(res[0].id + 1);
  })
}

function latestGames(mobile, amount, cb) {
  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) console.log(err);

    const collection = client.db("najigre").collection("igre");
    collection.find(mobile ? { mobile: true } : {}).sort({ id: -1 }).limit(amount).toArray((err, res) => {
      cb(res)
      client.close();
    });
  })
}

function topGamesToday(mobile, amount, cb) {
  getTopGamesTodayArrayObject(amount, (res) => {
    if (res.length < amount) {
      getRandomGames(mobile, res, amount - res.length, (r) => {
        module.exports.FindGames({ id: { $in: res } }, (gr) => {
          for (let i = 0; i < res.length; i++) {
            const el = res[i];
            for (let j = 0; j < gr.length; j++) {
              if (el == gr[j].id) res[i] = gr[j];
            }
          }
          cb(res.concat(r))
        })
      });
    }
    else if (res.length == amount) {
      module.exports.FindGames({ id: { $in: res } }, (r) => {
        for (let i = 0; i < res.length; i++) {
          const el = res[i];
          for (let j = 0; j < r.length; j++) {
            if (el == r[j].id) res[i] = r[j];
          }
        }
        cb(res)
      })

    }
  })
  // TODO
  // getRandomGames(mobile, 8, (games) => {
  //   cb(games)
  // })
}

function getTopGamesTodayArrayObject(amount, cb) {
  var dateObj = new Date();
  var month = dateObj.getUTCMonth(); //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();
  let newDate = new Date(year, month, day);

  MongoClient.connect(module.exports.uri, options, (err, client) => {
    if (err) console.log("Error at connecting to database", err)

    const gamesObjectsArray = [];
    const idArray = [];

    const collection = client.db("najigre").collection("playsByDate");
    collection.find({ date: newDate }).toArray((err, res) => {
      if (err) throw err

      for (var propName in res[0]) {
        if (res[0].hasOwnProperty(propName)) {
          var propValue = res[0][propName];
          if (propName != "_id" && propName != "date") {
            gamesObjectsArray.push({ id: propName, plays: propValue })
          }
        }
      }

      gamesObjectsArray.sort(compareTodayGamePlays)

      gamesObjectsArray.forEach(obj => {
        if (idArray.length < amount) {
          idArray.push(parseInt(obj.id));
        }
      })

      cb(idArray);

      client.close();
    });
  })
}

function compareTodayGamePlays(a, b) {
  const gameA = a.plays;
  const gameB = b.plays;

  let comparison = 0;
  if (gameA > gameB) {
    comparison = -1;
  } else if (gameA < gameB) {
    comparison = 1;
  }
  return comparison;
}

function gamesForYou(mobile, cookies, cb) {
  if (cookies != "" && cookies != null) {
    getBestGameList(mobile, cookies, (res) => {
      if (res.length < 3) {
        let idArray = [];

        res.forEach((el) => {
          idArray.push(parseInt(el))
        })

        getRandomGames(mobile, idArray, 3 - res.length, (r) => {
          cb(res.concat(r))
        });
      }
      else if (res.length == 3) {
        cb(res)
      }
      else {
        //TODO: BETTER ALGORITMH THAT SHOWS BETTER GAMES
        let gameslist = []
        for (let i = 0; i < 3; i++) {
          let game = Math.floor(Math.random() * res.length);
          if (!gameslist.includes(res[game]))
            gameslist.push(res[game]);
          else i--
        }

        cb(gameslist)
      }
    })
  }
  else {
    getRandomGames(mobile, [], 3, (games) => {
      cb(games);
    })
  }
}

function getBestGameList(mobile, cookies, cb) {

  splitValues = cookies.split(',');

  var gameId = splitValues.map(function (x) {
    return parseInt(x);
  });

  module.exports.FindGames({ id: { $in: gameId } }, (res) => {
    var categoryArray = []

    for (let i = 0; i < res.length; i++) {
      const element = res[i];
      if (element.categories.length > 1) {
        for (let j = 0; j < element.categories.length; j++) {
          const el = element.categories[j];
          if (!categoryArray.includes(el)) {
            categoryArray.push(el)
          }
        }
      }
      else {
        if (!categoryArray.includes(element.categories)) {
          categoryArray.push(element.categories)
        }
      }
    }

    module.exports.FindGamesInCategory(mobile, categoryArray, (r) => {
      cb(r);
    })
  })
}

function getRandomGames(mobile, ningames, n, cb) {
  module.exports.FindGames(mobile ? { mobile: true, id: { $nin: ningames } } : { id: { $nin: ningames } }, (res) => {
    var games = [];

    for (let i = 0; i < n; i++) {
      let gid = Math.floor(Math.random() * res.length);
      if (!games.includes(res[gid]))
        games.push(res[gid]);
      else
        i--;
    }

    cb(games)
  })
}

function bestGamesEver(mobile, amount, cb) {
  MongoClient.connect(module.exports.uri, options, (err, client) => {

    if (err) console.log(err);

    const collection = client.db("najigre").collection("igre");
    collection.find(mobile ? { mobile: true, rate: { $gte: 4 } } : { rate: { $gte: 4 } }).sort({ plays: -1 }).limit(amount).toArray((err, res) => {
      var games = [];

      // var maxTopGames = res.length < 8 ? res.length-1 : 8

      // for (let i = 0; i < maxTopGames; i++) {
      //   let gid = Math.floor(Math.random() * res.length);
      //   if (!games.includes(res[gid]))
      //     games.push(res[gid]);
      //   else
      //     i--;
      // }

      cb(res)
      client.close();
    });
  })
}

// module.exports.cc = function (cb) {
//   MongoClient.connect(module.exports.uri, options, (err, client) => {
//     if (err) console.log("Error at adding connecting to database", err)

//     const collection = client.db("najigre").collection("playsByDate");

//     collection.find({}).toArray((err, res) => {
//       if (err) throw err
//       cb(res)

//       client.close();
//     });
//   })
// }


// module.exports.gay = function (res) {
//   MongoClient.connect("mongodb://publisher:J7ZRJTcJVgm2N25D@172.104.242.138:27017", options, (err, client) => {
//     if (err) console.log("Error at adding connecting to database", err)

//     const collection = client.db("najigre").collection("playsByDate");

//     collection.insertMany(res,(err,res)=>{
//       client.close();
//     })

//   })     
// }