const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController')
const telegramController = require('../controllers/telegramController')
const { catchErrors } = require('../handlers/errorHandlers')
// Do work here
router.get('/', storeController.homePage);
router.get('/add', storeController.addPage);
router.post('/add', catchErrors(storeController.createStore));
router.post(`/webhook/${process.env.TOKEN}`, async (req, res) => {
    console.log('====================================');
    console.log(req.body);
    console.log('====================================');
    res.send()
})
module.exports = router;
