import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync('src/lib/gameService.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

test('a delayed unauthorized response cannot erase a newer login or password-change session', async () => {
  const requests = []; const exports = {}; let expired = 0;
  const supabase = { functions: { invoke(name, options) {
    return new Promise(resolve => requests.push({ options, resolve }));
  } } };
  vm.runInNewContext(code, { exports, Event,
    require: id => id.includes('supabase') ? { supabase } : { mockLeaderboard: [] },
    window: { dispatchEvent: () => expired++ }, console: { error() {} },
  });
  const unauthorized = { data: null, error: { message: 'unauthorized', context: { status: 401, async json() { return { error: 'Sign in again' }; } } } };
  exports.setAuthToken('old-token');
  const old = exports.getTeams();
  exports.setAuthToken('new-token');
  requests[0].resolve(unauthorized);
  await old;
  assert.equal(expired, 0);
  const next = exports.getTeams();
  assert.equal(requests[1].options.headers['x-app-token'], 'new-token');
  requests[1].resolve(unauthorized);
  await next;
  assert.equal(expired, 1);
});
