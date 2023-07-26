const axios = require('axios')
const { START } = require('../constants/texts')
const bot = require('../telegramBot')
const mongoose = require('mongoose')
const User = mongoose.model('User')

const token = process.env.TOKEN
const serverUrl = process.env.SERVER_URL
const TELEGRAM_API = `https://api.telegram.org/bot${token}`
const URI = `/webhook/${token}`
const WEBHOOK_URL = serverUrl + URI
const myChatId = process.env.CHAT_ID
const userStates = new Map();
const cardState = new Map();
const ibantSate = new Map();





const handleShowCardsCommand = async (msg) => {
    const chatId = msg.chat.id;
    let text = `
    در حال حاضر کارتی برای شما ثبت نشده است!

     لطفا از طرق دکمه زیر کارت خود را ثبت کنید`
    const data = await User.findOne({ id: msg.chat.id })

    if (data.cards.length) {
        text = `
        لیست کارت های فعال شما :

        ${data.cards.map(item => {
            let text = `
                شماره کارت:    ${item.card}   
                ------------------------------------------
                `
            if (item.iban) {
                text = `
                    شماره کارت:    ${item.card}   
                    شماره شبا :   ${item.iban}   
                    ------------------------------------------
                    `

            }
            return text
        }).join(' ')
            }
        `
        bot.sendMessage(chatId, text, {
            "parse_mode": "HTML"
        });
    } else {
        bot.sendMessage(chatId, text, {
            "reply_markup": {
                "inline_keyboard": [
                    [
                        { text: 'ذخیره شماره کارت', callback_data: '/savecard' },
                    ]
                ],
            },
            "parse_mode": "HTML"
        });
    }
}

const handleSaveCardCommand = async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'شماره کارت خود را وارد کنید:');

}

const handleConfirmCardNumber = async (msg) => {
    const chatId = msg.chat.id;
    const cardNumber = cardState.get(chatId)
    // Send a confirmation message to the user
    bot.sendMessage(chatId, `شماره کارت شما "${cardNumber}". آیا تایید می کنید؟`, {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {
                        text: 'بله',
                        callback_data: 'save_card',
                    },
                    {
                        text: 'خیر',
                        callback_data: 'cancel_save',
                    },
                ],
            ],
        }),
    });

}


function handleButtonCommand(msg, command) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    bot.deleteMessage(chatId, messageId);

    switch (command) {
        case '/savecard':
            handleSaveCardCommand(msg)
            break;
        case '/showcards':
            handleShowCardsCommand(msg)
            break;
        // Add more cases for other button commands
        default:
            bot.sendMessage(chatId, 'Unknown command');
    }

}


const handleAddIban = (chatId, messageId) => {
    bot.deleteMessage(chatId, messageId);

    bot.sendMessage(chatId, 'آیا تمایل دارید شماره شبا نیز به همراه شماره کارت ذخیره شود؟', {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {
                        text: 'بله',
                        callback_data: 'save_iban',
                    },
                    {
                        text: 'خیر',
                        callback_data: 'cancel_iban',
                    },
                ],
            ],
        }),
    })
}

const handleSubmitCardNumber = async (chatId, messageId) => {
    const cardNumber = cardState.get(chatId)
    const card = { card: cardNumber }
    bot.deleteMessage(chatId, messageId);



    try {
        const updatedUser = await User.findOneAndUpdate(
            { id: chatId }, 
            { $addToSet: { cards: card } },
            { new: true } 
        );

        if (updatedUser) {
            bot.sendMessage(chatId, 'شماره کارت ذخیره شد ✅')
            userStates.delete(chatId);
            cardState.delete(chatId);
        } else {
            console.log('User not found.');
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }

}




bot.onText(/\/start/, async (msg, match) => {
    const incomingUser = { name: `${msg.from.first_name}  ${msg.from.last_name}`, id: msg.from.id }
    const data = await User.findOne({ id: incomingUser.id })

    if (!data) {
        const user = new User(incomingUser)
        await user.save()
    }

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
    handleSaveCardCommand(msg)
});


bot.onText(/\/showcards/, (msg, match) => {
    handleShowCardsCommand(msg)
});


bot.on('callback_query', (query) => {
    const { message } = query;
    const command = query.data;
    const chatId = query.message.chat.id;


    if (command === '/savecard') {
        userStates.set(chatId, 'waiting_for_card_number');
    }
    if (command === 'cancel_save') {
        userStates.delete(chatId);
        cardState.delete(chatId);
        bot.deleteMessage(chatId, message.message_id);
        return bot.sendMessage(chatId, 'ذخیره کارت لغو شد');
    }
    if (command === 'save_card') {
        return handleAddIban(chatId, message.message_id)
    }
    if (command === 'cancel_iban') {
        return handleSubmitCardNumber(chatId, message.message_id)
    }

    handleButtonCommand(message, command)
});



// Handler for user messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userState = userStates.get(chatId);

    if (userState === 'waiting_for_card_number') {
        // Check if the user sent a valid 16-digit card number
        if (msg.text && msg.text.match(/^\d{16}$/)) {

            // Change the user's state to "confirm_save"
            userStates.set(chatId, 'confirm_save');
            cardState.set(chatId, msg.text);
            handleConfirmCardNumber(msg)

        } else {
            // Invalid card number format, ask the user to enter a valid one
            bot.sendMessage(chatId, 'شماره کارت اشتباه است لطفا شماره 16 رقمی کارت را وارد کنید:');
        }
    } else if (userState === 'confirm_save') {

        // Handle user response to the confirmation message
        if (msg.text && (msg.text === 'بله' || msg.text === 'خیر')) {
            if (msg.text === 'بله') {
                // Card number confirmed, save it (you can implement your storage mechanism here)
                const cardNumber = 'YOUR_CARD_NUMBER'; // Replace with the actual card number
                bot.sendMessage(chatId, `Your card number "${cardNumber}" has been saved. Thank you!`);
            }
        } else {
            handleConfirmCardNumber(msg)
        }
    }
});


exports.getCommands = async (req, res, next) => {
    const tresponse = await axios.get(`${TELEGRAM_API}/getMyCommands`)
    res.send(tresponse.data)
}

exports.setCommands = async (req, res, next) => {
    const tresponse = await axios.get(`${TELEGRAM_API}/getMyCommands`)
    res.send(tresponse.data)
}



exports.registerBot = async (req, res) => {
    const register = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    bot.sendMessage(myChatId, 'bot starting');
    res.send('ok')
}

