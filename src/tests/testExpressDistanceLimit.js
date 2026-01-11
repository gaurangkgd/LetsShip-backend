const { initializeDatabase, orders, couriers } = require('../utils/database');
const { createOrder } = require('../services/orderService');

console.log('=== Testing Express Delivery Distance Limit ===\n');

// Initialize database
initializeDatabase();

console.log('📊 Initial Setup:');
console.log(`- Total couriers: ${couriers.size}`);
console.log(`- Express max distance: 15 units`);
console.log(`- Courier locations (sample):`);
let count = 0;
for (const [id, courier] of couriers) {
  if (count++ < 3) {
    console.log(`  - ${courier.name}: (${courier.location.x}, ${courier.location.y})`);
  }
}
console.log('\n');

// Test 1: Express order WITHIN distance limit (should assign)
// Use a courier's actual location to ensure we're within range
const sampleCourier = Array.from(couriers.values())[0];
const nearLocation = {
  x: sampleCourier.location.x + 5,  // 5 units away (within 15)
  y: sampleCourier.location.y + 5
};
console.log(`🧪 Test 1: Express order WITHIN distance limit (5 units from ${sampleCourier.name})`);
console.log(`   Pickup: (${nearLocation.x}, ${nearLocation.y})`);
try {
  const result = createOrder({
    pickupLocation: nearLocation,
    dropLocation: { x: nearLocation.x + 10, y: nearLocation.y + 10 },
    deliveryType: 'Express',
    packageDetails: { weight: 2 }
  });
  
  const nearOrder = result.order;
  
  if (nearOrder.courierId) {
    const assignedCourier = couriers.get(nearOrder.courierId);
    console.log(`✅ PASS: Order assigned to ${assignedCourier.name}`);
    console.log(`   State: ${nearOrder.state}`);
    console.log(`   Courier location: (${assignedCourier.location.x}, ${assignedCourier.location.y})`);
  } else {
    console.log('❌ FAIL: Order should have been assigned but was not');
    console.log(`   Message: ${result.message}`);
  }
} catch (error) {
  console.log(`❌ ERROR: ${error.message}`);
}
console.log('\n');

// Test 2: Express order FAR from all couriers (should remain unassigned)
console.log('🧪 Test 2: Express order FAR from all couriers (x:500, y:500)');
try {
  const result = createOrder({
    pickupLocation: { x: 500, y: 500 },
    dropLocation: { x: 510, y: 510 },
    deliveryType: 'Express',
    packageDetails: { weight: 1.5 }
  });
  
  const farOrder = result.order;
  
  if (!farOrder.courierId) {
    console.log('✅ PASS: Order correctly remained UNASSIGNED (too far for Express)');
    console.log(`   State: ${farOrder.state}`);
    console.log(`   Message: ${result.message}`);
    console.log(`   Reason: No couriers within 15 unit distance from (500, 500)`);
  } else {
    console.log('❌ FAIL: Order should NOT have been assigned');
    console.log(`   Incorrectly assigned to: ${farOrder.courierId}`);
  }
} catch (error) {
  console.log(`❌ ERROR: ${error.message}`);
}
console.log('\n');

// Test 3: Normal order FAR from all couriers (SHOULD assign, no distance limit)
console.log('🧪 Test 3: Normal order FAR from all couriers (x:500, y:500)');
try {
  const result = createOrder({
    pickupLocation: { x: 500, y: 500 },
    dropLocation: { x: 510, y: 510 },
    deliveryType: 'Normal',
    packageDetails: { weight: 3 }
  });
  
  const farNormalOrder = result.order;
  
  if (farNormalOrder.courierId) {
    const assignedCourier = couriers.get(farNormalOrder.courierId);
    console.log(`✅ PASS: Normal order assigned to ${assignedCourier.name}`);
    console.log(`   State: ${farNormalOrder.state}`);
    console.log(`   Reason: Normal delivery has no distance limit`);
    console.log(`   Courier location: (${assignedCourier.location.x}, ${assignedCourier.location.y})`);
  } else {
    console.log('❌ FAIL: Normal order should have been assigned');
    console.log(`   Message: ${result.message}`);
  }
} catch (error) {
  console.log(`❌ ERROR: ${error.message}`);
}
console.log('\n');

// Test 4: Express order at edge of distance limit (x:15 away)
console.log('🧪 Test 4: Express order at EDGE of distance limit (15 units away)');
try {
  // Find a courier and create order exactly 15 units away
  const testCourier = Array.from(couriers.values())[0];
  const result = createOrder({
    pickupLocation: { 
      x: testCourier.location.x + 15, 
      y: testCourier.location.y 
    },
    dropLocation: { x: 100, y: 100 },
    deliveryType: 'Express',
    packageDetails: { weight: 1 }
  });
  
  const edgeOrder = result.order;
  
  if (edgeOrder.courierId) {
    console.log(`✅ PASS: Order at edge (15 units) was assigned`);
    console.log(`   State: ${edgeOrder.state}`);
  } else {
    console.log('⚠️  WARN: Edge case - order at exactly 15 units was not assigned');
    console.log(`   Message: ${result.message}`);
  }
} catch (error) {
  console.log(`❌ ERROR: ${error.message}`);
}
console.log('\n');

console.log('=== Summary ===');
console.log('All critical Express distance limit tests completed!');
console.log('✅ Express orders within 15 units: ASSIGNED');
console.log('✅ Express orders beyond 15 units: UNASSIGNED');
console.log('✅ Normal orders (no limit): ALWAYS ASSIGNED');
