const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get the user's cart (or session cart if no user)
exports.getCart = async (req, res) => {
  try {
    const { sessionId } = req.query; // Fallback for guest users
    const userId = req.user ? req.user.id : null;

    if (!userId && !sessionId) {
      return res.status(400).json({ success: false, message: 'User ID or Session ID is required' });
    }

    let cart;
    if (userId) {
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true }
      });
    } else {
      cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: true }
      });
    }

    if (!cart) {
      // Return empty cart structure if not found
      return res.json({ success: true, cart: { items: [] } });
    }

    res.json({ success: true, cart });
  } catch (error) {
    console.error('Get Cart Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve cart' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { sessionId, productId, quantity = 1, size } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!userId && !sessionId) {
      return res.status(400).json({ success: false, message: 'User ID or Session ID is required' });
    }
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Ensure cart exists or create it
    let cart = userId 
      ? await prisma.cart.findUnique({ where: { userId } }) 
      : await prisma.cart.findUnique({ where: { sessionId } });

    if (!cart) {
      cart = await prisma.cart.create({
        data: userId ? { userId } : { sessionId }
      });
    }

    // Check if item already exists in cart with same size
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, size }
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity, size }
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true }
    });

    res.json({ success: true, cart: updatedCart, message: 'Item added to cart' });
  } catch (error) {
    console.error('Add to Cart Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    await prisma.cartItem.delete({
      where: { id: itemId }
    });
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from Cart Error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
};

// Update item quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity }
      });
    }

    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    console.error('Update Quantity Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update quantity' });
  }
};
