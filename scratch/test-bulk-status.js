async function testBulkStatus() {
  const BASE_URL = "http://127.0.0.1:5000/api";

  console.log("==========================================");
  console.log("TESTING BULK STATUS UPDATE (/api/orders/bulk-status)");
  console.log("==========================================\n");

  try {
    // 1. Fetch current orders
    const ordersRes = await fetch(`${BASE_URL}/orders`);
    const ordersData = await ordersRes.json();
    const orders = ordersData.data?.orders || [];
    if (orders.length === 0) {
      console.error("No orders to bulk update");
      return;
    }

    const targetIds = orders.map((o) => o.id);
    console.log(`Found ${targetIds.length} orders for bulk update:`, targetIds);

    // 2. Perform bulk update to CONFIRMED
    const bulkRes = await fetch(`${BASE_URL}/orders/bulk-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderIds: targetIds,
        status: "CONFIRMED",
        note: "Bulk confirmed via admin test"
      })
    });
    console.log("Bulk Update Status Code:", bulkRes.status);
    const bulkData = await bulkRes.json();
    console.log("Bulk Update Response:", JSON.stringify(bulkData, null, 2));

    // 3. Verify updated status on GET /orders
    const verifyRes = await fetch(`${BASE_URL}/orders`);
    const verifyData = await verifyRes.json();
    console.log("\nVerified Updated Orders Statuses:");
    verifyData.data?.orders?.forEach((o) => {
      console.log(`- Order #${o.orderNumber} (ID: ${o.id}) -> Status: ${o.status}`);
    });

  } catch (err) {
    console.error("ERROR in Bulk Status Test:", err.message);
  }
}

testBulkStatus();
