const { orders } = require('../utils/database');
const Order = require('../models/Order');
const {
  validateLocation,
  validateDeliveryType,
  validateStateTransition,
} = require('../utils/validators');
const {
  findNearestAvailableCourier,
  assignCourierToOrder,
  releaseCourier,
} = require('./courierService');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new order with auto-assignment
 * @param {Object} orderData - Order data including pickup, drop, delivery type, package/vehicle details
 * @returns {Object} Object containing order, optional courier, and message
 */
function createOrder(orderData) {
  const {
    pickupLocation,
    dropLocation,
    deliveryType,
    packageDetails,
    vehicleDetails,
  } = orderData;

  // Validate pickup location
  const pickupValidation = validateLocation(pickupLocation);
  if (!pickupValidation.isValid) {
    throw new Error(`Invalid pickup location: ${pickupValidation.error}`);
  }

  // Validate drop location
  const dropValidation = validateLocation(dropLocation);
  if (!dropValidation.isValid) {
    throw new Error(`Invalid drop location: ${dropValidation.error}`);
  }

  // Validate delivery type
  const deliveryTypeValidation = validateDeliveryType(deliveryType);
  if (!deliveryTypeValidation.isValid) {
    throw new Error(`Invalid delivery type: ${deliveryTypeValidation.error}`);
  }

  // Validate that either packageDetails or vehicleDetails is provided
  if (!packageDetails && !vehicleDetails) {
    throw new Error('Either packageDetails or vehicleDetails must be provided');
  }

  // Create new Order instance
  const orderId = uuidv4();
  const order = new Order({
    id: orderId,
    pickupLocation,
    dropLocation,
    deliveryType,
    packageDetails: packageDetails || '',
    vehicleDetails: vehicleDetails || '',
    state: 'CREATED',
    courierId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Find nearest available courier (respects Express delivery 15-unit distance constraint)
  const courier = findNearestAvailableCourier(pickupLocation, deliveryType);

  if (!courier) {
    // No courier available - save order as unassigned
    orders.set(orderId, order);
    return {
      order,
      message: 'No courier available. Order created but unassigned.',
    };
  }

  try {
    // Assign courier to order (uses lock to prevent race conditions)
    assignCourierToOrder(courier.id, orderId);

    // Update order state to ASSIGNED
    order.state = 'ASSIGNED';
    order.courierId = courier.id;
    order.updatedAt = new Date();

    // Save order to orders Map
    orders.set(orderId, order);

    return {
      order,
      courier,
      message: 'Order created and assigned successfully',
    };
  } catch (error) {
    // If assignment fails, save order as unassigned
    orders.set(orderId, order);
    return {
      order,
      message: `Order created but assignment failed: ${error.message}`,
    };
  }
}

/**
 * Update order state with validation
 * @param {string} orderId - Order ID
 * @param {string} newState - New state to transition to
 * @returns {Object} Updated order
 */
function updateOrderState(orderId, newState) {
  // Get order from Map
  const order = orders.get(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  // Validate state transition
  const transitionValidation = validateStateTransition(order.state, newState);

  if (!transitionValidation.isValid) {
    throw new Error(transitionValidation.error);
  }

  // Release courier when order reaches terminal state (DELIVERED/CANCELLED)
  // This makes the courier available for new assignments
  if ((newState === 'DELIVERED' || newState === 'CANCELLED') && order.courierId) {
    try {
      releaseCourier(order.courierId);
    } catch (error) {
      console.error(`Failed to release courier ${order.courierId}:`, error.message);
    }
  }

  // Update order state
  order.state = newState;
  order.updatedAt = new Date();

  return order;
}

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Object|null} Order or null if not found
 */
function getOrderById(orderId) {
  return orders.get(orderId) || null;
}

/**
 * Get all orders
 * @returns {Array} Array of all orders
 */
function getAllOrders() {
  return Array.from(orders.values());
}

/**
 * Get orders by courier ID
 * @param {string} courierId - Courier ID
 * @returns {Array} Array of orders assigned to the courier
 */
function getOrdersByCourier(courierId) {
  return Array.from(orders.values()).filter(
    (order) => order.courierId === courierId
  );
}

module.exports = {
  createOrder,
  updateOrderState,
  getOrderById,
  getAllOrders,
  getOrdersByCourier,
};
