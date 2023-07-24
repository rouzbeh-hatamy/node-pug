const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const axios = require('axios')


exports.homePage = (req, res) => {
    res.render('index')
}

exports.addPage = (req, res) => {
    res.render('editStore', { title: "Add Store" })
}

exports.createStore = async (req, res) => {
    const store = new Store(req.body)
    const token = process.env.TOKEN
    const TELEGRAM_API = `https://api.telegram.org/bot${token}`
    const chatId = 92818586
    const text = `
    🤑 ‼️ *new store created* ‼️🤑
    
    *name:* ${store.name} 

    *description:* ${store.description}

    *tags:* ${store.tags.join(' ,')} `
    await store.save()
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        parse_mode:"markdown",
        text
    })
    res.redirect('/add')
}