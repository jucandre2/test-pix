const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const { createPaymentService } = require('../src/services/paymentService');
const { createPaymentStore } = require('../src/db/paymentStore');
const { withServer, requestJson } = require('./helpers');

test('POST /payments creates payment and updates balance', async () => {
  const store = createPaymentStore();
  const service = createPaymentService({ paymentStore: store });
  const app = createApp({ paymentService: service });

  await withServer(app, async (server) => {
    const response = await requestJson(server, 'POST', '/payments', {
      userId: 'user-1',
      amount: 150
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.userId, 'user-1');
    assert.equal(typeof response.body.transactionId, 'string');
    assert.equal(response.body.updatedBalance, 850);
  });
});

test('POST /payments returns the same payment for the same idempotency key', async () => {
  const store = createPaymentStore();
  const service = createPaymentService({ paymentStore: store });
  const app = createApp({ paymentService: service });

  await withServer(app, async (server) => {
    const firstResponse = await requestJson(server, 'POST', '/payments', {
      userId: 'user-4',
      amount: 75,
      idempotencyKey: 'payment-key-1'
    });

    const repeatedResponse = await requestJson(server, 'POST', '/payments', {
      userId: 'user-4',
      amount: 999,
      idempotencyKey: 'payment-key-1'
    });

    assert.equal(firstResponse.statusCode, 201);
    assert.equal(repeatedResponse.statusCode, 201);
    assert.deepEqual(repeatedResponse.body, firstResponse.body);
  });
});

test('GET /payments/:id returns stored payment', async () => {
  const store = createPaymentStore();
  const service = createPaymentService({ paymentStore: store });
  const app = createApp({ paymentService: service });

  await withServer(app, async (server) => {
    const created = await requestJson(server, 'POST', '/payments', {
      userId: 'user-2',
      amount: 200
    });

    const response = await requestJson(server, 'GET', `/payments/${created.body.transactionId}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.transactionId, created.body.transactionId);
    assert.equal(response.body.userId, 'user-2');
    assert.equal(response.body.updatedBalance, 800);
  });
});

test('POST /payments rejects invalid amount', async () => {
  const app = createApp({ paymentService: createPaymentService({ paymentStore: createPaymentStore() }) });

  await withServer(app, async (server) => {
    const response = await requestJson(server, 'POST', '/payments', {
      userId: 'user-3',
      amount: 0
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.error, 'amount must be a positive number');
  });
});
