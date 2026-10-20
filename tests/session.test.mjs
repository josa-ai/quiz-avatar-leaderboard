import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync('src/lib/session.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function session(initial = {}) {
  const local = new Map(Object.entries(initial)); const transient = new Map();
  const storage = map => ({ getItem: key => map.get(key) ?? null, setItem: (k, v) => map.set(k, v), removeItem: key => map.delete(key) });
  const localStorage = storage(local); const sessionStorage = storage(transient); const exports = {};
  vm.runInNewContext(code, { exports, localStorage, sessionStorage, window: { localStorage, sessionStorage } });
  return { ...exports, local, transient };
}

test('a cached demo or forged administrator object never becomes a session', () => {
  for (const id of ['demo-123', 'fake-registered-id']) {
    const app = session({ finalexam_user: JSON.stringify({ id, isAdmin: true, email: 'fake@example.invalid' }) });
    assert.equal(app.readSessionToken(), null);
    assert.equal(app.local.has('finalexam_user'), false);
  }
});

test('valid token restoration ignores a conflicting cached identity', () => {
  const app = session({ finalexam_user: JSON.stringify({ id: 'wrong', isAdmin: true }), finalexam_token: 'token-to-validate-on-server' });
  assert.equal(app.readSessionToken(), 'token-to-validate-on-server');
  assert.equal(app.local.has('finalexam_user'), false);
});

test('administrator tokens are tab-scoped and profiles are never persisted', () => {
  const app = session({ finalexam_token: 'old-normal-token' });
  app.storeSession({ isAdmin: true, fullName: 'Private Name', email: 'private@example.invalid' }, 'admin-token');
  assert.equal(app.local.size, 0);
  assert.equal(app.transient.get('finalexam_token'), 'admin-token');
  assert.equal(app.readSessionToken(), 'admin-token');
  app.clearSession();
  assert.equal(app.readSessionToken(), null);
});

test('normal sessions persist across browser visits and replace stale administrator tokens', () => {
  const app = session();
  app.storeSession({ isAdmin: true }, 'admin-token');
  app.storeSession({ isAdmin: false }, 'player-token');
  assert.equal(app.transient.size, 0);
  assert.equal(app.local.get('finalexam_token'), 'player-token');
  assert.equal(app.local.has('finalexam_user'), false);
});
