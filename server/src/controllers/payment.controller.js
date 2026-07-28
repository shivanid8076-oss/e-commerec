const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Initialize Razorpay (Requires environment variables)
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are missing in .env');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// 1. Create a Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const instance = getRazorpayInstance();
    
    // Amount should be in paise (smallest currency unit for INR)
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    res.json({ success: true, order });
  } catch (error) {
    console.error('Payment Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order', error: error.message });
  }
};

// 2. Verify Razorpay Payment Signature
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Razorpay secret missing' });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Signature is valid. Payment is successful.
      // If internal_order_id is passed, update the order in database
      if (internal_order_id) {
        await prisma.order.update({
          where: { id: internal_order_id },
          data: {
            paymentStatus: 'PAID',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            // Optionally change overall status to PROCESSING or keep as PENDING
          }
        });
      }

      return res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

// 3. Razorpay Webhook Handler
exports.webhookHandler = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!secret) {
      console.warn('Webhook secret not configured, skipping webhook verification');
      return res.status(200).send('OK');
    }

    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature === expectedSignature) {
      const event = req.body.event;
      
      // Handle payment.captured event
      if (event === 'payment.captured' || event === 'payment.authorized') {
        const payment = req.body.payload.payment.entity;
        const razorpayOrderId = payment.order_id;
        
        if (razorpayOrderId) {
          // Find the internal order using the Razorpay order ID
          const internalOrder = await prisma.order.findFirst({
            where: { razorpayOrderId }
          });
          
          if (internalOrder && internalOrder.paymentStatus !== 'PAID') {
            await prisma.order.update({
              where: { id: internalOrder.id },
              data: {
                paymentStatus: 'PAID',
                razorpayPaymentId: payment.id
              }
            });
            console.log(`Webhook: Order ${internalOrder.id} marked as PAID`);
          }
        }
      }
      
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json({ status: 'bad request', message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
};
