const fs = require("fs")
const MongoClient = require('mongodb').MongoClient;
const options = { useNewUrlParser: true, useUnifiedTopology: true };

let uri = require('../data').MONGODB_URI_STRING

path = "../src/data/Games/folders/"



let gamefolders = fs.readdirSync(path)

gamefolders.forEach((id)=>{
    let gamespecificPath = path+id;
    fs.unlinkSync(gamespecificPath+"/embed.txt")
})
