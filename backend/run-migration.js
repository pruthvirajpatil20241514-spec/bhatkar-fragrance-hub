import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Env loaded - DB_HOST:', process.env.DB_HOST);

// Now import and run the migration
import('./src/database/scripts/addImageFormatColumn.js').then(() => {
  console.log('Migration complete');
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
