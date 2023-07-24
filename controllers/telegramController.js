const axios = require('axios')
const { START } = require('../constants/texts')
const bot = require('../telegramBot')


const token = process.env.TOKEN
const serverUrl = process.env.SERVER_URL
const TELEGRAM_API = `https://api.telegram.org/bot${token}`
const URI = `/webhook/${token}`
const WEBHOOK_URL = serverUrl + URI
const myChatId = process.env.CHAT_ID
let text = 'سلام به ربات ما خوش اومدی'



function handleButtonCommand(msg, command) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    switch (command) {
        case '/savecard':
            bot.sendMessage(chatId, 'You pressed the savecard Command');
            break;
        case '/showcards':
            bot.sendMessage(chatId, 'You pressed the cards Command');
            break;
        // Add more cases for other button commands
        default:
            bot.sendMessage(chatId, 'Unknown command');
    }

    bot.deleteMessage(chatId, messageId);
}







bot.onText(/\/start/, (msg, match) => {
    bot.sendMessage(msg.chat.id, START, {
        "reply_markup": {
            "inline_keyboard": [
                [
                    { text: 'ذخیره شماره کارت', callback_data: '/savecard' },
                    { text: 'نمایش کارت های فعال', callback_data: '/showcards' },

                ]
            ],
        },
        "parse_mode": "HTML"
    });
});


bot.onText(/\/savecard/, (msg, match) => {
    text = 'ثبت شماره کارت / بزودی'
    this.sendMessage(msg.chat.id, text)
});
bot.onText(/\/showcards/, (msg, match) => {
    text = 'نمایش شماره کارت اعضای گروه / بزودی'
    this.sendMessage(msg.chat.id, text)
});


bot.on('callback_query', (query) => {
    const { message } = query;
    const command = query.data;

    handleButtonCommand(message, command)
});


exports.getCommands = async (req, res, next) => {
    const tresponse = await axios.get(`${TELEGRAM_API}/getMyCommands`)
    res.send(tresponse.data)
}

exports.setCommands = async (req, res, next) => {
    const tresponse = await axios.get(`${TELEGRAM_API}/getMyCommands`)
    res.send(tresponse.data)
}

exports.sendMessage = async (chatId, text, res) => {
    bot.sendMessage(chatId, text);

}

exports.registerBot = async (req, res) => {
    const register = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    bot.sendMessage(myChatId, 'bot starting');
    res.send('ok')
}

