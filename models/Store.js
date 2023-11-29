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

},
    // readme note 1
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    })

// index: pre define some texts to query upon them faster
storeSchema.index({
    name: "text",
    description: "text"
})

// virtual
storeSchema.virtual('reviews', {
    ref: "Review", //what model to link
    localField: "_id", // which field on store model
    foreignField: "store" // which field on review model
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

storeSchema.statics.getTopStores = function () {
    return this.aggregate([
        // lookup stores and populate their reviews
        { $lookup: { from: "reviews", localField: "_id", foreignField: "store", as: "reviews" } },
        // only items that have 2 or more reviews
        { $match: { 'reviews.1': { $exists: true } } },
        // add a new field to see the average rating 
        { $addFields: { averageRating: { $avg: "$reviews.rating" } } },
        //sort it based on avg rating
        { $sort: { averageRating: -1 } },
        //limit to 10
        { $limit: 10 }
    ])
}

module.exports = mongoose.model('Store', storeSchema)
