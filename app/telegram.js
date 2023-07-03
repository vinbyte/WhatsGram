const config = require("../config");
const { Telegraf } = require("telegraf");
const {Client , MessageMedia, LocalAuth, ClientInfo} = require("whatsapp-web.js");

const tgbot = new Telegraf(config.TG_BOT_TOKEN);

// Set bot commands. 
const cmd = (cmd, desc) => ({command: cmd, description: desc});
try{
  tgbot.telegram.setMyCommands([cmd('start', 'Start bot.'), cmd('mar', 'Mark message as read.'), cmd('send', 'Ex: /send ph_no message'), cmd('update', 'Update UB.'), cmd('restart', 'Restart ub.')]);
}catch(e){
  console.error('Failed to set commands.');
}

// Telegram Bot
tgbot.start(ctx => ctx.replyWithMarkdown(`Hey **${ctx.message.from.first_name}**, Welcome! \nI can notify you about new messages of WhatsApp. \n\nPowered by [WhatsGram](https://github.com/WhatsGram/WhatsGram).`,
  {disable_web_page_preview: true,
   reply_markup:{
    inline_keyboard: [[{text:'WhatsGram Repo', url:'https://github.com/WhatsGram/WhatsGram'},{text:'Support Group', url:'https://t.me/assupportchat'}],
                      [{text:'Developer', url:'https://github.com/AffanTheBest'}, {text:'Donate', url:'https://ko-fi.com/affanthebest'}]]
  }}
));
tgbot.command('donate', ctx => { // Donate Command
  ctx.replyWithMarkdown('Thank you for showing intrest in donating! \nYou can donate me using following methods 👇\n\n*UPI Address*: `siddiquiaffan201@okaxis` \n\nOr you can use following links.',
  {disable_web_page_preview: true,
   reply_markup:{
     inline_keyboard: [[{text: 'Ko-fi', url: 'https://ko-fi.com/affanthebest'}, {text: 'Paypal', url: 'https://paypal.me/affanthebest'}]]
  }})
});
async function restart (ctx) {
  if (ctx) await ctx.replyWithMarkdown('Restarting...', {disable_notification: true})
  else tgbot.telegram.sendMessage(config.TG_OWNER_ID, 'Restarting...', {disable_notification: true})
  client.options.puppeteer.userDataDir = null;
  await client?.destroy() || null;
  await initClient();
}
tgbot.command('restart', ctx => restart(ctx)); // Restart WhatsApp Client using TG Bot.
setInterval(() => restart(), 1000 * 60 * 60 * 12); // Auto restart WhatsApp client every 12 hours.

tgbot.on("message", (ctx) => { // Listen TG Bot messages and take action
  handleTgBot(ctx , client , MessageMedia);
});

tgbot.launch(); // Initialize Telegram Bot