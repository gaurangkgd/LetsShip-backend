const { orders, couriers } = require('../utils/database');
const calculateDistance = require('../utils/distance');
const { updateOrderState } = require('./orderService');
const { updateCourierLocation, getCourierById } = require('./courierService');

// Active simulations: simulationId -> { orderId, timer }
const simulations = new Map();

function _moveTowards(current, target, maxStep = 2) {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  // Move up to maxStep distributed across x/y (simple heuristic)
  const stepX = Math.sign(dx) * Math.min(Math.abs(dx), Math.ceil(maxStep / 2));
  const stepY = Math.sign(dy) * Math.min(Math.abs(dy), Math.floor(maxStep / 2));
  return { x: current.x + stepX, y: current.y + stepY };
}

/**
 * Simulate one tick of delivery progress for an order.
 * Moves courier toward pickup/drop and advances order state when thresholds reached.
 */
function simulateDelivery(orderId) {
  const order = orders.get(orderId);
  if (!order) throw new Error('Order not found');

  const courierId = order.courierId;
  const courier = courierId ? couriers.get(courierId) : null;

  if (!courier) {
    // Nothing to simulate if no courier assigned
    return { order, courier: null };
  }

  const state = order.state;

  if (state === 'ASSIGNED') {
    // Move towards pickup
    const target = order.pickupLocation;
    const newLoc = _moveTowards(courier.location, target, 2);
    updateCourierLocation(courier.id, newLoc);

    const dist = calculateDistance(newLoc, target);
    if (dist <= 1) {
      // Reached pickup
      updateOrderState(orderId, 'PICKED_UP');
    }
  } else if (state === 'PICKED_UP') {
    // Immediately transition to IN_TRANSIT; courier will start moving next tick
    updateOrderState(orderId, 'IN_TRANSIT');
  } else if (state === 'IN_TRANSIT') {
    // Move towards drop-off
    const target = order.dropLocation;
    const newLoc = _moveTowards(courier.location, target, 2);
    updateCourierLocation(courier.id, newLoc);

    const dist = calculateDistance(newLoc, target);
    if (dist <= 1) {
      // Reached destination
      updateOrderState(orderId, 'DELIVERED');
    }
  }

  // Return latest snapshots
  return { order: orders.get(orderId), courier: couriers.get(courierId) };
}

/**
 * Start auto simulation for an order. Returns a simulation id.
 */
function startAutoSimulation(orderId, intervalMs = 2000) {
  // Prevent duplicate simulations for same order
  for (const [id, s] of simulations.entries()) {
    if (s.orderId === orderId) return id;
  }

  const simId = `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const timer = setInterval(() => {
    try {
      const result = simulateDelivery(orderId);
      const ord = result.order;
      if (!ord) return;
      if (ord.state === 'DELIVERED' || ord.state === 'CANCELLED') {
        // Stop simulation when order completes
        stopSimulation(simId);
      }
    } catch (e) {
      // Stop on errors
      stopSimulation(simId);
    }
  }, intervalMs);

  simulations.set(simId, { orderId, timer });
  return simId;
}

function stopSimulation(simId) {
  const entry = simulations.get(simId);
  if (!entry) return false;
  clearInterval(entry.timer);
  simulations.delete(simId);
  return true;
}

module.exports = {
  simulateDelivery,
  startAutoSimulation,
  stopSimulation,
};
