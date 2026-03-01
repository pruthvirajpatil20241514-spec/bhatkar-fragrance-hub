const path = require('path');
const envPath = 'c:/Users/nikam/OneDrive/Desktop/Perfect/bhatkar-fragrance-hub/.env';
require('dotenv').config({ path: envPath });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConfig() {
    console.log('🔍 Testing Supabase Configuration...');

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'products';

    console.log(`📡 URL: ${url ? '✅ Found' : '❌ Missing'}`);
    console.log(`🔑 Key: ${key ? '✅ Found' : '❌ Missing'}`);
    if (key) {
        console.log(`📄 Key Format: ${key.startsWith('eyJ') ? '✅ Valid (JWT)' : '⚠️  Invalid (Not JWT)'}`);
    }
    console.log(`🪣 Bucket: ${bucket}`);

    if (!url || !key) {
        console.error('❌ Configuration is incomplete. Please check your .env file.');
        process.exit(1);
    }

    try {
        const supabase = createClient(url, key);
        console.log('✅ Supabase client initialized successfully.');

        // Test bucket access (list files)
        const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1 });

        if (error) {
            console.error('❌ Error accessing bucket:', error.message);
            if (error.message.includes('JWS')) {
                console.error('💡 This confirms the Service Role Key is either invalid or restricted.');
            }
        } else {
            console.log('✅ Bucket access verified successfully!');
        }
    } catch (err) {
        console.error('💥 Unexpected error:', err.message);
    }
}

testSupabaseConfig();
