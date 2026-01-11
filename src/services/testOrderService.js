const { initializeDatabase } = require('../utils/database');
const {
  createOrder,
  updateOrderState,
  getOrderById,
  getAllOrders,
} = require('./orderService');
const { getCourierById } = require('./courierService');

// Initialize database
initializeDatabase();

console.log('=== ORDER SERVICE TESTS ===\n');

// Test 1: Create Normal delivery order
console.log('Test 1: Create Normal delivery order');
const order1Result = createOrder({
  pickupLocation: { x: 12, y: 22 },
  dropLocation: { x: 50, y: 60 },
  deliveryType: 'Normal',
  packageDetails: 'Books - 2kg',
});
console.log('Result:', order1Result.message);
console.log('Order ID:', order1Result.order.id);
console.log('State:', order1Result.order.state);
console.log('Courier ID:', order1Result.order.courierId);
if (order1Result.courier) {
  console.log('Assigned Courier:', order1Result.courier.name);
}
console.log();

// Test 2: Create Express delivery order (should assign if within distance)
console.log('Test 2: Create Express delivery order (near pickup)');
const order2Result = createOrder({
  pickupLocation: { x: 11, y: 21 },
  dropLocation: { x: 30, y: 40 },
  deliveryType: 'Express',
  packageDetails: 'Documents - urgent',
});
console.log('Result:', order2Result.message);
console.log('Order ID:', order2Result.order.id);
console.log('State:', order2Result.order.state);
console.log('Courier ID:', order2Result.order.courierId);
if (order2Result.courier) {
  console.log('Assigned Courier:', order2Result.courier.name);
  console.log('Distance:', order2Result.courier.distance);
}
console.log();

// Test 3: Create Express delivery order far away (should fail assignment)
console.log('Test 3: Create Express delivery order (far pickup - should fail)');
const order3Result = createOrder({
  pickupLocation: { x: 90, y: 90 },
  dropLocation: { x: 95, y: 95 },
  deliveryType: 'Express',
  packageDetails: 'Medicine',
});
console.log('Result:', order3Result.message);
console.log('Order ID:', order3Result.order.id);
console.log('State:', order3Result.order.state);
console.log('Courier ID:', order3Result.order.courierId);
console.log();

// Test 4: Update order state (valid transition)
console.log('Test 4: Update order state (valid transition ASSIGNED → PICKED_UP)');
if (order1Result.order.state === 'ASSIGNED') {
  try {
    const updatedOrder = updateOrderState(order1Result.order.id, 'PICKED_UP');
    console.log('Success! New state:', updatedOrder.state);
  } catch (error) {
    console.log('Error:', error.message);
  }
} else {
  console.log('Order not assigned, skipping test');
}
console.log();

// Test 5: Update order state (invalid transition)
console.log('Test 5: Update order state (invalid transition PICKED_UP → DELIVERED)');
if (order1Result.order.state === 'ASSIGNED') {
  try {
    const updatedOrder = updateOrderState(order1Result.order.id, 'DELIVERED');
    console.log('Unexpected success! State:', updatedOrder.state);
  } catch (error) {
    console.log('Expected error:', error.message);
  }
} else {
  console.log('Order not in correct state, skipping test');
}
console.log();

// Test 6: Complete order lifecycle
console.log('Test 6: Complete order lifecycle (PICKED_UP → IN_TRANSIT → DELIVERED)');
if (order1Result.order.courierId) {
  try {
    console.log('Current state:', getOrderById(order1Result.order.id).state);
    
    // PICKED_UP → IN_TRANSIT
    let updated = updateOrderState(order1Result.order.id, 'IN_TRANSIT');
    console.log('After IN_TRANSIT:', updated.state);
    
    // IN_TRANSIT → DELIVERED
    updated = updateOrderState(order1Result.order.id, 'DELIVERED');
    console.log('After DELIVERED:', updated.state);
    
    // Check if courier is released
    const courier = getCourierById(order1Result.order.courierId);
    console.log('Courier available after delivery:', courier.isAvailable);
    console.log('Courier current order:', courier.currentOrderId);
  } catch (error) {
    console.log('Error:', error.message);
  }
} else {
  console.log('Order has no courier, skipping lifecycle test');
}
console.log();

// Test 7: Show all orders
console.log('Test 7: All orders summary');
const allOrders = getAllOrders();
console.log(`Total orders: ${allOrders.length}`);
allOrders.forEach((order, index) => {
  console.log(`${index + 1}. Order ${order.id.substring(0, 8)}... - State: ${order.state}, Courier: ${order.courierId || 'None'}`);
});

console.log('\n=== ALL TESTS COMPLETED ===');
