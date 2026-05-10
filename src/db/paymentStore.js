function createPaymentStore() {
  const payments = new Map();
  const balances = new Map();
  const idempotencyKeys = new Map();

  return {
    getBalance(userId) {
      if (!balances.has(userId)) {
        balances.set(userId, 1000);
      }

      return balances.get(userId);
    },

    setBalance(userId, balance) {
      balances.set(userId, balance);
    },

    savePayment(payment) {
      payments.set(payment.transactionId, payment);
      payments.set(payment.id, payment);
    },

    getPaymentByIdempotencyKey(idempotencyKey) {
      return idempotencyKeys.get(idempotencyKey) || null;
    },

    savePaymentByIdempotencyKey(idempotencyKey, payment) {
      idempotencyKeys.set(idempotencyKey, payment);
    },

    getPaymentById(id) {
      return payments.get(id) || null;
    }
  };
}

module.exports = { createPaymentStore };
