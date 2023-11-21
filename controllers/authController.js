const passport = require('passport')
const mongoose = require('mongoose')
const StoreUser = mongoose.model('StoreUser')
const crypto = require('crypto')
const promisify = require('es6-promisify')

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed login',
    successRedirect: '/',
    successFlash: 'Successfully logged in'
})

exports.logout = (req, res) => {
    req.logout()
    req.flash('success', 'logged out')
    res.redirect('/')
}

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
        return
    }

    req.flash('error', 'Ooops you must login first!')
    res.redirect('/login')
}

exports.forgotPassword = async (req, res, next) => {
    /*
    1-see if the user with that email exists ✔
    2-set reset token and expiry on their account ✔
    3-send email with the token 🤷‍♂️
    4-redirect to login page 🤷‍♂️
    */
    const user = await StoreUser.findOne({ email: req.body.email })
    if (!user) {
        req.flash('error', 'No account with that email exist')
        return res.redirect('/login')
    }

    user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour from now
    await user.save()
    const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`
    req.flash('success', `Email sent. link:${resetUrl}`)
    res.redirect('/login')
}

exports.resetPassword = async (req, res) => {
    const user = await StoreUser.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    })
    if (!user) {
        req.flash('error', 'invalid Link')
        return res.redirect('/login')
    }

    res.render('resetPassword', { title: 'Reset Your Password' })
}

exports.confirmPasswords = (req, res, next) => {
    if (req.body.password === req.body['password-confirm']) {
        next()
        return
    }
    req.flash('error', 'passwords do not match')
    res.redirect('back')
}


exports.setNewPassword = async (req, res) => {

    const user = await StoreUser.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
        req.flash('error', 'invalid Link')
        return res.redirect('/login')
    }
    const setPassword = promisify(user.setPassword(), user)
    await setPassword(req.body.password)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    const updateUser = await user.save()
    await req.login(updateUser)
    req.flash('success', 'Nice! Updated')
    res.redirect('/')
}