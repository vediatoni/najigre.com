import { MongoClient } from "https://deno.land/x/mongo@v0.12.1/mod.ts";
import { readJsonSync } from "https://deno.land/std/fs/mod.ts";

const client = new MongoClient();
const MONGO_STRING = "mongodb://dbAdmin:7MHnG1oQwoie7Xe2GvdZYWsfLqmvqW@138.68.69.12:27017/admin"

client.connectWithUri(MONGO_STRING);

interface GameSchema {
    id: number
    plays: number
    likes: number
    dislikes: number
    title: string
    description: string
    instructions: string
    mobile: boolean
    rate: number
    categories: Array<number>
    date: string
    iframe: string
}

interface CategorySchema {
    id: number
    title: string
}

interface AdvertSchema {
    img: string
    imgDescription: string
    link: string
    size:string
}

interface IPSchema {
    ip: string
    date: string
}


const data: {games: Array<GameSchema>, categories: Array<CategorySchema>, plays: Array<any>, adverts: Array<AdvertSchema>, ip_data: Array<IPSchema>} = JSON.parse(await Deno.readTextFile('b.json'));

if(!data) throw "Import data not found"

const db = client.database("najigre");

const games = db.collection<GameSchema>("igre");
const kategorije = db.collection<CategorySchema>("kategorije");
const playsByDate = db.collection("playsByDate");
const kinguin_adverts = db.collection<AdvertSchema>("kinguin_adverts");
const ip_data = db.collection<IPSchema>("ip_data");

games.insertMany(data.games);
kategorije.insertMany(data.categories);
playsByDate.insertMany(data.plays);
kinguin_adverts.insertMany(data.adverts);
ip_data.insertMany(data.ip_data);
  