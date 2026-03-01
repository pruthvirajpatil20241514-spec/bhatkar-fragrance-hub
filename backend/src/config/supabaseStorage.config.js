const { createClient } = require('@supabase/supabase-js');

// Environment validation (non-blocking)
if (!process.env.SUPABASE_URL) {
    console.error('❌ SUPABASE_URL is missing in .env');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing in .env');
} else if (!process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY does not appear to be a service role key. It should start with "eyJ".');
}

let supabaseInstance = null;

/**
 * Get the Supabase client instance (lazy loaded)
 */
function getSupabaseClient() {
    if (supabaseInstance) return supabaseInstance;

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing Supabase environment variables");
    }

    supabaseInstance = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    return supabaseInstance;
}

/**
 * Upload file buffer to Supabase Storage
 * @param {Buffer} fileBuffer 
 * @param {string} fileName 
 * @param {string} mimeType 
 * @returns {Promise<string>} Public URL
 */
async function uploadToSupabase(fileBuffer, fileName, mimeType) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'products';
    // Ensure the filePath DOES NOT include the bucket name as a prefix
    const filePath = `${Date.now()}-${fileName}`;

    console.log(`📤 Uploading to Supabase: Bucket=${bucket}, Path=${filePath}`);

    try {
        const { data, error } = await getSupabaseClient().storage
            .from(bucket)
            .upload(filePath, fileBuffer, {
                contentType: mimeType,
                upsert: false
            });

        if (error) {
            console.error("SUPABASE UPLOAD ERROR Details:", {
                message: error.message,
                statusCode: error.statusCode,
                error: error.error,
                bucket,
                filePath
            });
            throw new Error(`Supabase upload error: ${error.message}`);
        }

        const { data: publicUrlData } = getSupabaseClient().storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error("SUPABASE UPLOAD EXCEPTION:", err);
        throw err;
    }
}

/**
 * Delete file from Supabase Storage
 * @param {string} fileUrl 
 */
async function deleteFromSupabase(fileUrl) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'products';

    try {
        // Extract path from public URL
        const urlParts = fileUrl.split(`${bucket}/`);
        if (urlParts.length < 2) return;

        const filePath = urlParts[urlParts.length - 1];

        const { error } = await getSupabaseClient().storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error("SUPABASE DELETE ERROR:", {
                message: error.message,
                fileUrl,
                filePath
            });
        }
    } catch (err) {
        console.error("SUPABASE DELETE EXCEPTION:", err);
    }
}

module.exports = {
    getSupabaseClient,
    uploadToSupabase,
    deleteFromSupabase
};
