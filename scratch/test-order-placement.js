async function testOrderFlow() {
  const BASE_URL = "http://127.0.0.1:5000/api";

  console.log("==========================================");
  console.log("TESTING ORDER PLACEMENT & DASHBOARD SHOW");
  console.log("==========================================\n");

  try {
    // 1. Fetch available products
    const prodRes = await fetch(`${BASE_URL}/products?limit=1`);
    const prodData = await prodRes.json();
    const products = prodData.data?.products || [];
    if (products.length === 0) {
      console.error("❌ No products available to place an order!");
      return;
    }
    const targetProd = products[0];
    console.log(`📦 Found product for order test: ${targetProd.name} (ID: ${targetProd.id})`);

    // 2. Fetch delivery zones
    const zoneRes = await fetch(`${BASE_URL}/delivery-zones`);
    const zoneData = await zoneRes.json();
    const zones = zoneData.data?.zones || zoneData.data || [];
    const zoneId = zones[0]?.id || undefined;
    console.log(`🚚 Delivery Zone ID: ${zoneId}`);

    // 3. Test Direct Order POST /orders/direct
    const directOrderPayload = {
      fullName: "Test Direct Customer",
      phoneNumber: "01711223344",
      deliveryAddress: "House 12, Road 5, Dhanmondi, Dhaka",
      orderNotes: "Please deliver between 2PM - 5PM",
      deliveryZoneId: zoneId,
      deliveryCharge: 60,
      paymentMethod: "COD",
      items: [
        {
          productId: targetProd.id,
          quantity: 1,
          price: targetProd.price
        }
      ],
      totalAmount: targetProd.price + 60
    };

    console.log("\n1. Testing POST /api/orders/direct ...");
    const directRes = await fetch(`${BASE_URL}/orders/direct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(directOrderPayload)
    });
    console.log("Direct Order Status:", directRes.status);
    const directData = await directRes.json();
    console.log("Direct Order Response:", JSON.stringify(directData, null, 2));

    // 4. Test Standard Order POST /orders
    const standardOrderPayload = {
      guestInfo: {
        fullName: "Test Standard Customer",
        phone: "01899887766",
        street: "Gulshan-2, Dhaka",
        city: "Dhaka",
        country: "Bangladesh",
        orderNotes: "Call before arrival"
      },
      deliveryZoneId: zoneId,
      items: [
        {
          productId: targetProd.id,
          quantity: 2
        }
      ]
    };

    console.log("\n2. Testing POST /api/orders ...");
    const stdRes = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(standardOrderPayload)
    });
    console.log("Standard Order Status:", stdRes.status);
    const stdData = await stdRes.json();
    console.log("Standard Order Response:", JSON.stringify(stdData, null, 2));

    // 5. Test Fetching all orders GET /orders
    console.log("\n3. Fetching GET /api/orders ...");
    const ordersRes = await fetch(`${BASE_URL}/orders`);
    const ordersData = await ordersRes.json();
    console.log("Total Orders fetched:", ordersData.data?.orders?.length || 0);

  } catch (err) {
    console.error("ERROR in Order Flow Test:", err);
  }
}

testOrderFlow();
