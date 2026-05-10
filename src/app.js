const express = require('express');
const { createPaymentsRouter } = require('./routes/paymentsRoutes');
const { requestLogger } = require('./middleware/requestLogger');

function createApp({ paymentService } = {}) {
  const app = express();

  app.use(express.json());
  app.use(requestLogger);
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  app.use('/payments', createPaymentsRouter({ paymentService }));

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
