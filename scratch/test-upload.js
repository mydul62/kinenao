const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/register', {
      email: `upload_test_${Date.now()}@example.com`,
      password: "password123",
      fullName: "Upload Tester",
      phoneNumber: "01788888888"
    });
    const token = loginRes.data.data.accessToken;

    // Create a dummy image file
    const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    fs.writeFileSync('./scratch/dummy.gif', buffer);

    const form = new FormData();
    form.append('file', fs.createReadStream('./scratch/dummy.gif'));

    const uploadRes = await axios.post('http://127.0.0.1:5000/api/upload/image', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log("UPLOAD SUCCESS:", uploadRes.data);
  } catch (err) {
    console.log("UPLOAD FAILED:", err.response ? err.response.data : err.message);
  }
}

testUpload();
