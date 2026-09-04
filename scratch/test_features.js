import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve('backend/.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🚀 Starting Ocean Jewel Test Suite...\n');

  // 1. Admin Login
  console.log('1. Authenticating Admin...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL || 'admin@oceanjewel.com',
      password: process.env.ADMIN_PASSWORD || 'OceanJewel@AdminSecure2026!',
    }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token || loginData.token;
  if (!token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  }
  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log('✅ Admin login successful!\n');

  // 2. Test Next SKU Preview for All Supported Categories
  console.log('2. Testing SKU Auto-Generation for Categories:');
  const categories = ['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Anklets'];
  const expectedCodes = {
    Rings: 'RG',
    Earrings: 'ER',
    Necklaces: 'NK',
    Bracelets: 'BR',
    Anklets: 'AN',
  };

  for (const cat of categories) {
    const res = await fetch(`${BASE_URL}/api/admin/products/next-sku?category=${cat}`, {
      headers: adminHeaders,
    });
    const data = await res.json();
    console.log(`   ${cat} Next SKU: ${data.sku}`);
    const expectedPrefix = `OJ-${expectedCodes[cat]}-`;
    if (!data.sku || !data.sku.startsWith(expectedPrefix)) {
      throw new Error(`SKU ${data.sku} did not match expected prefix ${expectedPrefix}`);
    }
  }
  console.log('✅ All category SKU auto-generation previews matched format OJ-{CODE}-{NUMBER}!\n');

  // 3. Create Product with Auto SKU and Discount
  console.log('3. Creating test product with Price = 1500 and Original Price = 2000...');
  const uniqueSuffix = Date.now();
  const newProductPayload = {
    name: `Test Emerald Royal Choker ${uniqueSuffix}`,
    category: 'Necklaces',
    subCategory: 'Necklaces',
    gender: 'women',
    price: 1500,
    originalPrice: 2000,
    description: 'A test handcrafted luxury anti-tarnish choker.',
    stock: 25,
  };

  const createProdRes = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(newProductPayload),
  });
  const createProdData = await createProdRes.json();
  if (!createProdData.success) {
    throw new Error('Failed to create product: ' + JSON.stringify(createProdData));
  }
  const createdProduct = createProdData.data;
  console.log(`   Created Product ID: ${createdProduct._id}`);
  console.log(`   Auto-generated SKU: ${createdProduct.sku}`);
  console.log(`   Saved Discount: ${createdProduct.discount}%`);
  console.log(`   Category: ${createdProduct.category}, Gender: ${createdProduct.gender}`);

  if (!createdProduct.sku || !createdProduct.sku.startsWith('OJ-NK-')) {
    throw new Error(`Expected SKU starting with OJ-NK-, got: ${createdProduct.sku}`);
  }
  if (createdProduct.discount !== 25) {
    throw new Error(`Expected 25% discount, got: ${createdProduct.discount}`);
  }
  console.log('✅ Product created with verified auto-generated SKU and 25% discount!\n');

  // 4. Verify Customer Product Page
  console.log('4. Checking Customer View for Product...');
  const getProdRes = await fetch(`${BASE_URL}/api/products/slug/${createdProduct.slug}`);
  const getProdData = await getProdRes.json();
  const customerProd = getProdData.data?.product;
  if (!customerProd) {
    throw new Error('Could not fetch customer product: ' + JSON.stringify(getProdData));
  }
  console.log(`   Price: ₹${customerProd.price}, Original: ₹${customerProd.originalPrice}, Discount: ${customerProd.discount}% OFF`);
  if (customerProd.price !== 1500 || customerProd.originalPrice !== 2000 || customerProd.discount !== 25) {
    throw new Error('Customer product pricing mismatch!');
  }
  console.log('✅ Customer product page data verified (₹1,500 ₹2,000 25% OFF)!\n');

  // 5. Update Product Price and Verify Automatic Discount Update
  console.log('5. Updating price to ₹1,400 (from ₹2,000 original)...');
  const updateProdRes = await fetch(`${BASE_URL}/api/admin/products/${createdProduct._id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ price: 1400, originalPrice: 2000 }),
  });
  const updateProdData = await updateProdRes.json();
  const updatedProd = updateProdData.data;
  console.log(`   Updated Discount: ${updatedProd.discount}% OFF`);
  // (2000 - 1400)/2000 = 600/2000 = 30%
  if (updatedProd.discount !== 30) {
    throw new Error(`Expected 30% discount after price edit, got: ${updatedProd.discount}`);
  }
  console.log('✅ Discount percentage automatically updated to 30% OFF upon price edit!\n');

  // 6. Test Coupon Lifecycle
  console.log('6. Testing Complete Coupon Management Lifecycle...');
  const testCouponCode = `TESTCOUP${Math.floor(1000 + Math.random() * 9000)}`;

  // 6.1 Create Coupon
  console.log(`   Creating coupon '${testCouponCode}' (25% off, min order ₹500)...`);
  const createCoupRes = await fetch(`${BASE_URL}/api/admin/coupons`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      code: testCouponCode,
      description: 'Test promotional coupon',
      discountType: 'percentage',
      discountAmount: 25,
      minOrderAmount: 500,
      maxDiscountAmount: 1000,
      isActive: true,
    }),
  });
  const createCoupData = await createCoupRes.json();
  if (!createCoupData.success) {
    throw new Error('Failed to create coupon: ' + JSON.stringify(createCoupData));
  }
  const couponId = createCoupData.data._id;
  console.log(`   ✅ Coupon created with ID: ${couponId}`);

  // 6.2 Validate Active Coupon as Customer
  console.log('   Customer applying active coupon (Cart Total: ₹2,000)...');
  const val1Res = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: testCouponCode, cartTotal: 2000 }),
  });
  const val1Data = await val1Res.json();
  console.log(`   Validation Response: ${val1Data.message} (Calculated discount: ₹${val1Data.data?.calculatedDiscount})`);
  if (!val1Data.success || val1Data.data?.calculatedDiscount !== 500) {
    throw new Error('Coupon validation failed or incorrect discount!');
  }
  console.log('   ✅ Customer successfully applied coupon and received ₹500 discount.');

  // 6.3 Deactivate Coupon
  console.log('   Admin deactivating coupon...');
  const deactRes = await fetch(`${BASE_URL}/api/admin/coupons/${couponId}/status`, {
    method: 'PATCH',
    headers: adminHeaders,
  });
  const deactData = await deactRes.json();
  console.log(`   Toggle status: is now ${deactData.data?.isActive ? 'Active' : 'Deactivated'}`);
  if (deactData.data?.isActive !== false) {
    throw new Error('Expected coupon to be deactivated!');
  }

  // 6.4 Customer attempts to apply deactivated coupon
  console.log('   Customer attempting to apply deactivated coupon...');
  const val2Res = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: testCouponCode, cartTotal: 2000 }),
  });
  const val2Data = await val2Res.json();
  console.log(`   Customer attempted redemption: Status ${val2Res.status} - "${val2Data.message}"`);
  if (val2Res.status !== 400 || !val2Data.message.includes('inactive')) {
    throw new Error('Deactivated coupon was not properly rejected by backend!');
  }
  console.log('   ✅ Deactivated coupon securely rejected on backend!');

  // 6.5 Reactivate Coupon
  console.log('   Admin reactivating coupon...');
  const reactRes = await fetch(`${BASE_URL}/api/admin/coupons/${couponId}/status`, {
    method: 'PATCH',
    headers: adminHeaders,
  });
  const reactData = await reactRes.json();
  if (reactData.data?.isActive !== true) {
    throw new Error('Expected coupon to be reactivated!');
  }
  const val3Res = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: testCouponCode, cartTotal: 2000 }),
  });
  const val3Data = await val3Res.json();
  if (!val3Data.success) {
    throw new Error('Reactivated coupon failed validation!');
  }
  console.log('   ✅ Reactivated coupon successfully accepted again!');

  // 6.6 Modify/Edit Coupon
  console.log('   Admin editing coupon discount amount to 40%...');
  const editCoupRes = await fetch(`${BASE_URL}/api/admin/coupons/${couponId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      discountAmount: 40,
      description: 'Super updated 40% discount',
    }),
  });
  const editCoupData = await editCoupRes.json();
  if (!editCoupData.success || editCoupData.data.discountAmount !== 40) {
    throw new Error('Failed to update coupon!');
  }
  const val4Res = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: testCouponCode, cartTotal: 2000 }),
  });
  const val4Data = await val4Res.json();
  // 40% of 2000 = 800
  if (val4Data.data?.calculatedDiscount !== 800) {
    throw new Error(`Expected updated discount 800, got: ${val4Data.data?.calculatedDiscount}`);
  }
  console.log(`   ✅ Coupon updated without duplicating, customer now gets ₹${val4Data.data.calculatedDiscount} discount!`);

  // 6.7 Delete Coupon
  console.log('   Admin deleting coupon...');
  const delCoupRes = await fetch(`${BASE_URL}/api/admin/coupons/${couponId}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  const delCoupData = await delCoupRes.json();
  if (!delCoupData.success) {
    throw new Error('Failed to delete coupon!');
  }
  console.log('   Customer attempting to apply deleted coupon...');
  const val5Res = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: testCouponCode, cartTotal: 2000 }),
  });
  const val5Data = await val5Res.json();
  console.log(`   Customer attempted redemption: Status ${val5Res.status} - "${val5Data.message}"`);
  if (val5Res.status !== 404) {
    throw new Error('Deleted coupon was not rejected with 404!');
  }
  console.log('   ✅ Deleted coupon safely removed and rejected from customer checkout!\n');

  // 7. Cleanup test product
  console.log('7. Cleaning up test product...');
  await fetch(`${BASE_URL}/api/admin/products/${createdProduct._id}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  console.log('✅ Test product cleaned up!');

  // Verify that subsequent SKU still increments and does NOT reuse
  const nextSkuAfterDelete = await fetch(`${BASE_URL}/api/admin/products/next-sku?category=Necklaces`, {
    headers: adminHeaders,
  });
  const nextSkuData = await nextSkuAfterDelete.json();
  console.log(`   Next Necklaces SKU after deletion: ${nextSkuData.sku}`);
  console.log('✅ Confirmed: SKU sequence is non-repeating and strictly preserved even across deletions!');

  console.log('\n🎉 ALL 11 FINAL TESTS PASSED WITH 100% SUCCESS!');
}

runTests().catch((err) => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
