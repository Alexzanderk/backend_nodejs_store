const express = require('express');
const router = express.Router();

const {
    storeController,
    userController,
    authController
} = require('../controllers');
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

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoreByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoreByTag));

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);
router.post(
    '/register',
    userController.validateRegister,
    userController.register,
    authController.login
);

module.exports = router;
