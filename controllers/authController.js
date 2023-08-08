const passport = require('passport')

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