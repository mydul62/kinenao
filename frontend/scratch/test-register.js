const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/register', {
      email: `test_${Date.now()}@example.com`,
      password: "password123",
      fullName: "Test User",
      phoneNumber: "01799999999"
    });
    console.log("SUCCESS:", JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.log("ERROR:", error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

run();
