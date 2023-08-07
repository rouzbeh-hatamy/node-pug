const passport = require('passport')
const mongoose = require('mongoose')
const StoreUser = mongoose.model('StoreUser')


passport.use(StoreUser.createStrategy())

passport.serializeUser(StoreUser.serializeUser())
passport.deserializeUser(StoreUser.deserializeUser())