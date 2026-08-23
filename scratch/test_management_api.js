const http = require('https');

// Test login as admin first or test direct endpoints
const options = {
  hostname: 'hostelhub-0cyi.onrender.com',
  port: 443,
  path: '/api/management/accounts',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('RESPONSE:', data));
});

req.on('error', (e) => console.error('ERROR:', e));
req.end();
