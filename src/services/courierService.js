const { couriers } = require('../utils/database');
const calculateDistance = require('../utils/distance');

// Constants
const EXPRESS_MAX_DISTANCE = 15;
const assignmentLock = new Set();

/**
 * Find the nearest available courier for an order
 * @param {Object} pickupLocation - Location with x and y coordinates
 * @param {string} deliveryType - 'Express' or 'Normal'
 * @returns {Object|null} Nearest available courier or null
 */
function findNearestAvailableCourier(pickupLocation, deliveryType) {
  // Get all available couriers
  const availableCouriers = Array.from(couriers.values()).filter(
    (courier) => courier.isAvailable
  );

  if (availableCouriers.length === 0) {
    return null;
  }

  // Calculate distances and filter for Express delivery
  const couriersWithDistance = availableCouriers.map((courier) => ({
    ...courier,
    distance: calculateDistance(courier.location, pickupLocation),
  }));

  // For Express delivery, filter couriers within EXPRESS_MAX_DISTANCE
  let eligibleCouriers = couriersWithDistance;
  if (deliveryType === 'Express') {
    // Allow a tiny epsilon to account for potential floating point rounding
    const EPS = Number.EPSILON * 100; // small tolerance
    eligibleCouriers = couriersWithDistance.filter(
      (courier) => courier.distance <= (EXPRESS_MAX_DISTANCE + EPS)
    );
  }

  if (eligibleCouriers.length === 0) {
    return null;
  }

  // Sort by distance (ascending) and return the nearest
  eligibleCouriers.sort((a, b) => a.distance - b.distance);
  return eligibleCouriers[0];
}

/**
 * Assign a courier to an order (with race condition prevention)
 * @param {string} courierId - The courier's ID
 * @param {string} orderId - The order's ID
 * @returns {Object} The assigned courier
 * @throws {Error} If courier is being assigned or not available
 */
function assignCourierToOrder(courierId, orderId) {
  // Check if courier is currently being assigned
  if (assignmentLock.has(courierId)) {
    throw new Error('Courier is currently being assigned');
  }

  // Add courier to assignment lock
  assignmentLock.add(courierId);

  try {
    // Get courier from Map
    const courier = couriers.get(courierId);

    if (!courier) {
      assignmentLock.delete(courierId);
      throw new Error('Courier not found');
    }

    // Check if courier is available
    if (!courier.isAvailable) {
      assignmentLock.delete(courierId);
      throw new Error('Courier is not available');
    }

    // Mark courier as unavailable with the orderId
    courier.isAvailable = false;
    courier.currentOrderId = orderId;

    // Release lock after 100ms to prevent deadlock while simulating atomic operation
    setTimeout(() => {
      assignmentLock.delete(courierId);
    }, 100);

    return courier;
  } catch (error) {
    // Ensure lock is removed on error
    assignmentLock.delete(courierId);
    throw error;
  }
}

/**
 * Release a courier (mark as available)
 * @param {string} courierId - The courier's ID
 * @returns {boolean} True if successful
 */
function releaseCourier(courierId) {
  const courier = couriers.get(courierId);

  if (!courier) {
    throw new Error('Courier not found');
  }

  courier.isAvailable = true;
  courier.currentOrderId = null;

  return true;
}

/**
 * Update courier's location
 * @param {string} courierId - The courier's ID
 * @param {Object} newLocation - New location with x and y coordinates
 * @returns {Object} Updated courier
 */
function updateCourierLocation(courierId, newLocation) {
  const courier = couriers.get(courierId);

  if (!courier) {
    throw new Error('Courier not found');
  }

  courier.location = newLocation;

  return courier;
}

/**
 * Get all couriers
 * @returns {Array} Array of all couriers
 */
function getAllCouriers() {
  return Array.from(couriers.values());
}

/**
 * Get courier by ID
 * @param {string} courierId - The courier's ID
 * @returns {Object|null} Courier object or null if not found
 */
function getCourierById(courierId) {
  return couriers.get(courierId) || null;
}

module.exports = {
  findNearestAvailableCourier,
  assignCourierToOrder,
  releaseCourier,
  updateCourierLocation,
  getAllCouriers,
  getCourierById,
  EXPRESS_MAX_DISTANCE,
};

