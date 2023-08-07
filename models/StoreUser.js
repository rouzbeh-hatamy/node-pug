const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const md5 = require('md5')
const validator = require('validator')
const mongodbErrorHandler = require('mongoose-mongodb-errors')
const passportLocalMongoose = require('passport-local-mongoose')


const StoreUserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'invalid Email Address'],
        required: "Please enter a n Email Address"
    },
    name: {
        type: String,
        required: 'Please Enter your Name',
        trim: true
    }
})

StoreUserSchema.plugin(passportLocalMongoose, { usernameField: 'email' })
StoreUserSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model('StoreUser', StoreUserSchema)
