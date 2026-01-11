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

  // Validate reasonable coordinate ranges to guard against invalid input
  const MIN_COORD = -10000;
  const MAX_COORD = 10000;
  if (!Number.isFinite(location.x) || !Number.isFinite(location.y)) {
    return { isValid: false, error: 'Location coordinates must be finite numbers' };
  }
  if (location.x < MIN_COORD || location.x > MAX_COORD || location.y < MIN_COORD || location.y > MAX_COORD) {
    return { isValid: false, error: `Location coordinates must be between ${MIN_COORD} and ${MAX_COORD}` };
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
 * Sanitize delivery type string input. Accepts case-insensitive values and trims whitespace.
 * Returns normalized type ("Express" or "Normal") or null if input is invalid.
 */
function sanitizeDeliveryType(input) {
  if (typeof input !== 'string') return null;
  const s = input.trim().toLowerCase();
  if (s === 'express') return 'Express';
  if (s === 'normal') return 'Normal';
  return null;
}

/**
 * Trim and coerce string values. Returns cleaned string or the original value for non-strings.
 */
function sanitizeString(v) {
  if (typeof v !== 'string') return v;
  return v.trim();
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
  sanitizeDeliveryType,
  sanitizeString,
};
