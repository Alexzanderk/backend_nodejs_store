const Store = require('../models/Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        } else {
            next({ message: "Thats filetype isn't allowed!" }, false);
        }
    }
};

const confirmOwner = (store, user) => {
    if (!store.author.equals(user._id)) {
        throw Error('You must own a store in order to edit it!');
    }
};

module.exports = {
    addSrote(req, res) {
        res.render('editStore', {
            title: 'Add Store!'
        });
    },

    upload: multer(multerOptions).single('photo'),

    async resize(req, res, next) {
        if (!req.file) {
            return next();
        }
        const extension = req.file.mimetype.split('/')[1];
        req.body.photo = `${uuid.v4()}.${extension}`;
        const photo = await jimp.read(req.file.buffer);
        await photo.resize(800, jimp.AUTO);
        await photo.write(`./public/uploads/${req.body.photo}`);
        next();
    },

    async createStore(req, res) {
        console.log(req.body);
        req.body.author = req.user._id;
        const store = await new Store(req.body).save();
        req.flash(
            'success',
            `Successful created ${store.name}. Care to leave a review?`
        );

        res.redirect(`/store/${store.slug}`);
    },

    async getStores(req, res) {
        const stores = await Store.find();
        res.render('stores', { title: 'Stores', stores });
    },

    async editStores(req, res) {
        const store = await Store.findOne({ _id: req.params.id });
        confirmOwner(store, req.user);
        res.render('editStore', { title: `Edit Store ${store.name}`, store });
    },

    async updateStore(req, res) {
        if (req.body.location) {
            req.body.location.type = 'Point';
        }

        const store = await Store.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).exec();

        req.flash('success', 'Updeated!');
        res.redirect(`/stores/${store._id}/edit`);
    },

    async getStoreBySlug(req, res, next) {
        let store = await Store.findOne({ slug: req.params.slug }).populate(
            'author'
        );
        if (!store) return next();
        res.render('store', { store, tittle: store.name });
    },

    async getStoreByTag(req, res) {
        const tag = req.params.tag;
        const tagQuery = tag || { $exists: true };
        const tagsPromise = Store.getTagsList();
        const storesPromise = Store.find({ tags: tagQuery });
        const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

        res.render('tags', { tags, title: 'Tags', tag, stores });
    },

    async searchStore(req, res) {
        const store = await Store
            // first find stores that match
            .find(
                {
                    $text: {
                        $search: req.query.q
                    }
                },
                {
                    score: { $meta: 'textScore' }
                }
            )
            // the sort them
            .sort({
                score: { $meta: 'textScore' }
            })
            // limit to only 5 results
            .limit(5);
        res.json(store);
    }
};
