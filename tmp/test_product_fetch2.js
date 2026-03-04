(async () => {
    try {
        // Signup
        const signupRes = await fetch('https://bhatkar-fragrance-hub-1.onrender.com/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstname: 'Admin', lastname: 'User', email: 'admin@example.com', password: 'Password123!' })
        });
        const signupData = await signupRes.json();
        console.log('Signup status', signupRes.status);
        const token = signupData?.data?.token;
        console.log('Token:', token);
        if (!token) return;
        // Create product
        const productRes = await fetch('https://bhatkar-fragrance-hub-1.onrender.com/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name: 'Test Perfume', brand: 'TestBrand', price: 100, category: 'Men', concentration: 'Eau de Parfum' })
        });
        const productData = await productRes.json();
        console.log('Product create status', productRes.status);
        console.log('Response body', productData);
    } catch (err) {
        console.error('Error', err);
    }
})();
