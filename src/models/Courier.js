class Courier {
  constructor(id, name, location = { x: 0, y: 0 }) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.isAvailable = true;
    this.currentOrderId = null;
  }

  markAsUnavailable(orderId) {
    this.isAvailable = false;
    this.currentOrderId = orderId;
  }

  markAsAvailable() {
    this.isAvailable = true;
    this.currentOrderId = null;
  }
}

module.exports = Courier;
