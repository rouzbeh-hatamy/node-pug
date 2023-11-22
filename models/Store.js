const mongoose = require('mongoose')
const slug = require('slugs')
const uuid = require('uuid')

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
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: ' You must supply a user'
    }
})

storeSchema.pre('save', async function (next) {
    if (!this.isModified('name')) {
        return next()
    }

    //make a slug from a name: lowercase and dashed
    this.slug = slug(this.name)
    const similiarStore = await this.constructor.find({ slug: this.slug })

    if (similiarStore.length) {
        this.slug = `${this.slug}-${uuid.v4()}`
    }
    next()
    // TODO: unique name
})

storeSchema.statics.getTagsList = function () {
    return this.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ])
}

module.exports = mongoose.model('Store', storeSchema)
