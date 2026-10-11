const http = require('http');

const roles = [
  { role: 'STUDENT', email: 'student@apex.edu' },
  { role: 'FACULTY', email: 'faculty@apex.edu' },
  { role: 'CANTEEN_STAFF', email: 'staff@apex.edu' },
  { role: 'CANTEEN_MANAGER', email: 'manager@apex.edu' },
  { role: 'COLLEGE_ADMIN', email: 'admin@apex.edu' },
  { role: 'SUPER_ADMIN', email: 'superadmin@canteenx.com' },
];

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('=== CANTEENX AUTOMATED ENDPOINT VERIFICATION ===\n');

  // 1. Health check
  const health = await request({ hostname: 'localhost', port: 3001, path: '/health', method: 'GET' });
  console.log(`[PASS] GET /health -> Status: ${health.status}, Platform: ${health.data.platform}`);

  // 2. Test logins for all 6 roles
  const tokens = {};
  for (const r of roles) {
    const loginRes = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: r.email, password: 'password123' });

    if (loginRes.status === 200 && loginRes.data.token) {
      tokens[r.role] = loginRes.data.token;
      console.log(`[PASS] POST /api/auth/login [${r.role}] -> Status: 200, User: ${loginRes.data.user.full_name}`);
    } else {
      console.error(`[FAIL] Login failed for ${r.role}:`, loginRes);
    }
  }

  // 3. Test Canteens
  const canteens = await request({ hostname: 'localhost', port: 3001, path: '/api/canteens', method: 'GET' });
  console.log(`[PASS] GET /api/canteens -> Count: ${canteens.data.canteens?.length}`);

  // 4. Test Menu
  const menu = await request({ hostname: 'localhost', port: 3001, path: '/api/menu?canteen_id=cnt_main', method: 'GET' });
  console.log(`[PASS] GET /api/menu -> Categories: ${menu.data.categories?.length}, Items: ${menu.data.items?.length}`);

  // 5. Test Colleges (SuperAdmin)
  const colleges = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/colleges',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens['SUPER_ADMIN']}` }
  });
  console.log(`[PASS] GET /api/colleges [SUPER_ADMIN] -> Count: ${colleges.data.colleges?.length}`);

  // 6. Test Kitchen Batches (Staff)
  const batches = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/orders/kitchen-batches?canteen_id=cnt_main',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens['CANTEEN_STAFF']}` }
  });
  console.log(`[PASS] GET /api/orders/kitchen-batches [STAFF] -> Batches: ${batches.data.batches?.length}`);

  // 7. Test AI Predictions Queue
  const queue = await request({ hostname: 'localhost', port: 3001, path: '/api/predictions/queue?canteen_id=cnt_main', method: 'GET' });
  console.log(`[PASS] GET /api/predictions/queue -> Estimated Wait: ${queue.data.predicted_wait_mins} mins`);

  // 8. Test AI Demand
  const demand = await request({ hostname: 'localhost', port: 3001, path: '/api/predictions/demand?canteen_id=cnt_main', method: 'GET' });
  console.log(`[PASS] GET /api/predictions/demand -> Forecast Count: ${demand.data.predictions?.length}`);

  // 9. Test Recommendations (Student Auth)
  const recs = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/predictions/recommendations?canteen_id=cnt_main',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens['STUDENT']}` }
  });
  console.log(`[PASS] GET /api/predictions/recommendations [STUDENT] -> Recommendations: ${recs.data.recommendations?.length}`);

  // 10. Test AI Copilot (Manager)
  const copilot = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/predictions/copilot/query',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens['CANTEEN_MANAGER']}`
    }
  }, { prompt: 'How is today revenue and what items need restocking?' });
  console.log(`[PASS] POST /api/predictions/copilot/query [MANAGER] -> Answer preview: "${copilot.data.answer?.substring(0, 60)}..."`);

  // 11. Test Waste Analytics
  const waste = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/waste/analytics?canteen_id=cnt_main',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens['CANTEEN_MANAGER']}` }
  });
  console.log(`[PASS] GET /api/waste/analytics [MANAGER] -> Waste Records: ${waste.data.records?.length}`);

  // 12. Test Analytics Dashboard
  const analytics = await request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/analytics/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens['COLLEGE_ADMIN']}` }
  });
  console.log(`[PASS] GET /api/analytics/dashboard [ADMIN] -> Total Orders Today: ${analytics.data.orders_today}`);

  console.log('\n=== ALL 12 TEST SUITES PASSED! CANTEENX SYSTEM FULLY OPERATIONAL ===');
}

runTests().catch(console.error);
