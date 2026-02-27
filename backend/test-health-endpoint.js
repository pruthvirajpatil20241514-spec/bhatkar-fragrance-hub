const http = require('http');
const app = require('./src/app');

// Start server on a specific test port
const PORT = 3009;
const server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);

    try {
        // Wait for DB to connect
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Fetch the health endpoint
        http.get(`http://localhost:${PORT}/api/health`, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`\nEndpoint returned status: ${res.statusCode}`);
                console.log(`Response body: ${data}`);

                // Ensure success exit code
                if (res.statusCode === 200 && data.includes('"database":"connected"')) {
                    console.log('\n✅ TEST PASSED');
                    server.close(() => process.exit(0));
                } else {
                    console.log('\n❌ TEST FAILED');
                    server.close(() => process.exit(1));
                }
            });

        }).on("error", (err) => {
            console.error("HTTP Request Error: ", err.message);
            server.close(() => process.exit(1));
        });
    } catch (error) {
        console.error("Test Error: ", error);
        server.close(() => process.exit(1));
    }
});
