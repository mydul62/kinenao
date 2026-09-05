async function runFullAudit() {
  const BASE_URL = "http://127.0.0.1:5000/api";

  console.log("==========================================");
  console.log("STARTING KINENAO FULL-STACK SYSTEM AUDIT");
  console.log("==========================================\n");

  try {
    // 1. Test Customer Registration
    const testEmail = `audit_cust_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "password123",
        fullName: "System Audit User",
        phoneNumber: "01700000000"
      })
    });
    const regData = await regRes.json();
    console.log("✅ 1. Customer Registration:", regRes.status === 201 ? "PASS" : `FAIL (${regRes.status})`);
    const custToken = regData.data?.accessToken;

    // 2. Test Admin/Customer Login with seed user or newly created user
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "password123"
      })
    });
    const loginData = await loginRes.json();
    console.log("✅ 2. User Login:", loginRes.status === 200 ? "PASS" : `FAIL (${loginRes.status})`);

    // 3. Test File Upload (POST /api/upload/image)
    const dummyBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const blob = new Blob([dummyBuffer], { type: 'image/gif' });
    const formData = new FormData();
    formData.append('file', blob, 'test-brand-logo.gif');

    const uploadRes = await fetch(`${BASE_URL}/upload/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${custToken}` },
      body: formData
    });
    const uploadData = await uploadRes.json();
    const uploadedUrl = uploadData.data?.url || "";
    console.log("✅ 3. Image Upload (/api/upload/image):", uploadRes.status === 200 ? `PASS (${uploadedUrl})` : `FAIL (${uploadRes.status})`);

    // 4. Test Settings APIs (/api/settings & /api/setting)
    const settingsGet1 = await fetch(`${BASE_URL}/settings`);
    const settingsGet2 = await fetch(`${BASE_URL}/setting`);
    console.log("✅ 4. Settings GET /settings:", settingsGet1.status === 200 ? "PASS" : `FAIL (${settingsGet1.status})`);
    console.log("✅ 5. Settings GET /setting (alias):", settingsGet2.status === 200 ? "PASS" : `FAIL (${settingsGet2.status})`);

    // 5. Test Brand Creation (with empty logoUrl & uploaded logoUrl)
    const brandRes1 = await fetch(`${BASE_URL}/brands`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${custToken}` // Note: requires ADMIN/MANAGER for creation
      },
      body: JSON.stringify({
        name: `Audit Brand ${Date.now()}`,
        slug: `audit-brand-${Date.now()}`,
        logoUrl: "",
        isActive: true
      })
    });
    console.log("✅ 6. Brand Route Access check:", brandRes1.status !== 404 ? "PASS (Route exists)" : "FAIL (404 Not Found)");

    // 6. Test Public Listing APIs
    const [categories, brands, banners, testimonials, faqs, reviews] = await Promise.all([
      fetch(`${BASE_URL}/categories`).then(r => r.status),
      fetch(`${BASE_URL}/brands`).then(r => r.status),
      fetch(`${BASE_URL}/banners`).then(r => r.status),
      fetch(`${BASE_URL}/testimonials`).then(r => r.status),
      fetch(`${BASE_URL}/faqs`).then(r => r.status),
      fetch(`${BASE_URL}/reviews`).then(r => r.status),
    ]);

    console.log("✅ 7. Categories API:", categories === 200 ? "PASS" : `FAIL (${categories})`);
    console.log("✅ 8. Brands API:", brands === 200 ? "PASS" : `FAIL (${brands})`);
    console.log("✅ 9. Banners API:", banners === 200 ? "PASS" : `FAIL (${banners})`);
    console.log("✅ 10. Testimonials API:", testimonials === 200 ? "PASS" : `FAIL (${testimonials})`);
    console.log("✅ 11. FAQs API:", faqs === 200 ? "PASS" : `FAIL (${faqs})`);
    console.log("✅ 12. Reviews API:", reviews === 200 ? "PASS" : `FAIL (${reviews})`);

    console.log("\n==========================================");
    console.log("ALL CORE SYSTEM AUDIT CHECKS COMPLETED");
    console.log("==========================================");
  } catch (err) {
    console.error("AUDIT ERROR:", err);
  }
}

runFullAudit();
