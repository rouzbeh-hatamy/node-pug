const nodemailer = require('nodemailer')
const juice = require('juice')
const htmlToText = require('html-to-text')
const promisify = require('es6-promisify')
const template = require('../constants/mailTemplate')

const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
})


exports.send = async (options) => {
    const mailOptions = {
        from: `Rouzbeh Hatamy <roozbeh.hatamy@gmail.com>`,
        to: options.user.email,
        subject: options.subject,
        html: juice(template.mailTemplate(options.resetUrl)),
        text: htmlToText.htmlToText(template.mailTemplate(options.resetUrl))
    }
    const sendMail = promisify(transport.sendMail, transport)
    return sendMail(mailOptions)
}