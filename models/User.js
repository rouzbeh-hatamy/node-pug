const mongoose = require('mongoose')

mongoose.Promise = global.Promise

const CardSchema = new mongoose.Schema({
    card: {
        type: String,
        required: "Please Enter a card number!"
    },
    iban: {
        type: String,
    },
})

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    username: {
        type: String,
    },
    id: {
        type: Number
    },
    cards: [CardSchema]
})


module.exports = mongoose.model('User', UserSchema)
