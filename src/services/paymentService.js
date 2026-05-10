const { randomUUID } = require('crypto');
const { createPaymentStore } = require('../db/paymentStore');

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function createPaymentService({ paymentStore } = {}) {
  const store = paymentStore || createPaymentStore();

  function createPayment(payload) {
    const idempotencyKey = String(payload.idempotencyKey || '').trim();
    const userId = String(payload.userId || '').trim();
    const amount = Number(payload.amount);

    if (idempotencyKey) {
      const existingPayment = store.getPaymentByIdempotencyKey(idempotencyKey);

      if (existingPayment) {
        return existingPayment;
      }
    }

    if (!userId) {
      throw createHttpError(400, 'userId is required');
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw createHttpError(400, 'amount must be a positive number');
    }

    const currentBalance = store.getBalance(userId);

    if (currentBalance < amount) {
      throw createHttpError(400, 'insufficient balance');
    }

    const updatedBalance = currentBalance - amount;
    const payment = {
      id: randomUUID(),
      transactionId: randomUUID(),
      userId,
      amount,
      updatedBalance,
      createdAt: new Date().toISOString()
    };

    store.savePayment(payment);
    store.setBalance(userId, updatedBalance);

    const response = {
      transactionId: payment.transactionId,
      userId: payment.userId,
      updatedBalance: payment.updatedBalance
    };

    if (idempotencyKey) {
      store.savePaymentByIdempotencyKey(idempotencyKey, response);
    }

    return response;
  }

  function getPaymentById(id) {
    const payment = store.getPaymentById(id);

    if (!payment) {
      throw createHttpError(404, 'payment not found');
    }

    return payment;
  }

  return {
    createPayment,
    getPaymentById
  };
}

module.exports = { createPaymentService, createHttpError };
