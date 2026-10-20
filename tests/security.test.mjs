import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { webcrypto, pbkdf2Sync, createHash, createHmac } from 'node:crypto';
import ts from 'typescript';

// Execute the actual Edge Function handler with a deterministic database double.
// Live REST grants/RLS are verified separately against the deployed project.
const source = fs.readFileSync(process.env.GAME_API_SOURCE || 'supabase/functions/game-api/index.ts', 'utf8');
const code = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
} }).outputText;

function harness({ users = [], leaderboard = [], dbError = null, rateError = false, beforeUpdate } = {}) {
  users.forEach(u => { u.auth_version ??= 0; u.is_admin ??= false; });
  const attempts = new Map();
  let handler;
  const queries = [];
  const client = {
    async rpc(name, args) {
      if (rateError) return { data: null, error: { message: 'rate database unavailable' } };
      const count = (attempts.get(args.p_key) || 0) + 1;
      attempts.set(args.p_key, count);
      return { data: { allowed: count <= args.p_limit, retry_after: 900 }, error: null };
    },
    from(table) {
    const q = { table, operation: 'select', filters: [], projection: null, value: null };
    queries.push(q);
    const builder = {
      select(projection) { q.projection = projection; return builder; },
      insert(value) { q.operation = 'insert'; q.value = value; return builder; },
      update(value) { q.operation = 'update'; q.value = value; return builder; },
      eq(key, value) { q.filters.push([key, value]); return builder; },
      ilike(key, value) {
        let source = '^';
        for (let i = 0; i < value.length; i++) {
          let char = value[i];
          if (char === '\\' && i + 1 < value.length) char = value[++i];
          else if (char === '%') { source += '.*'; continue; }
          else if (char === '_') { source += '.'; continue; }
          source += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        q.pattern = [key, new RegExp(source + '$', 'i')];
        return builder;
      },
      range(start, end) { q.range = [start, end]; return builder; },
      or(value) { q.rawFilter = value; return builder; },
      order() { return builder; }, limit() { return builder; }, gte() { return builder; },
      single() { q.single = true; return builder; },
      then(resolve, reject) {
        try {
          if (dbError) return Promise.resolve({ data: null, error: dbError }).then(resolve, reject);
          if (table === 'leaderboard_entries') return Promise.resolve({ data: leaderboard, error: null }).then(resolve, reject);
          if (q.operation === 'update' && beforeUpdate) beforeUpdate(q, users);
          let rows = table === 'users' ? users.filter(u => q.filters.every(([key, value]) => (key === 'email_normalized' ? u.email.toLowerCase() : u[key]) === value)
            && (!q.pattern || q.pattern[1].test(u[q.pattern[0]]))) : [];
          if (q.operation === 'insert') {
            if (users.some(u => u.email.toLowerCase() === q.value.email.toLowerCase() || u.username === q.value.username)) {
              return Promise.resolve({ data: null, error: { code: '23505', message: 'private constraint detail' } }).then(resolve, reject);
            }
            const row = { id: webcrypto.randomUUID(), auth_version: 0, is_admin: false, ...q.value };
            users.push(row); rows = [row];
          }
          if (q.operation === 'update') rows.forEach(u => Object.assign(u, q.value));
          if (q.range) rows = rows.slice(q.range[0], q.range[1] + 1);
          return Promise.resolve({ data: q.single ? (rows[0] ? { ...rows[0] } : undefined) : rows.map(row => ({ ...row })), error: null }).then(resolve, reject);
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
      return { status: res.status, headers: res.headers, body: await res.json() };
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
      for (const key of ['email', 'password_hash', 'token', 'fullName', 'full_name', 'isAdmin', 'marketing_opt_in']) assert.equal(key in entry.user, false);
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
    const app = harness({ users: [{ id: '10000000-0000-4000-8000-000000000001', username: 'Existing', email: 'existing@example.invalid', password_hash }] });
    const bad = await app.call('login', { email: 'existing@example.invalid', password: 'wrong' });
    assert.equal(bad.status, 401);
    const login = await app.call('login', { email: 'existing@example.invalid', password });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.id, '10000000-0000-4000-8000-000000000001');
    assert.equal(login.body.user.email, 'existing@example.invalid');
    assert.equal('password_hash' in login.body.user, false);
    const own = await app.call('getUserStats', {}, login.body.token);
    assert.equal(own.status, 200);
    assert.equal(own.body.user.id, '10000000-0000-4000-8000-000000000001');
    assert.match(app.users[0].password_hash, /^pbkdf2:600000:/);
  });
}

test('registration treats filter punctuation literally and handles duplicates without leaking DB details', async () => {
  const app = harness();
  const input = { email: 'canary@example.invalid', fullName: 'x,email.like.*', adultConfirmed: true, marketingOptIn: false, password: 'Canary-pass-123' };
  const result = await app.call('register', input);
  assert.equal(result.status, 200);
  assert.equal(result.body.user.fullName, input.fullName);
  assert.match(result.body.user.username, /^Player-[0-9a-f]{16}$/);
  assert.equal('password_hash' in result.body.user, false);
  assert.equal(app.queries.some(q => q.rawFilter), false);
  const duplicate = await app.call('register', input);
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.error, 'An account already uses this email. Please log in.');
});

test('public database failures do not return sensitive error details', async () => {
  const app = harness({ dbError: { message: 'private@example.invalid secret-hash detail', code: 'XX000' } });
  for (const [action, data] of [
    ['getLeaderboard', {}], ['register', { email: 'new@example.invalid', fullName: 'New', password: 'Password-123456', adultConfirmed: true, marketingOptIn: false }],
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

function fixture(overrides = {}) {
  const salt = '22'.repeat(16);
  return {
    id: webcrypto.randomUUID(), email: 'tester@example.invalid', username: 'PublicPlayer', full_name: 'Private Tester',
    is_admin: false, auth_version: 0,
    password_hash: `pbkdf2:600000:${salt}:${pbkdf2Sync('Fixture-password-123', Buffer.from(salt, 'hex'), 600000, 32, 'sha256').toString('hex')}`,
    ...overrides,
  };
}

function signedToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.${createHmac('sha256', 'test-only-signing-key').update(`${header}.${body}`).digest('base64url')}`;
}

test('registration requires real tester fields, preserves passwords literally, and cannot grant roles', async () => {
  const app = harness();
  const valid = { fullName: 'Adult Tester', email: 'Adult@Example.invalid', password: '  A long passphrase  ', adultConfirmed: true, marketingOptIn: false };
  for (const invalid of [{ fullName: '' }, { fullName: 'bad\nname' }, { adultConfirmed: false }, { marketingOptIn: 'true' }, { password: 'short' }]) {
    assert.equal((await harness().call('register', { ...valid, ...invalid })).status, 400);
  }
  const registered = await app.call('register', { ...valid, is_admin: true, isAdmin: true, auth_version: 99, username: 'Private Admin' });
  assert.equal(registered.status, 200);
  assert.equal(registered.body.user.isAdmin, false);
  assert.equal(registered.body.user.email, valid.email.toLowerCase());
  assert.equal(app.users[0].marketing_opt_in, false);
  assert.ok(app.users[0].consent_recorded_at);
  assert.equal(app.users[0].consent_version, 'project-updates-v1');
  assert.equal((await app.call('login', { email: valid.email.toUpperCase(), password: valid.password })).status, 200);
});

test('email wildcard characters are literal in login; mixed-case legacy emails still work', async () => {
  const user = fixture({ email: 'Case_User@example.invalid' });
  const app = harness({ users: [user] });
  assert.equal((await app.call('login', { email: '%@example.invalid', password: 'Fixture-password-123' })).status, 401);
  assert.equal((await app.call('login', { email: '*@example.invalid', password: 'Fixture-password-123' })).status, 401);
  assert.equal((await app.call('login', { email: 'case_user@EXAMPLE.INVALID', password: 'Fixture-password-123' })).status, 200);
});

test('strict tokens preserve legacy format, reject malformed claims, deleted accounts and revoked versions', async () => {
  const user = fixture(); const app = harness({ users: [user] });
  const valid = { userId: user.id, exp: Math.floor(Date.now() / 1000) + 3600 };
  assert.equal((await app.call('getUserStats', {}, signedToken(valid))).status, 200);
  for (const invalid of [{ exp: undefined }, { exp: 'later' }, { exp: 0 }, { userId: {} }, { userId: 'demo-123' }, { version: -1 }, { version: '0' }, { version: 3 }, { userId: webcrypto.randomUUID() }]) {
    assert.equal((await app.call('getUserStats', {}, signedToken({ ...valid, ...invalid }))).status, 401);
  }
  user.auth_version = 1;
  assert.equal((await app.call('getUserStats', {}, signedToken(valid))).status, 401);
});

test('admin export rechecks database role and password; ignores client role and user id', async () => {
  const normal = fixture(); const admin = fixture({ email: 'admin@example.invalid', is_admin: true });
  const app = harness({ users: [normal, admin] });
  const token = signedToken({ userId: normal.id, exp: Date.now() / 1000 + 3600 });
  assert.equal((await app.call('exportContacts', { isAdmin: true, userId: admin.id, password: 'Fixture-password-123' }, token)).status, 403);
  const adminToken = signedToken({ userId: admin.id, exp: Date.now() / 1000 + 3600 });
  assert.equal((await app.call('exportContacts', { password: 'wrong' }, adminToken)).status, 403);
  const exported = await app.call('exportContacts', { password: 'Fixture-password-123' }, adminToken);
  assert.equal(exported.status, 200);
  assert.equal(exported.body.count, 1);
  assert.doesNotMatch(exported.body.csv, /admin@example|password_hash|pbkdf2|Fixture-password/);
  assert.equal(exported.headers.get('cache-control'), 'no-store');
  admin.is_admin = false;
  assert.equal((await app.call('exportContacts', { password: 'Fixture-password-123' }, adminToken)).status, 403);
});

test('CSV paginates and safely escapes names, international text, formulas, and recorded preferences', async () => {
  const admin = fixture({ email: 'admin@example.invalid', is_admin: true });
  const users = Array.from({ length: 1001 }, (_, i) => ({ id: webcrypto.randomUUID(), email: `person${i}@example.invalid`, full_name: 'Jane, "Q" García', is_admin: false, marketing_opt_in: null }));
  users[0].full_name = ' =HYPERLINK("bad")';
  users[1].marketing_opt_in = true;
  users[2].marketing_opt_in = false;
  const app = harness({ users: [admin, ...users] });
  const token = signedToken({ userId: admin.id, exp: Date.now() / 1000 + 3600 });
  const result = await app.call('exportContacts', { password: 'Fixture-password-123' }, token);
  assert.equal(result.body.count, 1001);
  assert.equal(result.body.csv.charCodeAt(0), 0xFEFF);
  assert.ok(result.body.csv.includes('"\' =HYPERLINK(""bad"")"'));
  assert.ok(result.body.csv.includes('"Jane, ""Q"" García"'));
  assert.match(result.body.csv, /Not recorded/);
  assert.ok(app.queries.filter(q => q.range).length === 2);
  const only = await app.call('exportContacts', { password: 'Fixture-password-123', optedInOnly: true }, token);
  assert.equal(only.body.count, 1);
  assert.match(only.body.csv, /person1@example.invalid/);
});

test('temporary admin cannot export until changing password; password change and logout revoke old tokens', async () => {
  const admin = fixture({ is_admin: true, must_change_password: true });
  const app = harness({ users: [admin] });
  const token = signedToken({ userId: admin.id, exp: Date.now() / 1000 + 3600 });
  assert.equal((await app.call('getUserStats', {}, token)).body.user.mustChangePassword, true);
  assert.equal((await app.call('exportContacts', { password: 'Fixture-password-123' }, token)).status, 403);
  assert.equal((await app.call('changePassword', { currentPassword: 'wrong', newPassword: 'New-admin-passphrase-123' }, token)).status, 403);
  const changed = await app.call('changePassword', { currentPassword: 'Fixture-password-123', newPassword: 'New-admin-passphrase-123' }, token);
  assert.equal(changed.status, 200);
  assert.equal(changed.body.user.mustChangePassword, false);
  assert.equal((await app.call('getUserStats', {}, token)).status, 401);
  assert.equal((await app.call('exportContacts', { password: 'New-admin-passphrase-123' }, changed.body.token)).status, 200);
  assert.equal((await app.call('logout', {}, changed.body.token)).status, 200);
  assert.equal((await app.call('getUserStats', {}, changed.body.token)).status, 401);
});

test('durable attempt limits reject repeated authentication and fail closed on database failure', async () => {
  const app = harness();
  for (let i = 0; i < 10; i++) assert.equal((await app.call('login', { email: 'missing@example.invalid', password: 'wrong' })).status, 401);
  const limited = await app.call('login', { email: 'missing@example.invalid', password: 'wrong' });
  assert.equal(limited.status, 429);
  assert.ok(limited.headers.get('retry-after'));
  const unavailable = harness({ rateError: true });
  assert.equal((await unavailable.call('login', { email: 'a@example.invalid', password: 'wrong' })).status, 503);
  assert.equal(unavailable.queries.length, 0);
});

test('an in-flight legacy login cannot restore a password replaced by another session', async () => {
  const salt = '33'.repeat(16);
  const oldHash = `${salt}:${createHash('sha256').update(salt + 'Fixture-password-123').digest('hex')}`;
  const replacement = fixture().password_hash;
  const user = fixture({ password_hash: oldHash });
  const app = harness({ users: [user], beforeUpdate(query, rows) {
    if (query.value.password_hash && !('auth_version' in query.value)) {
      rows[0].password_hash = replacement;
      rows[0].auth_version = 1;
    }
  } });
  const stale = await app.call('login', { email: user.email, password: 'Fixture-password-123' });
  assert.equal(stale.status, 401);
  assert.equal(user.password_hash, replacement);
  assert.equal(user.auth_version, 1);
});
