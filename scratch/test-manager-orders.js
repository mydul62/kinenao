async function checkManagerOrders() {
  const BASE_URL = "http://127.0.0.1:5000/api";

  console.log("1. Trying login as manager@kinenao.com ...");
  let token = "";
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "manager@kinenao.com",
        password: "password123"
      })
    });
    const loginData = await loginRes.json();
    console.log("Manager Login Status:", loginRes.status);
    console.log("Manager User Data:", JSON.stringify(loginData.data?.user, null, 2));
    token = loginData.data?.accessToken;
  } catch (err) {
    console.error("Login failed:", err.message);
  }

  console.log("\n2. Fetching GET /api/orders with Manager Token ...");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const ordersRes = await fetch(`${BASE_URL}/orders`, { headers });
  const ordersData = await ordersRes.json();
  console.log("GET /orders Status:", ordersRes.status);
  console.log("GET /orders Response:", JSON.stringify(ordersData, null, 2));
}

checkManagerOrders();
