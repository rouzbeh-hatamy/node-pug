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
    req.body.author = req.user._id;
    const store = await (new Store(req.body)).save()
    const text = `
    🤑 ‼️ *new store created* ‼️🤑
    
    *name:* ${store.name} 

    *description:* ${store.description}

    *tags:* ${store.tags.join(' ,')} `

    bot.sendMessage(chatId, text, { parse_mode: "Markdown" })

    res.redirect(`/stores/${store.slug}`)
}

exports.getStores = async (req, res) => {
    const stores = await Store.find()
    res.render('stores', { title: 'stores', stores })
}
const confirmOwner = (store, user) => {
    if (!store.author.equals(user._id)) {
        throw Error('you must own a store to edit ')
    }

}

exports.editStore = async (req, res) => {
    try {
        const store = await Store.findOne({ _id: req.params.id })
        confirmOwner(store, req.user)
        res.render('editStore', { title: `edit ${store.name}`, store })
    } catch (error) {
        req.flash('error', error.message)
        res.redirect('back')
    }
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

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({ slug: req.params.slug }).populate('author')
    if (!store) return next()

    res.render('store', { store, title: store.name })
}


exports.getStoresByTag = async (req, res) => {
    const tagsPromise = Store.getTagsList()
    const tag = req.params.tag;
    const tagQuery = tag ? { tags: tag } : { $exists: true };
    const storesPromise = Store.find(tagQuery);
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise])

    res.render('tags', { tags, stores, title: "Tags page", tag })
}


exports.searchStores = async (req, res) => {
    // first we find stores with the input text
    const stores = await Store.find({
        $text: {
            $search: req.query.q
        }
    },
        // next we score results based on how close their text are to
        {
            score: { $meta: "textScore" }
        })
        // next we sort the data based on the score we get
        .sort({ score: { $meta: "textScore" } })
        //last we limit them to 5 items
        .limit(5)


    res.json(stores)
}