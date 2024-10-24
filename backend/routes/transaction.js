const express = require('express');
const router = express.Router();
const {ROLE} = require("../config/constant")

const AuthMiddleware = require('../middlewares/Authentication');
const TransactionController = require('../controllers/TransactionController')


router.get('/binance_whale_txs', AuthMiddleware(ROLE.FREE), TransactionController.getWhaleTxs);

module.exports = router;