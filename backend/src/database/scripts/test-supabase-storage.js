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

        // Test bucket listing
        console.log('📂 Fetching available buckets...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('❌ Error listing buckets:', listError.message);
        } else {
            console.log('✅ Available buckets:', buckets.map(b => b.name || b.id));
            const bucketNames = buckets.map(b => (b.name || b.id));
            if (!bucketNames.includes(bucket)) {
                console.error(`❌ Bucket "${bucket}" not found in your Supabase project!`);
                console.log('💡 Please create it manually in the Supabase Dashboard -> Storage -> Buckets.');
            } else {
                console.log(`✅ Bucket "${bucket}" found and accessible.`);
            }
        }

        // Test bucket access (list files)
        const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1 });

        if (error) {
            console.error(`❌ Error accessing bucket "${bucket}":`, error.message);
            if (error.message.includes('JWS')) {
                console.error('💡 This confirms the Service Role Key is either invalid or restricted.');
            }
        } else {
            console.log(`✅ Bucket "${bucket}" access verified successfully (can list files).`);
        }
    } catch (err) {
        console.error('💥 Unexpected error:', err.message);
    }
}

testSupabaseConfig();
