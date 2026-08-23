const http = require('https');

function checkUrl(path) {
  return new Promise((resolve) => {
    http.get(`https://hostelhub-0cyi.onrender.com${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ path, status: res.statusCode, body: data.slice(0, 100) }));
    });
  });
}

async function run() {
  console.log(await checkUrl('/'));
  console.log(await checkUrl('/api/users/all'));
  console.log(await checkUrl('/api/management/accounts'));
}

run();
