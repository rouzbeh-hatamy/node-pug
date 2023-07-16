const mongoose = require('mongoose')
const slug = require('slugs')

mongoose.Promise = global.Promise

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: "Please Enter a Store Name!"
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String]
})

storeSchema.pre('save', function (next) {
    if (!this.isModified('name')) {
        return next()
    }
    //make a slug from a name: lowercase and dashed
    this.slug = slug(this.name)
    next()
    // TODO: unique name
})

module.exports = mongoose.model('Store', storeSchema)
