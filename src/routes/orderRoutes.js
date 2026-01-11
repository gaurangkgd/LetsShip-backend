const express = require('express');
const router = express.Router();

const {
  createOrderHandler,
  getAllOrdersHandler,
  getOrderHandler,
  updateOrderStateHandler,
} = require('../controllers/orderController');

router.post('/', createOrderHandler);
router.get('/', getAllOrdersHandler);
router.get('/:id', getOrderHandler);
router.patch('/:id/state', updateOrderStateHandler);

module.exports = router;
