import { checkCustomerHasCompletedOrders } from '../utils/customerOrderHelper.js';
import { mockStore } from '../config/mockStore.js';

async function runTests() {
  console.log('🧪 Starting WELCOME10 & Customer Verification Tests...\n');
  mockStore.init();
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Setup mock store orders
  const testUserId = 'user_test_existing_123';
  const newUserId = 'user_test_new_456';
  const cancelledUserId = 'user_test_cancelled_789';

  mockStore.orders = [
    {
      orderId: 'OJ-26-000001',
      user: testUserId,
      orderStatus: 'Confirmed',
      shippingAddress: { fullName: 'Existing User', phone: '+91 88888 11111' },
    },
    {
      orderId: 'OJ-26-000002',
      user: cancelledUserId,
      orderStatus: 'Cancelled',
      shippingAddress: { fullName: 'Cancelled Order User', phone: '+91 88888 33333' },
    },
  ];

  mockStore.users.push(
    { _id: testUserId, email: 'existing_user_unique@oceanjewel.com', phone: '8888811111' },
    { _id: newUserId, email: 'brand_new_unique@oceanjewel.com', phone: '8888822222' },
    { _id: cancelledUserId, email: 'cancelled_user_unique@oceanjewel.com', phone: '8888833333' }
  );

  // Test 1: New customer without orders should return false
  const test1 = await checkCustomerHasCompletedOrders({
    userId: newUserId,
    email: 'brand_new_unique@oceanjewel.com',
    phone: '8888822222',
  });
  assert(test1 === false, 'New customer has no completed orders');

  // Test 2: Existing customer by userId should return true
  const test2 = await checkCustomerHasCompletedOrders({
    userId: testUserId,
  });
  assert(test2 === true, 'Existing customer detected via userId');

  // Test 3: Existing customer by email should return true
  const test3 = await checkCustomerHasCompletedOrders({
    email: 'existing_user_unique@oceanjewel.com',
  });
  assert(test3 === true, 'Existing customer detected via email match');

  // Test 4: Existing customer by phone (with country code / spaces) should return true
  const test4 = await checkCustomerHasCompletedOrders({
    phone: '+91 88888 11111',
  });
  assert(test4 === true, 'Existing customer detected via normalized 10-digit phone');

  // Test 5: Customer with only cancelled orders should return false
  const test5 = await checkCustomerHasCompletedOrders({
    userId: cancelledUserId,
    email: 'cancelled_user_unique@oceanjewel.com',
    phone: '8888833333',
  });
  assert(test5 === false, 'Customer with only Cancelled/Refunded order is eligible for WELCOME10');

  // Test 6: Verify WELCOME10 coupon in mockStore
  const welcomeCoupon = mockStore.coupons.find((c) => c.code === 'WELCOME10');
  assert(welcomeCoupon !== undefined, 'WELCOME10 coupon exists in store');
  assert(welcomeCoupon.minOrderAmount === 999, 'WELCOME10 minOrderAmount is exactly ₹999');
  assert(welcomeCoupon.isFirstOrderOnly === true, 'WELCOME10 isFirstOrderOnly is true');

  // Test 7: validateCoupon for new customer with cartTotal = 1200
  const { validateCoupon } = await import('../controllers/couponController.js');
  let resStatus, resJson;
  const mockRes = () => {
    return {
      status(s) {
        resStatus = s;
        return this;
      },
      json(data) {
        resJson = data;
        return this;
      },
    };
  };

  resStatus = 200;
  await validateCoupon(
    {
      body: { code: 'WELCOME10', cartTotal: 1200, email: 'brand_new_unique@oceanjewel.com', phone: '8888822222' },
      user: { _id: newUserId, email: 'brand_new_unique@oceanjewel.com' },
    },
    mockRes()
  );
  assert(resJson.success === true && resJson.data?.calculatedDiscount === 120, 'validateCoupon succeeds for new customer with subtotal >= 999');

  // Test 8: validateCoupon for new customer with cartTotal = 700 (< 999)
  resStatus = 200;
  await validateCoupon(
    {
      body: { code: 'WELCOME10', cartTotal: 700, email: 'brand_new_unique@oceanjewel.com', phone: '8888822222' },
      user: { _id: newUserId, email: 'brand_new_unique@oceanjewel.com' },
    },
    mockRes()
  );
  assert(resStatus === 400 && resJson.message?.includes('Minimum order value of ₹999'), 'validateCoupon rejects cartTotal < 999 with min order message');

  // Test 9: validateCoupon for existing customer (has past active order)
  resStatus = 200;
  await validateCoupon(
    {
      body: { code: 'WELCOME10', cartTotal: 1500, email: 'existing_user_unique@oceanjewel.com', phone: '8888811111' },
      user: { _id: testUserId, email: 'existing_user_unique@oceanjewel.com' },
    },
    mockRes()
  );
  assert(
    resStatus === 400 && resJson.message === 'This welcome offer is available only on your first order.',
    'validateCoupon rejects existing customer with exact message: "This welcome offer is available only on your first order."'
  );

  // Test 10: Existing customer with SAME PHONE but DIFFERENT EMAIL -> Must be rejected
  resStatus = 200;
  await validateCoupon(
    {
      body: { code: 'WELCOME10', cartTotal: 1500, email: 'totally_different_email@gmail.com', phone: '8888811111' },
      user: { _id: 'new_temp_id_1', email: 'totally_different_email@gmail.com' },
    },
    mockRes()
  );
  assert(
    resStatus === 400 && resJson.message === 'This welcome offer is available only on your first order.',
    'validateCoupon rejects customer with same phone even if email is completely different'
  );

  // Test 11: Existing customer with DIFFERENT PHONE but SAME EMAIL -> Must be rejected
  resStatus = 200;
  await validateCoupon(
    {
      body: { code: 'WELCOME10', cartTotal: 1500, email: 'existing_user_unique@oceanjewel.com', phone: '9999900000' },
      user: { _id: 'new_temp_id_2', email: 'existing_user_unique@oceanjewel.com' },
    },
    mockRes()
  );
  assert(
    resStatus === 400 && resJson.message === 'This welcome offer is available only on your first order.',
    'validateCoupon rejects customer with same email even if phone is completely different'
  );

  // Test 12: createOrder server-side guard for existing customer using WELCOME10
  const { createOrder } = await import('../controllers/orderController.js');
  resStatus = 200;
  await createOrder(
    {
      user: { _id: testUserId, email: 'existing_user_unique@oceanjewel.com', phone: '8888811111' },
      body: {
        orderItems: [{ product: 'prod_men_1', name: 'Obsidian Studs', price: 1200, quantity: 1, size: '6mm' }],
        shippingAddress: { fullName: 'Existing User', phone: '+91 88888 11111', city: 'Delhi', pincode: '110001' },
        paymentMethod: 'cod',
        couponCode: 'WELCOME10',
      },
    },
    mockRes()
  );
  assert(
    resStatus === 400 && resJson.message === 'This welcome offer is available only on your first order.',
    'createOrder server-side guard blocks existing customer from applying WELCOME10 on order placement'
  );

  // Test 13: getCouponByCode endpoint returns active WELCOME10 configuration
  const { getCouponByCode } = await import('../controllers/couponController.js');
  resStatus = 200;
  await getCouponByCode({ params: { code: 'WELCOME10' } }, mockRes());
  assert(
    resStatus === 200 && resJson.data?.code === 'WELCOME10' && resJson.data?.minOrderAmount === 999,
    'getCouponByCode endpoint returns live WELCOME10 configuration'
  );

  console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
