const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const axios = require('axios')
const bot = require('../telegramBot')


exports.homePage = (req, res) => {
    res.render('index')
}

exports.addPage = (req, res) => {
    res.render('editStore', { title: "Add Store" })
}

exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save()
    const chatId = 92818586
    const text = `
    🤑 ‼️ *new store created* ‼️🤑
    
    *name:* ${store.name} 

    *description:* ${store.description}

    *tags:* ${store.tags.join(' ,')} `

    bot.sendMessage(chatId, text, { parse_mode: "Markdown" })

    res.redirect(`/store/${store.slug}`)
}

exports.getStores = async (req, res) => {
    const stores = await Store.find()
    res.render('stores', { title: 'stores', stores })
}

exports.editStore = async (req, res) => {
    const store = await Store.findOne({ _id: req.params.id })
    //todo: confirm account
    res.render('editStore', { title: `edit ${store.name}`, store })
}

exports.updateStore = async (req, res) => {
    const store = await Store.findOneAndUpdate({ _id: req.params.id })
    //todo: confirm account
    res.render('editStore', { title: `edit ${store.name}`, store })
}