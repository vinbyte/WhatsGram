const {
  Client,
  MessageMedia,
  LocalAuth,
  ClientInfo,
} = require("whatsapp-web.js");
const fs = require("fs");
const {saveSessionToDb} = require("./handlers/handleSession");
const config = require("../config");
const { Deta } = require("deta");
const deta = Deta(config.DETA_PROJECT_KEY);
const whatsGramDrive = deta.Drive("WhatsGram");
var QRCode = require("qrcode");
const qrcode = require("qrcode-terminal");

let client

const initClient = () => {
  client = new Client({
    // Create client.
    authStrategy: new LocalAuth({
      dataPath: "./WWebJS",
    }),
    puppeteer: { headless: true, args: ["--no-sandbox"] },
  });
  client.options.puppeteer.userDataDir = null;

  client.on("qr", async (qr) => {
    console.log("Kindly check your telegram bot for QR Code.");
    await QRCode.toFile("qr.png", qr);
    await tgbot.telegram.sendPhoto(
      config.TG_OWNER_ID,
      { source: "qr.png" },
      { caption: "Scan it in within 20 seconds...." }
    );
    await qrcode.generate(qr, { small: true });
  });

  client.on("authenticated", (session) => {
    // Take action when user Authenticated successfully.
    console.log("Authenticated successfully.");
    if (fs.existsSync("qr.png")) fs.unlinkSync("qr.png");
  });

  client.on("logout", () => {
    // Take action when user logout.
    console.log(
      "Looks like you've been logged out. Please generate session again."
    );
    whatsGramDrive.delete("session.zip");
  });

  client.on("auth_failure", (reason) => {
    // If failed to log in.
    const message = "Failed to authenticate the client. Please fill env var again or generate session.json again. Generating session data again...";
    console.log(message);
    tgbot.telegram.sendMessage(config.TG_OWNER_ID, message, {
      disable_notification: true,
    });
    whatsGramDrive.delete("session.zip");
    initClient();
  });

  client.on("ready", async () => {
    // Take actin when client is ready.
    const message = "Successfully logged in. Ready to rock!";
    console.log(message);
    tgbot.telegram.sendMessage(config.TG_OWNER_ID, message, {
      disable_notification: true,
    });
    if (fs.existsSync("qr.png")) fs.unlinkSync("qr.png");
    await saveSessionToDb();
  });

  client.on("message", async (message) => { // Listen incoming WhatsApp messages and take action
    handleMessage(message , config.TG_OWNER_ID , tgbot, client);
  });
  
  client.on('message_create' , async (msg) => { // Listen outgoing WhatsApp messages and take action
    if (msg.body == "!alive") { // Alive command
      msg.delete(true)
      const aliveMsgData = await alive();
      client.sendMessage(msg.to, new MessageMedia(aliveMsgData.mimetype, aliveMsgData.data, aliveMsgData.filename), { caption: aliveMsgData.startMessage })
    }else{
      handleCreateMsg(msg , client , MessageMedia);
    }
  })
  
  client.on("disconnect", (issue) => {
    console.log( "WhatsApp has been disconnected due to" + issue + ". Please restart your dyno or do npm start." );
  });

  return client.initialize();
};

console.log(client)

module.exports = initClient;
