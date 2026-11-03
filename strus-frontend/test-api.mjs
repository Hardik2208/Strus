import axios from 'axios';

async function run() {
  try {
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'password123',
      deviceIdentifier: 'test-device',
      platform: 'WEB'
    });
    
    const token = loginRes.data.data.accessToken;
    
    const wsRes = await axios.get('http://localhost:3000/api/v1/workspaces?page=1&limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("RESPONSE:", JSON.stringify(wsRes.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log('Error Response:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err);
    }
  }
}

run();
