const mongoose = require('mongoose')
const StoreUser = mongoose.model('StoreUser')
const promisify = require('es6-promisify')

exports.loginForm = async (req, res) => {
    res.render('login', { title: "login form" })
}

exports.registerForm = async (req, res) => {
    res.render('register', { title: "Register form" })
}

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name')
    req.checkBody('name', ' you must enter a name').notEmpty()
    req.checkBody('email', ' you must enter a valid email').isEmail()
    req.sanitizeBody('email').normalizeEmail({ gmail_remove_dots: false, remove_extension: false, gmail_remove_subaddress: false })
    req.checkBody('password', 'password is required').notEmpty()
    req.checkBody('password-confirm', 'confirm password is required').notEmpty()
    req.checkBody('password-confirm', 'passwords do not match').equals(req.body.password)
    const errors = req.validationErrors()
    if (errors) {
        req.flash('error', errors.map(err => err.msg))
        res.render('register', { title: 'Register form', body: req.body, flashes: req.flash() })
    }
    next()
}

exports.register = async (req, res, next) => {
    const newUser = new StoreUser({ email: req.body.email, name: req.body.name })
    const registerWithPromise = promisify(StoreUser.register, StoreUser)
    await registerWithPromise(newUser, req.body.password)
    next()
}