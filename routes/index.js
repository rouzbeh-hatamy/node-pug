const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController')
const telegramController = require('../controllers/telegramController')
const { catchErrors } = require('../handlers/errorHandlers')
// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', (storeController.editStore));
router.get('/add', storeController.addPage);
router.get('/bot/register', telegramController.registerBot);
router.post('/add', catchErrors(storeController.createStore));
router.post('/add/:id', catchErrors(storeController.updateStore));
router.get('/getCommands', telegramController.getCommands)
module.exports = router;
