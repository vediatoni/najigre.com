
//{"db":{"username":"admin","password":"Kr3APZkEgIWWMM1v","server":"cluster0-np7iy.mongodb.net"},"api":{"username":"admin","password":"Creamer-8Antics-leach2-sandbar-Coffee2-crudeness","server":"http://localhost:3000"}}
//{"db":{"username":"publisher","password":"J7ZRJTcJVgm2N25D","server":"najigre.com:27017/najigre"},"api":{"username":"admin","password":"Creamer-8Antics-leach2-sandbar-Coffee2-crudeness","server":"http://172.104.242.138:3001"}}
//{"db":{"username":"publisher","password":"J7ZRJTcJVgm2N25D","server":"najigre.com:27017/najigre"},"api":{"username":"admin","password":"Creamer-8Antics-leach2-sandbar-Coffee2-crudeness","server":"https://najigre.com"}}

import { app, ipcMain, dialog } from 'electron'
import { PublisherWindow } from './PublisherWindow'
import { GetGame, GetLists } from './Games'
import requestPromise from 'request-promise';
const defaultValues = { "api": { "username": "admin", "password": "Creamer-8Antics-leach2-sandbar-Coffee2-crudeness", "server": "https://najigre.com" } }
//const defaultValues = { "api": { "username": "admin", "password": "Creamer-8Antics-leach2-sandbar-Coffee2-crudeness", "server": "http://localhost:3000" } }
const creds = Buffer.from(defaultValues.api.username + ':' + defaultValues.api.password).toString('base64');

let loaderWin: PublisherWindow;
let publisherWin: PublisherWindow;
let curGame: { title: string, description: string, instructions: string, iframe: string, link: string, assets: string, mobile: boolean, categories: string, tags: string, res: boolean } | { res: boolean; msg: any; };

function createWindow() {
    loaderWin = new PublisherWindow(true, './dist/loader.html', 400, 175)
}

app.whenReady().then(createWindow)



//#region LOADER WINDOW REGION
ipcMain.on("tryConnectingToApi", (event, arg) => {
    event.sender.send('dataRequiredForApi', defaultValues.api)
})

ipcMain.on("connected", async (event, arg) => {
    await GetLists();
    curGame = await GetGame(defaultValues.api.server + "/api/admin/allgames", creds)
    if (!curGame.res) dialog.showErrorBox("Database error when retrieving games", (curGame as any).msg)
    else {
        publisherWin = new PublisherWindow(false, './dist/submit.html', 800, 600)

        loaderWin.Close();
    }

})
//#endregion


//#region PUBLISHER WINDOW REGION
ipcMain.on("getGameData", (event, arg) => {
    event.sender.send("gameData", curGame)
})

ipcMain.on("newGame", async (event, arg) => {
    curGame = await GetGame(defaultValues.api.server + "/api/admin/allgames", creds)
    if (!curGame.res) dialog.showErrorBox("Database error when retrieving games", (curGame as any).msg)
    else {
        event.sender.send("gameData", curGame)
    }
})

ipcMain.on("requestCategories", async (event, arg) => {
    await requestPromise(defaultValues.api.server + "/api/categories.json", {
        json: true
    })
        .then(res => event.sender.send('loadCategories', res))
        .catch(err => dialog.showErrorBox("Database error when retrieving categories", err))

})
//#endregion


//#region FOR ALL WINDWOS REGION
ipcMain.on("dialog", (event, arg) => {
    dialog.showMessageBox(arg)
})

//#endregion