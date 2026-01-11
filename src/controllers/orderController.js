const {
  createOrder,
  updateOrderState,
  getOrderById,
  getAllOrders,
} = require('../services/orderService');
const {
  validateLocation,
  sanitizeDeliveryType,
  sanitizeString,
} = require('../utils/validators');

function createOrderHandler(req, res) {
  try {
    // Sanitize inputs
    const pickupLocation = req.body.pickupLocation;
    const dropLocation = req.body.dropLocation;
    const deliveryType = sanitizeDeliveryType(req.body.deliveryType);
    const packageDetails = sanitizeString(req.body.packageDetails);
    const vehicleDetails = sanitizeString(req.body.vehicleDetails);

    if (!pickupLocation || !dropLocation || !deliveryType) {
      return res.status(400).json({ success: false, error: 'pickupLocation, dropLocation and deliveryType are required' });
    }

    // Validate locations
    const pickVal = validateLocation(pickupLocation);
    if (!pickVal.isValid) return res.status(400).json({ success: false, error: `Invalid pickup location: ${pickVal.error}` });
    const dropVal = validateLocation(dropLocation);
    if (!dropVal.isValid) return res.status(400).json({ success: false, error: `Invalid drop location: ${dropVal.error}` });

    const result = createOrder({ pickupLocation, dropLocation, deliveryType, packageDetails, vehicleDetails });

    return res.status(201).json({ success: true, data: { order: result.order, courier: result.courier || null }, message: result.message });
  } catch (err) {
    if (err.message && err.message.startsWith('Invalid')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

function getOrderHandler(req, res) {
  try {
    const orderId = req.params.id;
    const order = getOrderById(orderId);

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    return res.status(200).json({ success: true, data: { order } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

function getAllOrdersHandler(req, res) {
  try {
    const orders = getAllOrders();
    return res.status(200).json({ success: true, data: { orders } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

function updateOrderStateHandler(req, res) {
  try {
    const orderId = req.params.id;
    const { state: newState } = req.body;

    if (!newState) return res.status(400).json({ success: false, error: 'New state is required' });

    try {
      const updated = updateOrderState(orderId, newState);
      return res.status(200).json({ success: true, data: { order: updated } });
    } catch (e) {
      // Handle state transition and business logic errors
      if (e.message && (e.message.startsWith('Invalid') || e.message.includes('transition') || e.message.includes('not found'))) {
        if (e.message === 'Order not found') return res.status(404).json({ success: false, error: e.message });
        return res.status(400).json({ success: false, error: e.message });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = {
  createOrderHandler,
  getOrderHandler,
  getAllOrdersHandler,
  updateOrderStateHandler,
};

