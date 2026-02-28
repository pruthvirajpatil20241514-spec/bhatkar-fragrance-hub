const https = require('https');
function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}
(async () => {
    try {
        const signupData = JSON.stringify({ firstname: 'Admin', lastname: 'User', email: 'admin@example.com', password: 'Password123!' });
        const signupOpts = { method: 'POST', hostname: 'bhatkar-fragrance-hub-1.onrender.com', path: '/api/auth/signup', headers: { 'Content-Type': 'application/json', 'Content-Length': signupData.length } };
        const signupRes = await request(signupOpts, signupData);
        console.log('Signup status', signupRes.status);
        const token = JSON.parse(signupRes.body).data?.token;
        console.log('Token', token);
        if (!token) return;
        const productData = JSON.stringify({ name: 'Test Perfume', brand: 'TestBrand', price: 100, category: 'Men', concentration: 'Eau de Parfum' });
        const prodOpts = { method: 'POST', hostname: 'bhatkar-fragrance-hub-1.onrender.com', path: '/api/products', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': productData.length } };
        const prodRes = await request(prodOpts, productData);
        console.log('Product create status', prodRes.status);
        console.log('Body', prodRes.body);
    } catch (e) {
        console.error('Error', e);
    }
})();
