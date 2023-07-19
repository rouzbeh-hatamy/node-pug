const axios = require('axios')
const token = process.env.TOKEN
const serverUrl = process.env.SERVER_URL
const TELEGRAM_API = `https://api.telegram.org/bot${token}`
const URI = `/webhook/${token}`
const WEBHOOK_URL = serverUrl + URI


exports.registerWebhook = async(req, res, next) => {

    const tresponse = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log('====================================');
    console.log(tresponse.data);
    console.log('====================================');


    next()
}