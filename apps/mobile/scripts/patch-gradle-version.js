/**
 * Patch Gradle wrapper to 8.10.2 to avoid JvmVendorSpec.IBM_SEMERU removal in Gradle 9.
 * Run from apps/mobile (cwd). Survives expo prebuild so APK build works.
 */
const fs = require('fs');
const path = require('path');
const wrapperPath = path.join(__dirname, '..', 'android', 'gradle', 'wrapper', 'gradle-wrapper.properties');
if (!fs.existsSync(wrapperPath)) {
  console.warn('patch-gradle-version: android/gradle/wrapper/gradle-wrapper.properties not found (run prebuild first)');
  process.exit(0);
}
let content = fs.readFileSync(wrapperPath, 'utf8');
content = content.replace(/9\.0\.0/g, '8.10.2');
fs.writeFileSync(wrapperPath, content);
console.log('Gradle wrapper set to 8.10.2 (Gradle 9 removed IBM_SEMERU).');
