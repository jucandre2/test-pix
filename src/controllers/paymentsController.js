function createPaymentsController({ paymentService }) {
  return {
    createPayment(req, res, next) {
      try {
        const payment = paymentService.createPayment(req.body || {});
        res.status(201).json(payment);
      } catch (error) {
        next(error);
      }
    },

    getPaymentById(req, res, next) {
      try {
        const payment = paymentService.getPaymentById(req.params.id);
        res.status(200).json(payment);
      } catch (error) {
        next(error);
      }
    }
  };
}

module.exports = { createPaymentsController };
