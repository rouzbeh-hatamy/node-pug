const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController')
const telegramController = require('../controllers/telegramController')
const { catchErrors } = require('../handlers/errorHandlers')
// Do work here
router.get('/', telegramController.registerWebhook, storeController.homePage);
router.get('/add', storeController.addPage);
router.post('/add', catchErrors(storeController.createStore));
router.post(`/webhook/6302617382:AAEsP8Y9YK59uLV-26Mfv3o1YT1pv81rTaA`, async (req, res) => {
    console.log('====================================');
    console.log(req.body);
    console.log('====================================');  
    res.send()
})
module.exports = router;
