import assert from 'node:assert/strict';

import { fetchEnvironment, policy } from './with-doppler';

const selected = [
  'MEDIA_R2_BUCKET',
  'CLOUDFLARE_ACCOUNT_ID',
  'MEDIA_R2_ACCESS_KEY_ID',
  'MEDIA_R2_SECRET_ACCESS_KEY',
];
const env = {
  GITHUB_ACTIONS: 'true',
  GITHUB_REPOSITORY: 'clzmj/clzmj.dev',
  GITHUB_REF: 'refs/heads/main',
  DOPPLER_TOKEN: 'dp.st.test-only',
  CLOUDFLARE_API_TOKEN: 'inherited-unselected-value',
};
const values: Record<string, string> = {
  ...Object.fromEntries(policy.secrets.map((name) => [name, `test-${name}`])),
  DOPPLER_PROJECT: 'clzmj-dev',
  DOPPLER_CONFIG: 'ci',
  DOPPLER_ENVIRONMENT: 'ci',
};
const masks: string[] = [];
const child = await fetchEnvironment({
  config: 'ci',
  names: selected,
  env,
  fetcher: async (input) => {
    const url = new URL(String(input));
    assert.equal(url.origin, 'https://api.doppler.com');
    assert.equal(url.searchParams.get('project'), 'clzmj-dev');
    assert.deepEqual(url.searchParams.get('secrets')?.split(','), [
      ...selected,
      'DOPPLER_PROJECT',
      'DOPPLER_CONFIG',
      'DOPPLER_ENVIRONMENT',
    ]);
    return Response.json(values);
  },
  mask: (value) => {
    masks.push(value);
  },
});
assert.equal(child.DOPPLER_TOKEN, undefined);
assert.equal(child.CLOUDFLARE_API_TOKEN, undefined);
assert.equal(child.MEDIA_R2_BUCKET, values.MEDIA_R2_BUCKET);
assert.deepEqual(
  masks,
  selected.map((name) => values[name]),
);
await assert.rejects(
  fetchEnvironment({ config: 'prd', env: { ...env, GITHUB_REF: 'refs/pull/1/merge' } }),
  /Production requires main/,
);
await assert.rejects(
  fetchEnvironment({ config: 'ci', names: ['UNEXPECTED'], env }),
  /Unexpected runtime secret/,
);
await assert.rejects(
  fetchEnvironment({
    config: 'ci',
    env,
    fetcher: async () => Response.json({ ...values, DOPPLER_PROJECT: 'another-project' }),
  }),
  /token\/config mismatch/,
);
console.log('Runtime secret policy checks passed');
