const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendOrderConfirmation, sendOrderPlaced } = require('../utils/notification');

// Public: Create a new order (Checkout Flow)
exports.createOrder = async (req, res) => {
  try {
    const { 
      customerName, email, phone, address, pincode, 
      productId, productName, size, quantity, totalPrice, paymentMethod 
    } = req.body;

    const newOrder = await prisma.order.create({
      data: {
        customerName,
        email,
        phone,
        address,
        pincode,
        productId,
        productName,
        size,
        quantity: parseInt(quantity),
        totalPrice: parseFloat(totalPrice),
        paymentMethod: paymentMethod || 'UPI',
        status: 'PENDING'
      }
    });

    // Send Order Received Notification
    sendOrderPlaced(
      { customerName, email, phone }, 
      { id: newOrder.id, productName, totalPrice: newOrder.totalPrice }
    ).catch(err => console.error('Notification Error:', err));

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    if (status === 'COMPLETED') {
      // Send Order Confirmed Notification
      sendOrderConfirmation(
        { customerName: updatedOrder.customerName, email: updatedOrder.email, phone: updatedOrder.phone },
        { id: updatedOrder.id, productName: updatedOrder.productName, totalPrice: updatedOrder.totalPrice }
      ).catch(err => console.error('Notification Error:', err));
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Customer: Cancel an order (Only if PENDING)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (order.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled directly.' });
    }

    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({ success: true, message: 'Order has been cancelled successfully.', order: cancelledOrder });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};

// Customer: Request a Return/Refund (Only if COMPLETED)
exports.requestReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'You can only request a return for completed orders.' });
    }

    // Usually, you'd store the 'reason' in a separate ReturnRequest model or an order note field.
    // For now, we update the status to RETURN_REQUESTED.
    const returnedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'RETURN_REQUESTED' }
    });

    res.json({ success: true, message: 'Return request submitted successfully.', order: returnedOrder });
  } catch (error) {
    console.error('Return Request Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit return request' });
  }
};
