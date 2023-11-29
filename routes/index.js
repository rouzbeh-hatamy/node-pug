const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController')
const userController = require('../controllers/userController')
const telegramController = require('../controllers/telegramController')
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')
const { catchErrors } = require('../handlers/errorHandlers')
// Do work here

// stores page
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/stores/:id/edit', authController.isLoggedIn, catchErrors(storeController.editStore));
router.get('/add',
    authController.isLoggedIn,
    storeController.addPage);

//tags page
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));
router.get('/bot/register', telegramController.registerBot);

router.post('/add',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore));

router.post('/add/:id',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.updateStore));

router.get('/getCommands', telegramController.getCommands)
router.get('/login', userController.loginForm)
router.post('/login', authController.login)


router.get('/register', userController.registerForm)
router.post('/register',
    userController.validateRegister,
    userController.register,
    authController.login)

router.get('/logout', authController.logout)

router.get('/account', authController.isLoggedIn, userController.account)
router.post('/account', authController.isLoggedIn, catchErrors(userController.updateAccount))
router.post('/account/forgot', catchErrors(authController.forgotPassword))
router.get('/account/reset/:token', catchErrors(authController.resetPassword))
router.post('/account/reset/:token', authController.confirmPasswords, catchErrors(authController.setNewPassword))
router.post('/review/:id', authController.isLoggedIn, catchErrors(reviewController.addReview))
router.get('/top',catchErrors(storeController.getTopStores))


// API Endpoints

router.get('/api/search', catchErrors(storeController.searchStores))

module.exports = router;
