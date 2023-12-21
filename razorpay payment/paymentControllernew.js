const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/paymentModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


exports.processPayment = asyncErrorHandler(async (req, res, next) => {
    const { amount, email, phoneNo } = req.body;

    const options = {
        amount: amount * 100, 
        currency: 'INR',
        receipt: `oid${uuidv4()}`,
        payment_capture: 1,
        notes: {
            email,
            phoneNo,
        },
    };

    try {
        const order = await new Promise((resolve, reject) => {
            razorpay.orders.create(options, (err, order) => {
                if (err) {
                    reject(new ErrorHandler('Razorpay Order Creation Failed', 500));
                } else {
                    resolve(order);
                }
            });
        });

        const razorpayPayment = new Payment({
            orderId: order.id,
            amount: order.amount / 100,
            txnDate: new Date(),
            refundAmt: '0',
            paymentMode: 'Online', 
            bankName: 'SBI',
            gatewayName: 'Razorpay', 
            txnType: 'Payment', 
            txnAmount: amount, 
            txnId: order.id, 
            resultInfo: {
                resultStatus: 'Success', 
                resultCode: '0', 
                resultMsg: 'Payment successful', 
            }
           
        });
        
        await razorpayPayment.save();

        res.status(200).json({
            razorpayOptions:{
                key:process.env.RAZORPAY_KEY_ID,
            orderId: order.id,
            amount: order.amount / 100,
            currency: order.currency,
            }
        });
    } catch (error) {
        setPayDisable(false);
        setError(error.message || 'An error occurred');
    }
});
exports.razorpayCallback = asyncErrorHandler(async (req, res, next) => {
    res.status(200).json({ success: true });
});


exports.getRazorpayPaymentStatus = asyncErrorHandler(async (req, res, next) => {
    const orderId = req.params.id;

    const razorpayPayment = await Payment.findOne({ orderId });

    if (!razorpayPayment) {
        return next(new ErrorHandler('Razorpay Payment Details Not Found', 404));
    }

    res.status(200).json({
        success: true,
        paymentDetails: {
            orderId: razorpayPayment.orderId,
            amount: razorpayPayment.amount,
        },
    });
});