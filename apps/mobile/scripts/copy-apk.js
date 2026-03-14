/**
 * @file copy-apk.js
 * @module mobile/scripts
 * @description Copies the debug APK to apps/mobile/app-debug.apk for easier access.
 * @author BharatERP
 * @created 2025-03-14
 */

const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const dest = path.join(__dirname, '..', 'app-debug.apk');

if (!fs.existsSync(source)) {
  console.warn('copy-apk: app-debug.apk not found (run build first).');
  process.exit(0);
}

fs.copyFileSync(source, dest);
console.log('APK copied to apps/mobile/app-debug.apk');
