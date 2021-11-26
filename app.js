module.exports.DEV = process.argv[2];

const express = require('express')
const app = express()
const compression = require('compression')
const PORT = module.exports.DEV == "true" ? 3001: 3000
const db = require('./scripts/database')
const i18n = require("i18n");
const cookieParser = require('cookie-parser')

i18n.configure({
    locales: ['en', 'sl', 'mk', 'hr' , 'bs', 'sr'],
    directory: __dirname + '/locales',
    defaultLocale: 'en',
    cookie: 'locale'
});

app.use(compression());
app.use(cookieParser());
app.use(i18n.init);
app.set('view engine', 'ejs');
app.set('trust proxy',true); 


app.use('/', require('./routes/Index'))
app.use('/res', require('./routes/Resources'))
app.use('/games', require('./routes/GameRoutes'));
app.use('/api', require('./routes/API'));

app.listen(PORT)
console.log("Started hosting on port "+ PORT)

