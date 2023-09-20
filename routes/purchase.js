const path = require('path');

const express = require('express');

const purchaseController = require('../controllers/purchase');

const userauthentication = require('../middleware/auth')

const router = express.Router();

// Get expenses => GET
router.get('/premium-membership', userauthentication.authenticate, purchaseController.getPurchasePremium);

// Add expense => POST
router.post('/updatetransactionstatus', userauthentication.authenticate, purchaseController.postUpdateTransactionStatus);


module.exports = router;