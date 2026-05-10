const express = require('express');
const { createPaymentsController } = require('../controllers/paymentsController');
const { createPaymentService } = require('../services/paymentService');

function createPaymentsRouter({ paymentService } = {}) {
  const router = express.Router();
  const service = paymentService || createPaymentService();
  const controller = createPaymentsController({ paymentService: service });

  router.post('/', controller.createPayment);
  router.get('/:id', controller.getPaymentById);

  return router;
}

module.exports = { createPaymentsRouter };
