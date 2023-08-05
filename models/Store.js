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
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: [{
            type: Number,
            required: "you must supply coordinates"
        }],
        address: {
            type: String,
            required: "you must supply an address"
        }
    },
    photo: String
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
