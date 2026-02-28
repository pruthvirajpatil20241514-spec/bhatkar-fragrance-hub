const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            results.push(fullPath);
        }
    });
    return results;
}

const backendSrc = 'c:/Users/nikam/OneDrive/Desktop/Perfect/bhatkar-fragrance-hub/backend/src';
const allFiles = walk(backendSrc);

allFiles.forEach(f => {
    if (f.endsWith('.js')) {
        let content = fs.readFileSync(f, 'utf8');
        let changed = false;

        // 1. Replace legacy requires
        const legacyPattern = /require\(["']([^"']*(?:db\.pool|db\.config|db\.compat))["']\)/g;
        if (legacyPattern.test(content)) {
            console.log('Fixing legacy require in:', f);
            content = content.replace(legacyPattern, (match, p1) => {
                return match.replace(p1, p1.replace(/db\.(pool|config|compat)/, 'db'));
            });
            changed = true;
        }

        // 2. Fix corrupted destructuring (from previous failed attempt)
        if (content.includes('const  = ;')) {
            console.log('Repairing corrupted destructuring in:', f);
            content = content.replace(/const\s+=\s*(await\s+(db|pool|conn)\.(query|execute)\([^)]+\));\s*const\s+=\s*\.rows\s*\|\|\s*;/g,
                'const queryResult = $1; const rows = queryResult.rows || queryResult;');
            changed = true;
        }

        // 3. Fix standard MySQL destructuring to PostgreSQL style if missed
        // Only if it's a simple [rows] or [result]
        const destructurePattern = /const\s+\[(rows|result|prodRows|imgRows|orderRows|userRows)\]\s*=\s*(await\s+(db|pool|conn)\.(query|execute|executeQuery)\([^)]+\))/g;
        if (destructurePattern.test(content)) {
            console.log('Fixing MySQL-style destructuring in:', f);
            content = content.replace(destructurePattern, 'const $1_result = $2; const $1 = $1_result.rows || $1_result');
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(f, content);
        }
    }
});
console.log('✅ Global fix script completed');
