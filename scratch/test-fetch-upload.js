async function testUpload() {
  try {
    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `upload_test_${Date.now()}@example.com`,
        password: "password123",
        fullName: "Upload Tester",
        phoneNumber: "01788888888"
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;

    const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const blob = new Blob([buffer], { type: 'image/gif' });
    const formData = new FormData();
    formData.append('file', blob, 'test.gif');

    const uploadRes = await fetch('http://127.0.0.1:5000/api/upload/image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const uploadData = await uploadRes.json();
    console.log("UPLOAD STATUS:", uploadRes.status);
    console.log("UPLOAD RESPONSE:", uploadData);
  } catch (err) {
    console.log("ERROR:", err.message);
  }
}

testUpload();
