const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController')
const { catchErrors } = require('../handlers/errorHandlers')

// Do work here
router.get('/', storeController.myMiddleware, storeController.homePage);
router.get('/add', storeController.addPage);
router.post('/add', catchErrors(storeController.createStore));

module.exports = router;
