import { MongoClient } from "https://deno.land/x/mongo@v0.12.1/mod.ts";
import { readJsonSync } from "https://deno.land/std/fs/mod.ts";

const client = new MongoClient();
const MONGO_STRING = "mongodb://dbAdmin:7MHnG1oQwoie7Xe2GvdZYWsfLqmvqW@138.68.69.12:27017/admin"

client.connectWithUri(MONGO_STRING);

interface AdvertSchema {
    img: string
    imgDescription: string
    link: string
    size:string
}

interface RowSchema {
    rows: Array<Array<string>>,
    count: Number
}

const data: RowSchema = JSON.parse(await Deno.readTextFile('advert.json'));

if(!data) throw "Import data not found"

const db = client.database("najigre");

const kinguin_adverts = db.collection<AdvertSchema>("kinguin_adverts");



for (const iterator of data.rows) {
    let newAdvert: AdvertSchema = {
        img: iterator[13],
        imgDescription: iterator[24],
        size: iterator[12].split("P")[1],
        link: iterator[28]
    }

    kinguin_adverts.insertOne(newAdvert)
}


  
  