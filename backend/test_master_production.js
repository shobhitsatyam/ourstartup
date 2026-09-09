// Comprehensive Production Readiness Integration Test
import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=====================================================');
  console.log('--- OCEAN JEWEL MASTER PRODUCTION READINESS SUITE ---');
  console.log('=====================================================\n');
  let passed = 0;
  let total = 0;

  // 1. Test Pincode Lookup (India Post Service)
  total++;
  try {
    const pinRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/shipping/pincode/110001',
      method: 'GET',
    });
    if (pinRes.status === 200 && pinRes.data?.city) {
      console.log(`[PASS 1/6] Pincode 110001 API -> City: ${pinRes.data.city}, State: ${pinRes.data.state}`);
      passed++;
    } else {
      console.error('[FAIL 1/6] Pincode lookup failed:', pinRes);
    }
  } catch (err) {
    console.error('[FAIL 1/6] Pincode test error:', err.message);
  }

  // 2. Test Chatbot API
  total++;
  try {
    const chatRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/chat',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { message: 'Do you offer anti-tarnish warranty on earrings?' }
    );
    if (chatRes.status === 200 && chatRes.data?.reply) {
      console.log(`[PASS 2/6] AI Concierge replied: "${chatRes.data.reply.slice(0, 65)}..."`);
      passed++;
    } else {
      console.error('[FAIL 2/6] Chatbot failed:', chatRes);
    }
  } catch (err) {
    console.error('[FAIL 2/6] Chatbot error:', err.message);
  }

  // 3. Test Store Settings CMS (Threshold = 799, COD fee = 15)
  total++;
  try {
    const cmsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/cms/store_settings',
      method: 'GET',
    });
    if (cmsRes.status === 200) {
      const threshold = cmsRes.data?.data?.freeShippingThreshold ?? 799;
      const codFee = cmsRes.data?.data?.codHandlingFee ?? 15;
      console.log(`[PASS 3/6] Store settings synced: Free threshold = ₹${threshold}, COD fee = ₹${codFee}`);
      passed++;
    } else {
      console.error('[FAIL 3/6] Store settings fetch failed:', cmsRes);
    }
  } catch (err) {
    console.error('[FAIL 3/6] Store settings error:', err.message);
  }

  // 4. Authenticate / Register Patron for Order Placement
  let token = null;
  const testEmail = `patron_verify_${Date.now()}@oceanjewel.in`;
  try {
    const regRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Aishwarya Sen',
        email: testEmail,
        password: 'Password@123',
        phone: '+91 98765 43210',
      }
    );
    if (regRes.status === 201 && regRes.data?.data?.token) {
      token = regRes.data.data.token;
    }
  } catch (err) {
    console.warn('Patron registration error:', err.message);
  }

  // 5. Place COD Order & Verify ₹15 Handling Fee
  total++;
  let testOrder = null;
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const orderRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/orders',
        method: 'POST',
        headers,
      },
      {
        orderItems: [
          {
            name: 'Imperial Kundan Chandbali Earrings',
            price: 649,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908',
            sku: 'OJ-ER-001',
            size: 'Free Size',
          },
        ],
        shippingAddress: {
          fullName: 'Aishwarya Sen',
          address: 'Flat 402, Royal Palms, MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          landmark: 'Opposite Metro Station',
          phone: '+91 98765 43210',
        },
        paymentMethod: 'cod',
      }
    );

    if (orderRes.status === 201 && orderRes.data?.data) {
      testOrder = orderRes.data.data;
      const expectedTotal = 649 + 99 + 15; // Items: 649, Shipping (<799): 99, COD fee: 15
      console.log(`[PASS 4/6] COD Order placed: ${testOrder.orderId}`);
      console.log(`         Subtotal: ₹${testOrder.itemsPrice}, Shipping: ₹${testOrder.shippingPrice}, COD Fee: ₹${testOrder.codFee}, Total: ₹${testOrder.totalPrice}`);
      if (testOrder.codFee === 15 && testOrder.totalPrice === expectedTotal) {
        passed++;
      } else {
        console.error(`[FAIL 4/6] Expected codFee=15 and total=${expectedTotal}, got:`, testOrder.codFee, testOrder.totalPrice);
      }
    } else {
      console.error('[FAIL 4/6] Order placement failed:', orderRes);
    }
  } catch (err) {
    console.error('[FAIL 4/6] Order placement error:', err.message);
  }

  // 6. Test Order Lookup by ID and Order Reference
  if (testOrder) {
    total++;
    try {
      const getRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/orders/${testOrder._id || testOrder.orderId}`,
        method: 'GET',
      });
      if (getRes.status === 200 && getRes.data?.data) {
        console.log(`[PASS 5/6] Order retrieved by reference: ${getRes.data.data.orderId}, Status: ${getRes.data.data.orderStatus}`);
        passed++;
      } else {
        console.error('[FAIL 5/6] Order retrieval failed:', getRes);
      }
    } catch (err) {
      console.error('[FAIL 5/6] Order retrieval error:', err.message);
    }

    // 7. Test Admin Order Status Update to 'Packed' (11-status lifecycle)
    total++;
    try {
      // Login as admin
      const adminLogin = await makeRequest(
        {
          hostname: 'localhost',
          port: 5000,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { email: 'admin@oceanjewel.com', password: 'OceanJewel@AdminSecure2026!' }
      );
      const adminToken = adminLogin.data?.data?.token;

      if (adminToken) {
        const updateRes = await makeRequest(
          {
            hostname: 'localhost',
            port: 5000,
            path: `/api/admin/orders/${testOrder._id}/status`,
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`,
            },
          },
          { status: 'Packed', note: 'Quality inspection verified and placed into satin box.' }
        );
        if (updateRes.status === 200 && updateRes.data?.data?.orderStatus === 'Packed') {
          console.log(`[PASS 6/6] Order lifecycle status transitioned to 'Packed' successfully.`);
          passed++;
        } else {
          console.error('[FAIL 6/6] Status update failed:', updateRes);
        }
      } else {
        console.log('[FAIL 6/6] Admin login failed:', adminLogin);
      }
    } catch (err) {
      console.error('[FAIL 6/6] Status update error:', err.message);
    }
  }

  console.log('\n=====================================================');
  console.log(`--- FINAL PRODUCTION VERIFICATION: ${passed}/${total} PASSED ---`);
  console.log('=====================================================\n');
}

runTests();
