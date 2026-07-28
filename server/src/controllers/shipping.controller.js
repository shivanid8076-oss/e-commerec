const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// In-memory cache for Shiprocket token
let shiprocketToken = null;
let tokenExpiry = null;

/**
 * Authenticate with Shiprocket to get a bearer token.
 * Shiprocket tokens usually expire in 10 days, but we can refresh it every few days.
 */
const getShiprocketToken = async () => {
  if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
    return shiprocketToken;
  }

  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    });

    shiprocketToken = response.data.token;
    // Set expiry to 9 days from now (to be safe, since they last 10 days)
    tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
    
    return shiprocketToken;
  } catch (error) {
    console.error('Shiprocket Auth Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

/**
 * Admin: Create a shipment/order in Shiprocket
 */
exports.createShipment = async (req, res) => {
  try {
    const { orderId } = req.body; // internal DB order ID

    // 1. Fetch order from DB
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // 2. Format order data for Shiprocket
    // Note: Shiprocket requires specific fields. This is a basic mapping.
    const shiprocketOrderData = {
      order_id: order.id,
      order_date: order.createdAt.toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary", // Setup in Shiprocket dashboard
      billing_customer_name: order.customerName,
      billing_last_name: "",
      billing_address: order.address,
      billing_address_2: "",
      billing_city: "Unknown", // Ideally you'd capture this at checkout
      billing_pincode: order.pincode,
      billing_state: "Unknown", // Ideally you'd capture this at checkout
      billing_country: "India",
      billing_email: order.email,
      billing_phone: order.phone,
      shipping_is_billing: true,
      order_items: [
        {
          name: order.productName,
          sku: order.productId,
          units: order.quantity,
          selling_price: order.totalPrice / order.quantity,
          discount: "",
          tax: "",
          hsn: ""
        }
      ],
      payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      shipping_charges: 0, // Extract from order if applicable
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order.totalPrice,
      length: 10, // Approx dimensions in cm
      breadth: 10,
      height: 10,
      weight: 0.5 // Approx weight in kg
    };

    // 3. Get Auth Token
    const token = await getShiprocketToken();

    // 4. Send to Shiprocket
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', shiprocketOrderData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    res.json({
      success: true,
      message: 'Shipment created successfully in Shiprocket',
      shiprocket_order_id: response.data.order_id,
      shipment_id: response.data.shipment_id
    });
  } catch (error) {
    console.error('Create Shipment Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to create shipment via Shiprocket' });
  }
};

/**
 * Public/Admin: Track an order
 */
exports.trackOrder = async (req, res) => {
  try {
    const { awb } = req.params; // Airway Bill Number

    const token = await getShiprocketToken();

    const response = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    res.json({
      success: true,
      trackingData: response.data
    });
  } catch (error) {
    console.error('Track Order Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to track order' });
  }
};
