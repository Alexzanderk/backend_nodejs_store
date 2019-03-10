const express = require('express');
const router = express.Router();

const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', catchErrors(storeController.editStores));

router.get('/add', storeController.addSrote);
router.post(
    '/add',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore)
);
router.post(
    '/add/:id',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.updateStore)
);

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug))

module.exports = router;