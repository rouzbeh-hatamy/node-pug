const mongoose = require('mongoose')

mongoose.Promise = global.Promise


const reviewSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now()
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: "StoreUser",
        required: " you must supply an author"
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: "Store",
        required: " you must supply a store"
    },
    text: {
        type: String,
        required: "Your review must have a text"
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
})

module.exports = mongoose.model('Review', reviewSchema)