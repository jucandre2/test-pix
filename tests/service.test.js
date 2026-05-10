const test = require('node:test');
const assert = require('node:assert/strict');
const { createPaymentService } = require('../src/services/paymentService');
const { createPaymentStore } = require('../src/db/paymentStore');

test('payment service deducts balance in memory', () => {
  const service = createPaymentService({ paymentStore: createPaymentStore() });

  const payment = service.createPayment({ userId: 'user-10', amount: 120 });

  assert.equal(payment.userId, 'user-10');
  assert.equal(payment.updatedBalance, 880);
  assert.equal(typeof payment.transactionId, 'string');
});

test('payment service reuses payment for the same idempotency key', () => {
  const service = createPaymentService({ paymentStore: createPaymentStore() });

  const firstPayment = service.createPayment({
    userId: 'user-12',
    amount: 50,
    idempotencyKey: 'abc-123'
  });

  const repeatedPayment = service.createPayment({
    userId: 'user-12',
    amount: 999,
    idempotencyKey: 'abc-123'
  });

  assert.deepEqual(repeatedPayment, firstPayment);
});

test('payment service throws when balance is insufficient', () => {
  const service = createPaymentService({ paymentStore: createPaymentStore() });

  assert.throws(() => {
    service.createPayment({ userId: 'user-11', amount: 2000 });
  }, /insufficient balance/);
});
