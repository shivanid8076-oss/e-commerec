const nodemailer = require('nodemailer');

// Set up Nodemailer transporter (requires .env configuration)
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // Return null if SMTP not configured
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Sends an email notification to the customer.
 */
const sendEmail = async (to, subject, htmlContent) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    return; // Fallback to mock if no SMTP credentials
  }

  try {
    const info = await transporter.sendMail({
      from: `"Vastram Store" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`[EMAIL SENT] Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
  }
};

/**
 * Send Order Placed Notification
 */
const sendOrderPlaced = async (order) => {
  const subject = `Order Confirmation - Vastram #${order.id.split('-')[0]}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
      <h2 style="color: #ec4899; text-align: center;">Vastram</h2>
      <h3>Thank you for your order, ${order.customerName}!</h3>
      <p>We've received your order and are getting it ready to ship.</p>
      <div style="background: #f9f9f9; padding: 15px; margin: 20px 0;">
        <strong>Order Summary:</strong><br/>
        Product: ${order.productName} (Size: ${order.size}) x ${order.quantity}<br/>
        Total Amount: ₹${order.totalPrice}
      </div>
      <p>We will notify you again once your order is shipped.</p>
    </div>
  `;

  await sendEmail(order.email, subject, html);
};

/**
 * Send Order Completion/Shipped Notification
 */
const sendOrderConfirmation = async (order) => {
  const subject = `Your Vastram Order is on its way! #${order.id.split('-')[0]}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
      <h2 style="color: #10b981; text-align: center;">Order Shipped</h2>
      <h3>Hi ${order.customerName},</h3>
      <p>Great news! Your order for <strong>${order.productName}</strong> has been shipped and is on its way to you.</p>
      <p>Delivery Address:<br/>${order.address}, ${order.pincode}</p>
      <p>Thanks for shopping with Vastram!</p>
    </div>
  `;

  await sendEmail(order.email, subject, html);
};

module.exports = {
  sendEmail,
  sendOrderPlaced,
  sendOrderConfirmation
};
