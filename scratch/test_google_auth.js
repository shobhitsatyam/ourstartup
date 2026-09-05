// Automated test for POST /api/auth/google
import http from 'http';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('Testing POST /api/auth/google...');

  const testEmail = `google.test.${Date.now()}@gmail.com`;

  // Test 1: New user signup via Google
  console.log('\n1. Testing new Google user creation...');
  const res1 = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/google',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: testEmail,
      name: 'Pooja Sharma',
      avatar: 'https://lh3.googleusercontent.com/a/test-avatar',
      googleId: 'google-sub-123456',
    }
  );

  console.log('Status:', res1.status);
  console.log('Success:', res1.data.success);
  console.log('User created:', res1.data.data?.name, res1.data.data?.email);
  console.log('Ocean Points awarded:', res1.data.data?.oceanPoints);
  console.log('JWT Token issued:', Boolean(res1.data.data?.token));

  if (!res1.data.success || !res1.data.data?.token) {
    throw new Error('Test 1 Failed');
  }

  const token = res1.data.data.token;

  // Test 2: Existing user login via Google (No duplicate created)
  console.log('\n2. Testing existing user login via Google...');
  const res2 = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/google',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: testEmail,
      name: 'Pooja Sharma Updated',
      avatar: 'https://lh3.googleusercontent.com/a/test-avatar-2',
      googleId: 'google-sub-123456',
    }
  );

  console.log('Status:', res2.status);
  console.log('Success:', res2.data.success);
  console.log('User ID match:', res2.data.data?._id === res1.data.data._id);
  console.log('JWT Token issued:', Boolean(res2.data.data?.token));

  if (res2.data.data?._id !== res1.data.data._id) {
    throw new Error('Test 2 Failed: Created duplicate user!');
  }

  // Test 3: Authenticated /api/auth/me with JWT token
  console.log('\n3. Testing GET /api/auth/me with issued JWT token...');
  const res3 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('Status:', res3.status);
  console.log('Profile retrieved:', res3.data.data?.name, res3.data.data?.email);
  console.log('Role:', res3.data.data?.role);

  if (!res3.data.success || res3.data.data?.email !== testEmail) {
    throw new Error('Test 3 Failed: Token unauthorized or profile mismatch');
  }

  console.log('\nAll Google Auth backend tests PASSED successfully!');
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
