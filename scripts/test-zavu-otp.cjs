#!/usr/bin/env node
/**
 * @file test-zavu-otp.cjs
 * @description One-off test: send SMS via Zavu to a phone (default +91 9963730111), or call API sendOtp (--api).
 * Loads apps/api/.env when present (does not print secrets).
 * Usage:
 *   node scripts/test-zavu-otp.cjs [phone]
 *   node scripts/test-zavu-otp.cjs --api [graphqlUrl] [phone]
 * Env: ZAVUDEV_API_KEY, optional ZAVUDEV_SENDER; for --api also ensure API runs with SMS_PROVIDER=zavu.
 */

const fs = require('fs');
const path = require('path');
const { Zavudev, APIError } = require('@zavudev/sdk');

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

function toE164India(input) {
  const d = String(input).replace(/\D/g, '');
  const local = d.length >= 10 ? d.slice(-10) : d;
  if (local.length !== 10) {
    throw new Error(`Expected 10-digit Indian mobile, got: ${input}`);
  }
  return `+91${local}`;
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

async function sendViaZavuDirect(e164, text) {
  const apiKey = process.env.ZAVUDEV_API_KEY?.trim();
  if (!apiKey) {
    console.error('Missing ZAVUDEV_API_KEY. Add to apps/api/.env or export it.');
    process.exit(1);
  }
  const sender = process.env.ZAVUDEV_SENDER?.trim();
  const client = new Zavudev({ apiKey });
  const params = {
    to: e164,
    channel: 'sms',
    text,
    idempotencyKey: `manual-zavu-test-${Date.now()}`,
  };
  if (sender) {
    params['Zavu-Sender'] = sender;
  }
  const res = await client.messages.send(params);
  return res;
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
  const e164 = toE164India(phoneArg);

  if (useApi) {
    console.log('Mode: GraphQL sendOtp');
    console.log('URL:', graphqlUrl);
    console.log('Phone (local):', phoneArg.replace(/\D/g, '').slice(-10));
    try {
      const result = await sendViaApi(graphqlUrl, phoneArg);
      console.log('sendOtp result:', result);
      console.log('If success is true, check SMS (OTP from UrbanNest template).');
    } catch (e) {
      console.error('sendOtp failed:', e.message || e);
      process.exit(1);
    }
    return;
  }

  console.log('Mode: direct Zavu SDK (SMS only, not stored in app OTP store)');
  const testCode = String(Math.floor(100000 + Math.random() * 900000));
  const text = `UrbanNest.ai Zavu test: ${testCode}. Script-only message (not valid for app login).`;
  console.log('To:', e164);
  console.log('Code in message:', testCode);

  try {
    const res = await sendViaZavuDirect(e164, text);
    console.log('Zavu response:', {
      id: res.message?.id,
      status: res.message?.status,
      channel: res.message?.channel,
    });
    console.log('Done — check the handset for the SMS.');
  } catch (err) {
    if (err instanceof APIError) {
      console.error('Zavu APIError:', err.status, err.message);
      if (err.status === 400 && String(err.message).toLowerCase().includes('sms')) {
        console.error(
          'Hint: In Zavu, assign a phone number to the project/sender and use ZAVUDEV_SENDER if you use a specific sender ID.',
        );
      }
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

main();
