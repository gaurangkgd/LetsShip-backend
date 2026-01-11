class Order {
  constructor({
    id,
    pickupLocation = { x: 0, y: 0 },
    dropLocation = { x: 0, y: 0 },
    deliveryType = 'Normal',
    packageDetails = '',
    vehicleDetails = '',
    state = 'CREATED',
    courierId = null,
    createdAt = new Date(),
    updatedAt = new Date(),
  } = {}) {
    this.id = id;
    this.pickupLocation = pickupLocation;
    this.dropLocation = dropLocation;
    this.deliveryType = deliveryType;
    this.packageDetails = packageDetails;
    this.vehicleDetails = vehicleDetails;
    this.state = state;
    this.courierId = courierId;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  updateState(newState) {
    const validStates = [
      'CREATED',
      'ASSIGNED',
      'PICKED_UP',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStates.includes(newState)) {
      throw new Error(`Invalid state: ${newState}`);
    }

    this.state = newState;
    this.updatedAt = new Date();
  }
}

module.exports = Order;

