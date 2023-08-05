const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const bot = require('../telegramBot')
const chatId = process.env.CHAT_ID
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/')
        if (isPhoto) {
            next(null, true)
        } else {
            next({ message: "that file is not allowed" }, false)
        }
    }
}

exports.homePage = (req, res) => {
    res.render('index')
}

exports.addPage = (req, res) => {
    res.render('editStore', { title: "Add Store" })
}

exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save()
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
    const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true })
    //todo: confirm account

    const text = `
    🤑 ‼️ *store updated* ‼️🤑
    
    *name:* ${store.name} 

    *description:* ${store.description}

    *tags:* ${store.tags.join(' ,')} `

    bot.sendMessage(chatId, text, { parse_mode: "Markdown" })

    req.flash('success', 'Store Updated')
    res.redirect('/stores')
}

exports.upload = multer(multerOptions).single('photo')

exports.resize = async (req, res, next) => {
    if (!req.file) {
        next()
        return
    }
    const extension = req.file.mimetype.split('/')[1]
    req.body.photo = `${uuid.v4()}.${extension}`
    const photo = await jimp.read(req.file.buffer)
    await photo.resize(800, jimp.AUTO)
    await photo.write(`./public/uploads/${req.body.photo}`)
    next()
}

exports.getStoreBySlug = async (req, res) => {
    res.send('works')
}