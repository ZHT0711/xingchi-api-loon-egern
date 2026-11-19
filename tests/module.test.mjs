import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import { parseDocument } from 'yaml';

const read = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const source = read('xingchi.egern.js');
const loon = read('xingchi.loon.js');
const moduleSource = read('xingchi.egern.yaml');
const rawRoot = 'https://raw.githubusercontent.com/ZHT0711/xingchi-api-loon-egern/refs/heads/main/';
const document = parseDocument(moduleSource, { uniqueKeys: true });
const config = document.toJS();
const entries = () => config.scriptings.map(entry => {
  assert.equal(Object.keys(entry).length, 1);
  const [type, script] = Object.entries(entry)[0];
  assert.ok(['http_request', 'http_response', 'schedule', 'generic'].includes(type));
  return { type, ...script };
});

test('default Egern module uses basic fields and excludes the reported env_schema field', () => {
  assert.deepEqual(document.errors, []);
  assert.equal(Object.hasOwn(config, 'env_schema'), false);
  const allowed = new Set(['name', 'description', 'icon', 'open_url', 'scriptings', 'mitm']);
  for (const field of Object.keys(config)) assert.ok(allowed.has(field), field);
});

test('every Egern task downloads the hosted JS without local imports', () => {
  assert.equal(entries().length, 4);
  for (const entry of entries()) {
    assert.equal(entry.script_url, rawRoot + 'xingchi.egern.js');
    assert.ok(Number.isInteger(entry.timeout) && entry.timeout > 0 && entry.timeout <= 600);
  }
  const schedule = entries().find(entry => entry.type === 'schedule');
  assert.equal(schedule.cron, '0 9 * * *');
  assert.ok(entries().some(entry => entry.type === 'generic' && entry.name === '星驰 API 手动签到'));
});

test('Egern capture rules match only the expected login host and retain response bodies', () => {
  const request = entries().find(entry => entry.type === 'http_request');
  const response = entries().find(entry => entry.type === 'http_response');
  const requestPattern = new RegExp(request.match);
  const responsePattern = new RegExp(response.match);
  assert.ok(requestPattern.test('https://xingchiapi.com/api/v1/auth/me'));
  assert.ok(requestPattern.test('https://xingchiapi.com/api/v1/auth/me?timezone=Asia%2FShanghai'));
  for (const path of ['login', 'refresh', '2fa/verify']) {
    assert.ok(responsePattern.test('https://xingchiapi.com/api/v1/auth/' + path));
  }
  assert.equal(requestPattern.test('https://xingchiapi.com.evil.test/api/v1/auth/me'), false);
  assert.equal(responsePattern.test('https://xingchiapi.com.evil.test/api/v1/auth/login'), false);
  assert.equal(response.body_required, true);
  assert.deepEqual(config.mitm.hostnames.includes, ['xingchiapi.com']);
});

test('Loon uses hosted JS and the same cron/then-script form as the original plugin', () => {
  const plugin = read('xingchi.loon.lpx');
  const references = [...plugin.matchAll(/script\("([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(references, Array(3).fill(rawRoot + 'xingchi.loon.js'));
  assert.ok(plugin.includes('cron "0 9 * * *" then script("' + rawRoot));
});

test('both mobile files embed the same actual implementation', () => {
  const implementation = text => text.slice(text.indexOf('function createXingchi(io)')).replaceAll('\r\n', '\n');
  assert.equal(implementation(loon), implementation(source));
});

test('Egern entry is valid ES module syntax and Loon is valid standalone JS', async () => {
  const module = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  assert.equal(typeof module.default, 'function');
  assert.doesNotThrow(() => new vm.Script(loon));
});

test('Egern captures a browser login then runs check-in without environment settings', async () => {
  const module = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const saved = new Map();
  const notifications = [];
  const calls = [];
  const context = {
    storage: { get: key => saved.get(key), set: (key, value) => saved.set(key, value) },
    notify: notice => notifications.push(notice),
    http: { get: async url => {
      calls.push(url);
      const data = url.includes('/user/checkin?')
        ? { enabled: true, claimed_today: true, total_count: 2, total_amount: 4 }
        : { balance: 5 };
      return { status: 200, text: async () => JSON.stringify({ code: 0, data }) };
    } }
  };
  const body = JSON.stringify({ code: 0, data: {
    access_token: 'mock-browser-access', refresh_token: 'mock-browser-refresh', expires_in: 3600, user: { id: 1 }
  } });
  const result = await module.default({ ...context,
    request: { url: 'https://xingchiapi.com/api/v1/auth/login', headers: new Headers() },
    response: { status: 200, text: async () => body }
  });
  assert.equal(result.body, body);
  await module.default(context);
  assert.equal(notifications.at(-1).subtitle, '今日已签到');
  assert.equal(calls.length, 2);
});
