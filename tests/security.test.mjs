import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { webcrypto, pbkdf2Sync, createHash } from 'node:crypto';
import ts from 'typescript';

// Execute the actual Edge Function handler with a deterministic database double.
// Live REST grants/RLS are verified separately against the deployed project.
const source = fs.readFileSync(process.env.GAME_API_SOURCE || 'supabase/functions/game-api/index.ts', 'utf8');
const code = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
} }).outputText;

function harness({ users = [], leaderboard = [], dbError = null } = {}) {
  let handler;
  const queries = [];
  const client = { from(table) {
    const q = { table, operation: 'select', filters: [], projection: null, value: null };
    queries.push(q);
    const builder = {
      select(projection) { q.projection = projection; return builder; },
      insert(value) { q.operation = 'insert'; q.value = value; return builder; },
      update(value) { q.operation = 'update'; q.value = value; return builder; },
      eq(key, value) { q.filters.push([key, value]); return builder; },
      or(value) { q.rawFilter = value; return builder; },
      order() { return builder; }, limit() { return builder; }, gte() { return builder; },
      single() { q.single = true; return builder; },
      then(resolve, reject) {
        try {
          if (dbError) return Promise.resolve({ data: null, error: dbError }).then(resolve, reject);
          if (table === 'leaderboard_entries') return Promise.resolve({ data: leaderboard, error: null }).then(resolve, reject);
          let rows = users.filter(u => q.filters.every(([key, value]) => u[key] === value));
          if (q.operation === 'insert') {
            if (users.some(u => u.email === q.value.email || u.username === q.value.username)) {
              return Promise.resolve({ data: null, error: { code: '23505', message: 'private constraint detail' } }).then(resolve, reject);
            }
            const row = { id: webcrypto.randomUUID(), ...q.value };
            users.push(row); rows = [row];
          }
          if (q.operation === 'update') rows.forEach(u => Object.assign(u, q.value));
          return Promise.resolve({ data: q.single ? rows[0] : rows, error: null }).then(resolve, reject);
        } catch (error) { return Promise.reject(error).then(resolve, reject); }
      },
    };
    return builder;
  } };
  vm.runInNewContext(code, {
    exports: {}, require: id => id.includes('supabase-js') ? { createClient: () => client } : {},
    Deno: { env: { get: key => key === 'SUPABASE_URL' ? 'https://test.invalid' : 'test-only-signing-key' }, serve: fn => { handler = fn; } },
    crypto: webcrypto, TextEncoder, TextDecoder, Request, Response, atob, btoa,
    console: { error() {} },
  });
  return {
    users, queries,
    async call(action, data = {}, token) {
      const res = await handler(new Request('https://test.invalid', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'x-app-token': token } : {}) },
        body: JSON.stringify({ action, data }),
      }));
      return { status: res.status, body: await res.json() };
    },
  };
}

test('all public leaderboard periods allowlist profiles, including unknown users', async () => {
  const app = harness({ leaderboard: [
    { score: 100, created_at: '2026-01-01', users: { id: 'player', username: 'Player', email: 'private@example.invalid', password_hash: 'private-hash', token: 'private-token', total_points: 200 } },
    { score: 50, created_at: '2026-01-01', users: null },
  ] });
  for (const period of ['all_time', 'weekly', 'daily']) {
    const result = await app.call('getLeaderboard', { period });
    assert.equal(result.status, 200);
    assert.equal(result.body.leaderboard[0].user.username, 'Player');
    assert.equal(result.body.leaderboard[0].score, 100);
    for (const entry of result.body.leaderboard) {
      for (const key of ['email', 'password_hash', 'token']) assert.equal(key in entry.user, false);
    }
    assert.doesNotMatch(app.queries.at(-1).projection, /email|password_hash|\*/);
  }
});

for (const legacy of [false, true]) {
  test(`${legacy ? 'legacy' : 'PBKDF2'} account login preserves identity and returns only own safe profile`, async () => {
    const password = 'Existing-account-test-123';
    const salt = '11'.repeat(16);
    const password_hash = legacy
      ? `${salt}:${createHash('sha256').update(salt + password).digest('hex')}`
      : `pbkdf2:600000:${salt}:${pbkdf2Sync(password, Buffer.from(salt, 'hex'), 600000, 32, 'sha256').toString('hex')}`;
    const app = harness({ users: [{ id: 'existing-player', username: 'Existing', email: 'existing@example.invalid', password_hash }] });
    const bad = await app.call('login', { email: 'existing@example.invalid', password: 'wrong' });
    assert.equal(bad.status, 401);
    const login = await app.call('login', { email: 'existing@example.invalid', password });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.id, 'existing-player');
    assert.equal(login.body.user.email, 'existing@example.invalid');
    assert.equal('password_hash' in login.body.user, false);
    const own = await app.call('getUserStats', {}, login.body.token);
    assert.equal(own.status, 200);
    assert.equal(own.body.user.id, 'existing-player');
    assert.match(app.users[0].password_hash, /^pbkdf2:600000:/);
  });
}

test('registration treats filter punctuation literally and handles duplicates without leaking DB details', async () => {
  const app = harness();
  const input = { email: 'canary@example.invalid', username: 'x,email.like.*', password: 'Canary-pass-123' };
  const result = await app.call('register', input);
  assert.equal(result.status, 200);
  assert.equal(result.body.user.username, input.username);
  assert.equal('password_hash' in result.body.user, false);
  assert.equal(app.queries.some(q => q.rawFilter), false);
  const duplicate = await app.call('register', input);
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.error, 'Email or username already taken');
});

test('public database failures do not return sensitive error details', async () => {
  const app = harness({ dbError: { message: 'private@example.invalid secret-hash detail', code: 'XX000' } });
  for (const [action, data] of [
    ['getLeaderboard', {}], ['register', { email: 'new@example.invalid', username: 'New', password: 'Password-123' }],
  ]) {
    const result = await app.call(action, data);
    assert.equal(result.status, 500);
    assert.doesNotMatch(JSON.stringify(result.body), /private@example|secret-hash|detail/);
  }
});

test('private actions reject absent or invalid custom tokens before any database query', async () => {
  const app = harness();
  for (const action of ['getUserStats', 'getTeams', 'getChallenges', 'updateProfile', 'saveGameSession']) {
    for (const token of [undefined, 'invalid.token.value']) {
      assert.equal((await app.call(action, {}, token)).status, 401);
    }
  }
  assert.equal(app.queries.length, 0);
});
