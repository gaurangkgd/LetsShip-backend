// In-memory storage
const orders = new Map();
const couriers = new Map();

/**
 * Initialize the database with sample couriers
 */
function initializeDatabase() {
  // Clear existing data
  couriers.clear();
  orders.clear();

  // Seed 10 sample couriers with random locations
  for (let i = 1; i <= 10; i++) {
    const courierId = `courier-${i}`;
    const courier = {
      id: courierId,
      name: `Courier-${i}`,
      location: {
        x: Math.floor(Math.random() * 101), // 0-100
        y: Math.floor(Math.random() * 101), // 0-100
      },
      isAvailable: true,
      currentOrderId: null,
    };
    couriers.set(courierId, courier);
  }

  console.log('Database initialized with 10 sample couriers');
}

module.exports = {
  orders,
  couriers,
  initializeDatabase,
};
