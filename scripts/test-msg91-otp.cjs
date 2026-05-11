#!/usr/bin/env node
/**
 * @file test-msg91-otp.cjs
 * @description One-off test: MSG91 legacy sendotp.php GET (same shape as SmsService), or GraphQL sendOtp (--api).
 * Loads apps/api/.env when present. Does not print authkey.
 * Usage:
 *   node scripts/test-msg91-otp.cjs [phone]
 *   node scripts/test-msg91-otp.cjs --api [graphqlUrl] [phone]
 * Env: MSG91_AUTH_KEY, MSG91_SENDER (optional, default SMSIND); for --api use SMS_PROVIDER=msg91 on the API.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const API_ENV = path.join(REPO_ROOT, 'apps/api/.env');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) {
      continue;
    }
    const eq = t.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function parseArgs(argv) {
  const useApi = argv.includes('--api');
  const rest = argv.filter((a) => a !== '--api');
  let graphqlUrl = process.env.API_GRAPHQL_URL || 'http://localhost:3333/graphql';
  let phoneArg;
  if (useApi && rest[0] && rest[0].startsWith('http')) {
    graphqlUrl = rest.shift();
  }
  phoneArg = rest[0] || process.env.TEST_PHONE || '9963730111';
  return { useApi, graphqlUrl, phoneArg };
}

function normalizePhone10(input) {
  const d = String(input).replace(/\D/g, '');
  return d.length >= 10 ? d.slice(-10) : d;
}

async function sendViaMsg91Direct(local10, message, otp) {
  const authkey = process.env.MSG91_AUTH_KEY?.trim();
  if (!authkey) {
    console.error('Missing MSG91_AUTH_KEY. Add to apps/api/.env or export it.');
    process.exit(1);
  }
  const sender = (process.env.MSG91_SENDER ?? 'SMSIND').trim();
  const mobile = `91${local10}`;
  const url = `https://api.msg91.com/api/sendotp.php?authkey=${encodeURIComponent(authkey)}&mobile=${encodeURIComponent(mobile)}&sender=${encodeURIComponent(sender)}&message=${encodeURIComponent(message)}&otp=${encodeURIComponent(otp)}`;
  const res = await fetch(url, { method: 'GET' });
  const text = await res.text();
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    // keep raw
  }
  return { res, text, parsed };
}

async function sendViaApi(graphqlUrl, phone) {
  const query = `mutation ($input: SendOtpInput!) {
    sendOtp(input: $input) { success message }
  }`;
  const body = JSON.stringify({
    query,
    variables: { input: { phone: phone.replace(/\D/g, '').slice(-10) } },
  });
  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
  }
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }
  return json.data?.sendOtp;
}

async function main() {
  loadEnvFile(API_ENV);

  const argv = process.argv.slice(2);
  const { useApi, graphqlUrl, phoneArg } = parseArgs(argv);
  const local10 = normalizePhone10(phoneArg);
  if (local10.length !== 10) {
    console.error('Need 10-digit Indian mobile.');
    process.exit(1);
  }

  if (useApi) {
    console.log('Mode: GraphQL sendOtp (API must use SMS_PROVIDER=msg91)');
    console.log('URL:', graphqlUrl);
    console.log('Phone (local):', local10);
    try {
      const result = await sendViaApi(graphqlUrl, phoneArg);
      console.log('sendOtp result:', result);
    } catch (e) {
      console.error('sendOtp failed:', e.message || e);
      process.exit(1);
    }
    return;
  }

  console.log('Mode: direct MSG91 sendotp.php (not stored in app OTP store)');
  const testCode = String(Math.floor(100000 + Math.random() * 900000));
  const message = `UrbanNest.ai MSG91 test: ${testCode}. Script-only (not valid for app login).`;
  console.log('Mobile:', `91${local10}`);
  console.log('OTP param:', testCode);
  console.log('Sender:', (process.env.MSG91_SENDER ?? 'SMSIND').trim());

  try {
    const { res, text, parsed } = await sendViaMsg91Direct(local10, message, testCode);
    const preview = text.length > 400 ? `${text.slice(0, 400)}…` : text;
    console.log('HTTP status:', res.status, res.ok ? 'ok' : 'not ok');
    console.log('Body:', parsed ?? preview);
    if (parsed?.type === 'success') {
      console.log('Done — check the handset for the SMS.');
    } else {
      console.error(
        'MSG91 did not return success. Ensure OTP template/sender is approved in MSG91 (legacy sendotp.php).',
      );
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
