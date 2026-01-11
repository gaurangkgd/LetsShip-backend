/**
 * Validate if location object has valid x and y coordinates (numbers)
 */
function validateLocation(location) {
  if (!location || typeof location !== 'object') {
    return { isValid: false, error: 'Location must be an object' };
  }

  if (typeof location.x !== 'number' || typeof location.y !== 'number') {
    return { isValid: false, error: 'Location must have x and y as numbers' };
  }

  return { isValid: true, error: null };
}

/**
 * Validate if delivery type is 'Express' or 'Normal'
 */
function validateDeliveryType(type) {
  const validTypes = ['Express', 'Normal'];

  if (!validTypes.includes(type)) {
    return {
      isValid: false,
      error: `Delivery type must be one of: ${validTypes.join(', ')}`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate if order state is one of the valid states
 */
function validateOrderState(state) {
  const validStates = [
    'CREATED',
    'ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED',
  ];

  if (!validStates.includes(state)) {
    return {
      isValid: false,
      error: `Order state must be one of: ${validStates.join(', ')}`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate state transitions based on state machine rules
 * Valid transitions:
 * CREATED → ASSIGNED, CANCELLED
 * ASSIGNED → PICKED_UP, CANCELLED
 * PICKED_UP → IN_TRANSIT, CANCELLED
 * IN_TRANSIT → DELIVERED, CANCELLED
 * DELIVERED → (terminal state)
 * CANCELLED → (terminal state)
 */
function validateStateTransition(currentState, newState) {
  const stateTransitions = {
    CREATED: ['ASSIGNED', 'CANCELLED'],
    ASSIGNED: ['PICKED_UP', 'CANCELLED'],
    PICKED_UP: ['IN_TRANSIT', 'CANCELLED'],
    IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  if (!stateTransitions.hasOwnProperty(currentState)) {
    return { isValid: false, error: `Invalid current state: ${currentState}` };
  }

  if (!stateTransitions[currentState].includes(newState)) {
    const allowedTransitions = stateTransitions[currentState];
    if (allowedTransitions.length === 0) {
      return {
        isValid: false,
        error: `Cannot transition from terminal state: ${currentState}`,
      };
    }
    return {
      isValid: false,
      error: `Invalid transition from ${currentState} to ${newState}. Allowed: ${allowedTransitions.join(', ')}`,
    };
  }

  return { isValid: true, error: null };
}

module.exports = {
  validateLocation,
  validateDeliveryType,
  validateOrderState,
  validateStateTransition,
};
