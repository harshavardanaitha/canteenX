/**
 * CanteenX Comprehensive Integration Test Suite
 * Validates all backend REST APIs, RBAC rules, ML predictions, and ordering pipelines.
 */

const axios = require('axios');
const API = process.env.API_URL || 'http://localhost:3001/api';

async function runTests() {
  console.log('====================================================');
  console.log('   CANTEENX FULL PLATFORM INTEGRATION TEST SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function testStep(name, fn) {
    try {
      await fn();
      console.log(` ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(` ❌ FAIL: ${name}`);
      console.error(`    Error: ${err.response?.data?.error || err.message}`);
      failed++;
    }
  }

  let studentToken = '';
  let facultyToken = '';
  let staffToken = '';
  let managerToken = '';
  let adminToken = '';
  let superToken = '';
  let createdOrderId = '';

  // 1. Authentication Tests
  await testStep('1.1 Student Login', async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email: 'student@apex.edu',
      password: 'password123'
    });
    studentToken = res.data.token;
    if (!studentToken || res.data.user.role !== 'STUDENT') throw new Error('Invalid token or role');
  });

  await testStep('1.2 Faculty Login', async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email: 'faculty@apex.edu',
      password: 'password123'
    });
    facultyToken = res.data.token;
    if (!facultyToken || res.data.user.role !== 'FACULTY') throw new Error('Invalid token or role');
  });

  await testStep('1.3 Canteen Staff Login', async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email: 'staff@apex.edu',
      password: 'password123'
    });
    staffToken = res.data.token;
    if (!staffToken || res.data.user.role !== 'CANTEEN_STAFF') throw new Error('Invalid token or role');
  });

  await testStep('1.4 Canteen Manager Login', async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email: 'manager@apex.edu',
      password: 'password123'
    });
    managerToken = res.data.token;
    if (!managerToken || res.data.user.role !== 'CANTEEN_MANAGER') throw new Error('Invalid token or role');
  });

  await testStep('1.5 College Admin Login', async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email: 'admin@apex.edu',
      password: 'password123'
    });
    adminToken = res.data.token;
    if (!adminToken || res.data.user.role !== 'COLLEGE_ADMIN') throw new Error('Invalid token or role');
  });

  await testStep('1.6 Super Admin Login', async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email: 'superadmin@canteenx.com',
      password: 'password123'
    });
    superToken = res.data.token;
    if (!superToken || res.data.user.role !== 'SUPER_ADMIN') throw new Error('Invalid token or role');
  });

  // 2. Catalog & Canteen Endpoints
  await testStep('2.1 List All Canteens', async () => {
    const res = await axios.get(`${API}/canteens`);
    if (!Array.isArray(res.data.canteens) || res.data.canteens.length === 0) {
      throw new Error('No canteens returned');
    }
  });

  await testStep('2.2 Fetch Main Canteen Menu Items', async () => {
    const res = await axios.get(`${API}/menu?canteen_id=cnt_main`);
    if (!Array.isArray(res.data.items) || res.data.items.length === 0) {
      throw new Error('No menu items returned');
    }
  });

  // 3. AI Predictions & Personalization
  await testStep('3.1 Contextual Personalized Recommendations', async () => {
    const res = await axios.get(`${API}/predictions/recommendations?canteen_id=cnt_main`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (!Array.isArray(res.data.recommendations) || res.data.recommendations.length === 0) {
      throw new Error('Recommendations empty');
    }
  });

  await testStep('3.2 Real-time Queue Duration Prediction', async () => {
    const res = await axios.get(`${API}/predictions/queue?canteen_id=cnt_main`);
    if (typeof res.data.predicted_wait_mins !== 'number') {
      throw new Error('Invalid predicted wait minutes');
    }
  });

  await testStep('3.3 ML Demand Forecasting Engine', async () => {
    const res = await axios.get(`${API}/predictions/demand?canteen_id=cnt_main`);
    if (!Array.isArray(res.data.predictions) || res.data.predictions.length === 0) {
      throw new Error('Demand predictions empty');
    }
  });

  // 4. Ordering Lifecycle
  await testStep('4.1 Place Student Takeaway Order', async () => {
    const res = await axios.post(`${API}/orders`, {
      canteen_id: 'cnt_main',
      order_type: 'TAKEAWAY',
      payment_mode: 'CAMPUS_WALLET',
      items: [
        { menu_item_id: 'itm_dosa', quantity: 1, price: 55.00 }
      ]
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    createdOrderId = res.data.order?.id;
    if (!createdOrderId || !res.data.order?.token_number) {
      throw new Error('Order creation missing ID or token number');
    }
  });

  await testStep('4.2 Place Faculty Cabin Delivery Order', async () => {
    const res = await axios.post(`${API}/orders`, {
      canteen_id: 'cnt_main',
      order_type: 'FACULTY_CABIN',
      delivery_building: 'Main Tech Tower',
      delivery_floor: '4th Floor',
      delivery_room: 'Room 402',
      payment_mode: 'CAMPUS_WALLET',
      items: [
        { menu_item_id: 'itm_chai', quantity: 2, price: 15.00 }
      ]
    }, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    if (!res.data.order?.id) throw new Error('Faculty order failed');
  });

  // 5. Kitchen Display & Status Transitions
  await testStep('5.1 Staff Kitchen Order Queue', async () => {
    const res = await axios.get(`${API}/orders?canteen_id=cnt_main`, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    if (!Array.isArray(res.data.orders)) throw new Error('Staff orders not array');
  });

  await testStep('5.2 Update Order Status to PREPARING & READY', async () => {
    if (createdOrderId) {
      await axios.patch(`${API}/orders/${createdOrderId}/status`, { status: 'PREPARING' }, {
        headers: { Authorization: `Bearer ${staffToken}` }
      });
      const res = await axios.patch(`${API}/orders/${createdOrderId}/status`, { status: 'READY' }, {
        headers: { Authorization: `Bearer ${staffToken}` }
      });
      if (!res.data.message) throw new Error('Status update failed');
    }
  });

  // 6. Management & AI Operations Copilot
  await testStep('6.1 Manager Operational Analytics Dashboard', async () => {
    const res = await axios.get(`${API}/analytics/dashboard?canteen_id=cnt_main`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    if (typeof res.data.metrics?.total_orders !== 'number') {
      throw new Error('Metrics total orders missing');
    }
  });

  await testStep('6.2 Grounded AI Copilot Query', async () => {
    const res = await axios.post(`${API}/predictions/copilot/query`, {
      prompt: 'Summarize today performance and low stock ingredients',
      canteen_id: 'cnt_main'
    }, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    if (!res.data.answer || !res.data.ground_truth_metrics) {
      throw new Error('Invalid copilot response structure');
    }
  });

  // 7. Campus Admin & Sustainability
  await testStep('7.1 Campus Food Heatmap & Peak Analysis', async () => {
    const res = await axios.get(`${API}/analytics/heatmap`);
    if (!Array.isArray(res.data.heatmap)) throw new Error('Heatmap not returned');
  });

  await testStep('7.2 Canteen Sustainability Score & Waste Metrics', async () => {
    const res = await axios.get(`${API}/analytics/sustainability`);
    if (!res.data.grade || typeof res.data.score !== 'number') {
      throw new Error('Sustainability score missing');
    }
  });

  // 8. Notifications & Announcements
  await testStep('8.1 User Push Notifications & Unread Badge', async () => {
    const res = await axios.get(`${API}/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (!Array.isArray(res.data.notifications) || typeof res.data.unread_count !== 'number') {
      throw new Error('Notifications response malformed');
    }
  });

  await testStep('8.2 Campus Broadcast Announcements & Events', async () => {
    const res = await axios.get(`${API}/announcements`);
    if (!Array.isArray(res.data.announcements)) throw new Error('Announcements not returned');
  });

  console.log('\n====================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED | ${failed} FAILED `);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
