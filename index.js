require("dotenv").config();

const { initClient } = require('./app/whatsapp')
const {Client , MessageMedia, LocalAuth, ClientInfo} = require("whatsapp-web.js");
const { Telegraf } = require("telegraf");
const config = require("./config");
const alive = require('./modules/alive');
const handleMessage = require("./handlers/handleMessage");
const handleCreateMsg = require("./handlers/handleCreateMsg");
const handleTgBot = require("./handlers/handleTgbot");
const {saveSessionToDb, getSession, sessionInDb} = require("./handlers/handleSession");

const tgbot = new Telegraf(config.TG_BOT_TOKEN);

getSession(initClient);

