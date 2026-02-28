require('dotenv').config();
const db = require('./src/config/db');
const { CopyObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('./src/config/railwayStorage.config');
const { logger } = require('./src/utils/logger');

async function migrateImages() {
    const endpoint = process.env.S3_ENDPOINT || 'https://t3.storageapi.dev';
    const bucket = process.env.S3_BUCKET || 'bhatkar-images';

    try {
        const result = await db.query('SELECT id, image_url FROM product_images');
        const images = result.rows || result;

        let updatedCount = 0;

        for (const img of images) {
            let currentUrl = img.image_url;
            let finalUrl = currentUrl;
            let needsUpdate = false;

            // Extract key
            let tempKey = currentUrl;
            if (tempKey.includes('http')) {
                const urlParts = tempKey.split('/');
                const bucketIdx = urlParts.findIndex(p => p === bucket);
                if (bucketIdx >= 0) {
                    tempKey = urlParts.slice(bucketIdx + 1).join('/');
                } else if (tempKey.includes('products/')) {
                    tempKey = 'products/' + tempKey.split('products/')[1];
                }
            }

            // If it contains "temp", move the object in S3
            if (tempKey.includes('temp')) {
                const permanentKey = tempKey.replace(/-temp-/g, '-final-').replace(/temp-/g, 'final-');

                try {
                    console.log(`Copying ${tempKey} to ${permanentKey} in S3...`);
                    await s3Client.send(new CopyObjectCommand({
                        Bucket: bucket,
                        CopySource: `${bucket}/${tempKey}`,
                        Key: permanentKey,
                    }));

                    await s3Client.send(new DeleteObjectCommand({
                        Bucket: bucket,
                        Key: tempKey,
                    }));

                    tempKey = permanentKey;
                } catch (s3Err) {
                    console.error(`S3 Error moving ${tempKey}:`, s3Err.message);
                    // If it fails because source doesn't exist, maybe it was already moved. But the DB didn't update.
                }
            }

            // Format as full public URL
            if (!tempKey.startsWith('http')) {
                finalUrl = `${endpoint}/${bucket}/${tempKey}`;
            } else {
                finalUrl = tempKey;
            }

            if (finalUrl !== currentUrl) {
                console.log(`Updating DB ID ${img.id}: ${currentUrl} -> \n -> ${finalUrl}`);
                await db.query('UPDATE product_images SET image_url = $1 WHERE id = $2', [finalUrl, img.id]);
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} records.`);
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
}

migrateImages();
