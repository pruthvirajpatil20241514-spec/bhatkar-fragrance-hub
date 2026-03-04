#!/usr/bin/env node
require('dotenv').config();
const db = require('../../config/db');

(async function() {
  try {
    const  = ; const  = .rows || ;
    console.log('Latest orders:');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Error querying orders:', err.message || err);
    process.exitCode = 1;
  } finally {
    try { await db.end(); } catch (e) {}
  }
})();
