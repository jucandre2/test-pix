const http = require('http');
const { createApp } = require('./app');
const { createPaymentService } = require('./services/paymentService');

const port = process.env.PORT || 3000;
const app = createApp({ paymentService: createPaymentService() });

http.createServer(app).listen(port, () => {
  console.log(`Payment service running on port ${port}`);
});
