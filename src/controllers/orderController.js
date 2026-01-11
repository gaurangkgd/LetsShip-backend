const {
  createOrder,
  updateOrderState,
  getOrderById,
  getAllOrders,
} = require('../services/orderService');

function createOrderHandler(req, res) {
  try {
    const { pickupLocation, dropLocation, deliveryType, packageDetails, vehicleDetails } = req.body;

    if (!pickupLocation || !dropLocation || !deliveryType) {
      return res.status(400).json({ error: 'pickupLocation, dropLocation and deliveryType are required' });
    }

    const result = createOrder({ pickupLocation, dropLocation, deliveryType, packageDetails, vehicleDetails });
    return res.status(201).json({ message: result.message, order: result.order, courier: result.courier || null });
  } catch (err) {
    if (err.message && err.message.startsWith('Invalid')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function getOrderHandler(req, res) {
  try {
    const orderId = req.params.id;
    const order = getOrderById(orderId);

    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.status(200).json({ order });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function getAllOrdersHandler(req, res) {
  try {
    const orders = getAllOrders();
    return res.status(200).json({ orders });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function updateOrderStateHandler(req, res) {
  try {
    const orderId = req.params.id;
    const { state: newState } = req.body;

    if (!newState) return res.status(400).json({ error: 'New state is required' });

    try {
      const updated = updateOrderState(orderId, newState);
      return res.status(200).json({ order: updated });
    } catch (e) {
      // Handle state transition and business logic errors
      if (e.message && (e.message.startsWith('Invalid') || e.message.includes('transition') || e.message.includes('not found'))) {
        if (e.message === 'Order not found') return res.status(404).json({ error: e.message });
        return res.status(400).json({ error: e.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createOrderHandler,
  getOrderHandler,
  getAllOrdersHandler,
  updateOrderStateHandler,
};

