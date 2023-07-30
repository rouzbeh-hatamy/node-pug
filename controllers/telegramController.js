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
  
       لطفا از طریق دکمه زیر کارت خود را ثبت کنید`;

    const data = await User.findOne({ id: msg.chat.id });

    if (data?.cards?.length) {
        text = `لیست کارت های فعال شما:\n\n`;
        data.cards.forEach((item, index) => {
            text += `شماره کارت :  <code>${item.card}</code>`;
            if (item.iban) {
                text += `\nشماره شبا :   <code>${item.iban}</code>`;
            }
            text += "\n------------------------------------------\n";
        });
    }

    bot.sendMessage(chatId, text, {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [{ text: "ذخیره شماره کارت", callback_data: "/savecard" }],
            ],
        },
    });
};

const handleSaveCardCommand = async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'شماره کارت خود را وارد کنید:');
}

const handleGetIbanNumber = (chatId) => {
    userStates.set(chatId, 'WAITING_FOR_IBAN')
    bot.sendMessage(chatId, 'شماره شبا خود را وارد کنید:');
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

const handleConfirmIban = async (msg) => {
    const chatId = msg.chat.id;
    const IbanNumber = ibantSate.get(chatId)
    // Send a confirmation message to the user
    bot.sendMessage(chatId, `
    شماره شبا شما "${IbanNumber}".
    آیا تایید می کنید؟`, {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {
                        text: 'بله',
                        callback_data: 'submit_iban',
                    },
                    {
                        text: 'خیر',
                        callback_data: 'cancel_submit_iban',
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


const handleSubmitIbanAndCard = async (chatId, messageId) => {
    const cardNumber = cardState.get(chatId);
    const ibanNumber = ibantSate.get(chatId);
    const card = { card: cardNumber, iban: ibanNumber };
    bot.deleteMessage(chatId, messageId);

    try {
        const updatedUser = await User.findOneAndUpdate(
            { id: chatId, 'cards.card': card.card }, // Find the user with the specified user ID and card number in the cards array
            {
                $set: {
                    'cards.$': card, // Update the existing card with the new card data
                },
            },
            { new: true }
        );

        if (updatedUser) {
            bot.sendMessage(chatId, 'شماره کارت ذخیره شد ✅');
            userStates.delete(chatId);
            cardState.delete(chatId);
            ibantSate.delete(chatId);
        } else {
            // If the card doesn't exist, create a new card for the user
            const newUser = await User.findOneAndUpdate(
                { id: chatId },
                { $addToSet: { cards: card } },
                { new: true }
            );

            if (newUser) {
                bot.sendMessage(chatId, 'شماره کارت ذخیره شد ✅');
                userStates.delete(chatId);
                cardState.delete(chatId);
                ibantSate.delete(chatId);
            } else {
                console.log('User not found.');
            }
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
};

const getUserCards = async (chatId, username) => {
    let text = ` کاربر مورد نظر شماره کارت ثبت شده ای ندارد 😢`
    const data = await User.findOne({ username })
    if (data?.cards?.length) {
        text = `لیست کارت های فعال ${data.name}:\n\n`;
        data.cards.forEach((item, index) => {
            text += `شماره کارت :  <code>${item.card}</code>`;
            if (item.iban) {
                text += `\nشماره شبا :   <code>${item.iban}</code>`;
            }
            text += "\n------------------------------------------\n";
        });
    }

    bot.sendMessage(chatId, text, {
        parse_mode: "HTML",
    })
}





bot.onText(/\/start/, async (msg, match) => {
    const incomingUser = { name: `${msg.from.first_name}  ${msg.from.last_name}`, id: msg.from.id, username: msg.from.username }
    const data = await User.findOne({ id: incomingUser.id })
    const isGroup = msg.chat.type === "group" || msg.chat.type === "supergroup";
    if (isGroup) {
        return bot.sendMessage(msg.chat.id, 'این عملکرد تنها در چت خصوصی با ربات فعال است')
    }

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
    const isGroup = msg.chat.type === "group" || msg.chat.type === "supergroup";

    if (isGroup) {
        return bot.sendMessage(msg.chat.id, 'این عملکرد تنها در چت خصوصی با ربات فعال است')
    }
    handleSaveCardCommand(msg)
});


bot.onText(/\/showcards/, (msg, match) => {
    const isGroup = msg.chat.type === "group" || msg.chat.type === "supergroup";
    if (isGroup) {
        return bot.sendMessage(msg.chat.id, 'در پاسخ به این پیام آیدی کاربری که اطلاعات کارت او را می خواهید وارد کنید')
    }
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
    if (command === 'cancel_submit_iban') {
        userStates.delete(chatId);
        cardState.delete(chatId);
        ibantSate.delete(chatId);
        bot.deleteMessage(chatId, message.message_id);
        return bot.sendMessage(chatId, 'ذخیره کارت لغو شد');
    }
    if (command === 'save_card') {
        return handleAddIban(chatId, message.message_id)
    }
    if (command === 'cancel_iban') {
        return handleSubmitCardNumber(chatId, message.message_id)
    }
    if (command === 'save_iban') {
        bot.deleteMessage(chatId, message.message_id);
        return handleGetIbanNumber(chatId)
    }
    if (command === 'submit_iban') {
        return handleSubmitIbanAndCard(chatId, message.message_id)
    }

    handleButtonCommand(message, command)
});



// Handler for user messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userState = userStates.get(chatId);
    const isGroup = msg.chat.type === "group" || msg.chat.type === "supergroup";

    if (isGroup && /^@/.test(msg.text)) {
        let username = msg.text.split('@')[1]
        getUserCards(chatId, username)
    }

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
    } else if (userState === 'WAITING_FOR_IBAN') {
        if (msg.text && msg.text.match(/^(?:IR)(?=.{24}$)[0-9]*$/)) {
            userStates.set(chatId, 'confirm_save');
            ibantSate.set(chatId, msg.text);
            handleConfirmIban(msg)
        } else {
            bot.sendMessage(chatId, 'شماره شبا اشتباه است، لطفا شماره شبای متصل به کارت خود را وارد کنید (بهمراه IR):');
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

