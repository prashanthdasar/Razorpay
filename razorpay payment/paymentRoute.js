const express = require('express');
const { processPayment, razorpayCallback, getRazorpayPaymentStatus } = require('../controllers/paymentControllernew'); // Add Razorpay controller imports
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();


router.route('/process/payment').post(processPayment);
router.route('/razorpay/callback').post(razorpayCallback);
router.route('/razorpay/payment/status/:id').get(isAuthenticatedUser, getRazorpayPaymentStatus);

module.exports = router;

