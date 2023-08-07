const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController')
const userController = require('../controllers/userController')
const telegramController = require('../controllers/telegramController')
const { catchErrors } = require('../handlers/errorHandlers')
// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/stores/:id/edit', (storeController.editStore));
router.get('/add', storeController.addPage);
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
module.exports = router;
