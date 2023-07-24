const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController')
const telegramController = require('../controllers/telegramController')
const { catchErrors } = require('../handlers/errorHandlers')
// Do work here
router.get('/', storeController.homePage);
router.get('/add', storeController.addPage);
router.get('/bot/register', telegramController.registerBot);
router.post('/add', catchErrors(storeController.createStore));
router.get('/getCommands', telegramController.getCommands)
module.exports = router;
