const { initializeDatabase, orders, couriers } = require('../utils/database');
const { createOrder } = require('../services/orderService');
const { startAutoSimulation, stopSimulation } = require('../services/simulationService');

initializeDatabase();

// Pick a courier and create an order near them so assignment occurs
const sampleCourier = Array.from(couriers.values())[0];
const pickup = { x: sampleCourier.location.x + 3, y: sampleCourier.location.y + 1 };
const drop = { x: sampleCourier.location.x + 20, y: sampleCourier.location.y + 10 };

console.log('Starting demo simulation');
console.log('Sample courier:', sampleCourier.id, sampleCourier.location);

const result = createOrder({
  pickupLocation: pickup,
  dropLocation: drop,
  deliveryType: 'Normal',
  packageDetails: { weight: 1 }
});

const order = result.order;
console.log('Created order:', order.id, 'initial state:', order.state, 'courierId:', order.courierId);

if (!order.courierId) {
  console.log('Order was not assigned; demo requires an assigned courier');
  process.exit(0);
}

const simId = startAutoSimulation(order.id, 1000);
console.log('Started simulation:', simId);

const interval = setInterval(() => {
  const o = orders.get(order.id);
  const c = couriers.get(o.courierId);
  console.log(`State: ${o.state} | Courier: ${c.id} loc=(${c.location.x},${c.location.y})`);
  if (o.state === 'DELIVERED' || o.state === 'CANCELLED') {
    console.log('Order completed:', o.state);
    clearInterval(interval);
    stopSimulation(simId);
    process.exit(0);
  }
}, 1000);
