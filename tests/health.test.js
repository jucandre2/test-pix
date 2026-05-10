const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const { withServer, requestJson } = require('./helpers');

const app = createApp();

test('GET /health returns ok', async () => {
  await withServer(app, async (server) => {
    const response = await requestJson(server, 'GET', '/health');

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { status: 'ok' });
  });
});
