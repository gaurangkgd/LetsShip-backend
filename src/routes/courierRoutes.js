const express = require('express');
const router = express.Router();

const {
  getAllCouriersHandler,
  getCourierHandler,
  updateCourierLocationHandler,
} = require('../controllers/courierController');

router.get('/', getAllCouriersHandler);
router.get('/:id', getCourierHandler);
router.patch('/:id/location', updateCourierLocationHandler);

module.exports = router;
