const baseApi = 'http://localhost:4000/api';
const frontend = 'http://localhost:3000/';

async function run(){
  try{
    console.log('1) Checking frontend root...');
    const f = await fetch(frontend).then(r=>({status:r.status, text: r.ok? 'OK':'FAIL'})).catch(e=>({error: e.message}));
    console.log('Frontend:', f);

    console.log('\n2) Logging in as admin (admin@example.com / 12345)');
    const loginRes = await fetch(baseApi + '/auth/login', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email: 'admin@example.com', password: '12345' })
    });
    const loginBody = await loginRes.text();
    let token = null;
    try{ token = JSON.parse(loginBody).token; }catch(e){ }
    console.log('Login status:', loginRes.status, 'response:', loginBody);
    if(!token){ console.error('No token received; aborting further tests.'); process.exit(1); }

    const authHeader = { 'Authorization': 'Bearer ' + token };

    console.log('\n3) GET /api/users (admin)');
    const users = await fetch(baseApi + '/users', { headers: authHeader }).then(r=>r.json());
    console.log('Users:', Array.isArray(users)? users.slice(0,5): users);

    console.log('\n4) GET /api/hotels');
    const hotels = await fetch(baseApi + '/hotels', { headers: authHeader }).then(r=>r.json());
    console.log('Hotels:', hotels);

    console.log('\n5) GET /api/tours');
    const tours = await fetch(baseApi + '/tours', { headers: authHeader }).then(r=>r.json());
    console.log('Tours:', tours);

    console.log('\n6) GET /api/bookings (admin)');
    const bookings = await fetch(baseApi + '/bookings', { headers: authHeader }).then(r=>r.json());
    console.log('Bookings:', bookings);

    console.log('\nSmoke tests completed successfully.');
    process.exit(0);
  }catch(err){
    console.error('Smoke test error:', err);
    process.exit(2);
  }
}

run();
