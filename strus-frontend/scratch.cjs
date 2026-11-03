const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/users/search?q=Demo&page=1',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhOWM4NjBiMC0xNDVkLTRiMWMtYmI3Mi1iNjliMDIyZGY0NjgiLCJzZXNzaW9uSWQiOiJhODBhOWVkMS0yZTY5LTQyMjMtYWEwMC01MDU3OTQyZTJmZDciLCJkZXZpY2VJZCI6ImQ0YjM5YzkwLWI0MGUtNGMzYy1iMmQ0LTFlODE5OGYyY2Y0MyIsImlhdCI6MTc4NzU4NTUyMiwiZXhwIjoxNzg3NTg2NDIyfQ.Ko7osQMhZzQvWCdn8l6xHIY-WelxWs2WZe8qjhbXYqw'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data));
});
req.end();
