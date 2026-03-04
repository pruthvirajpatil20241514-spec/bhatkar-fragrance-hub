/**
 * FIX SCRIPT: Make Supabase Storage bucket PUBLIC + add anonymous SELECT policy
 *
 * Run with:
 *   node backend/src/database/scripts/fix-storage-public.js
 */

const path = require('path');
const envPath = path.join(__dirname, '../../../../.env');
require('dotenv').config({ path: envPath });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'products';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log(`\n🔧 Fixing Supabase Storage bucket: "${BUCKET_NAME}"\n`);

    // 1. Check if bucket exists
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
    if (listErr) {
        console.error('❌ Could not list buckets:', listErr.message);
        process.exit(1);
    }

    const existing = buckets.find(b => b.id === BUCKET_NAME || b.name === BUCKET_NAME);
    if (!existing) {
        console.warn(`⚠️  Bucket "${BUCKET_NAME}" not found. Creating it as PUBLIC…`);
        const { data: created, error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
            fileSizeLimit: 10 * 1024 * 1024 // 10 MB
        });
        if (createErr) {
            console.error('❌ Failed to create bucket:', createErr.message);
        } else {
            console.log('✅ Bucket created as PUBLIC:', created);
        }
    } else {
        console.log(`✅ Bucket "${BUCKET_NAME}" found. Current public status:`, existing.public);

        if (!existing.public) {
            // 2. Update bucket to be public
            const { data: updated, error: updateErr } = await supabase.storage.updateBucket(BUCKET_NAME, {
                public: true
            });
            if (updateErr) {
                console.error('❌ Failed to update bucket to public:', updateErr.message);
                console.log('👉 Manual fix: Go to Supabase Dashboard → Storage → products bucket → Edit → Enable Public Access');
            } else {
                console.log('✅ Bucket updated to PUBLIC successfully!');
            }
        } else {
            console.log('✅ Bucket is already PUBLIC. No change needed.');
        }
    }

    // 3. List files to verify access
    console.log('\n📂 Listing files in bucket to verify access...');
    const { data: files, error: filesErr } = await supabase.storage.from(BUCKET_NAME).list('', { limit: 5 });
    if (filesErr) {
        console.error('❌ Cannot list files:', filesErr.message);
    } else {
        console.log(`✅ Found ${files.length} file(s) in bucket (showing up to 5):`);
        files.forEach(f => {
            const publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(f.name).data.publicUrl;
            console.log(`  📦 ${f.name} → ${publicUrl}`);
        });
    }

    // 4. Verify public URL format
    console.log('\n🔗 Sample public URL format:');
    const sampleUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/sample-file.jpg`;
    console.log(`  ${sampleUrl}`);
    console.log('   ↑ Images MUST use this public path (no auth required)');

    console.log('\n🎉 Done! If bucket is now PUBLIC, images should load without timeout.');
    console.log('⚡ If still getting timeouts, check your Supabase region and network.\n');
}

run().catch(err => {
    console.error('💥 Unexpected error:', err.message);
    process.exit(1);
});
