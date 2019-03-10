// import mongoose, { Schema, Model } from 'mongoose';
// import slug from 'slugs';
const mongoose = require('mongoose');
const slug = require('slugs');

mongoose.Promise = global.Promise;

const storeSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name!'
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
            default: 'Point'
        },
        coordinates: [
            { type: Number, required: 'You must supply coordinates!' }
        ],
        address: {
            type: String,
            required: 'You must suply an address!'
        }
    },
    photo: String
});

storeSchema.pre('save', function(next) {
    if (!this.isModified('name')) {
        return next();
    }

    this.slug = slug(this.name);
    next();
});

module.exports = mongoose.model('Store', storeSchema);