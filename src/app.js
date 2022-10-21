global.__base = __dirname;
// require('dotenv').config({ path: `${global.__base}/.env` });
const path = require('path');

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const session = require("express-session")
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "..", "views"))
app.set("view engine", "pug")

app.use(logger("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

const redisClient = redis.createClient({
	url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
	legacyMode: true,
});
redisClient.connect().catch(console.error)

redisClient.on('connect', () => {
	console.log('Redis client connected');
});

redisClient.on('error', function (error) {
	console.error('Redis connection error', error);
});

// session middleware
const sessConf = {
	store: new RedisStore({ client: redisClient }),
	name: process.env.SESSION_NAME,
	cookie: {
		httpOnly: true,
		maxAge: process.env.SESSION_COOKIE_MAX_AGE * 1000,
		domain: process.env.SESSION_COOKIE_DOMAIN,
	},
	saveUninitialized: false,
	secret: process.env.SESSION_SECRET,
	resave: false,
};
if (process.env.ENVIRONMENT === 'production') {
	app.set('trust proxy', true);
	sessConf.cookie.secure = true; // serve secure cookies
}

app.use(session(sessConf));

require('./routes/index.js')(app);

app.listen(process.env.PORT, () => {
	console.log('listening on *:' + process.env.PORT);
});

module.exports = app;
