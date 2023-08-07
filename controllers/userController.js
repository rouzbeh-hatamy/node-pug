const mongoose = require('mongoose')

exports.loginForm = async (req, res) => {
    res.render('login', { title: "login form" })
}