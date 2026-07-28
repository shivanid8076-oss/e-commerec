const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, category, price, compare, sizes, images } = req.body;
    
    // Generate a unique slug
    let slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        slug,
        category,
        price: parseFloat(price),
        compare: compare ? parseFloat(compare) : null,
        sizes,
        images
      }
    });

    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.toggleFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    const updated = await prisma.product.update({
      where: { id },
      data: { isFeatured: !product.isFeatured }
    });
    
    res.status(200).json({ success: true, product: updated });
  } catch (error) {
    console.error('Error toggling product feature:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, compare } = req.body;
    
    if (!price) {
      return res.status(400).json({ success: false, message: 'Price is required' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { 
        price: parseFloat(price),
        compare: compare ? parseFloat(compare) : null
      }
    });
    
    res.status(200).json({ success: true, product: updated });
  } catch (error) {
    console.error('Error updating price:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.toggleStock = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    const updated = await prisma.product.update({
      where: { id },
      data: { isOutOfStock: !product.isOutOfStock }
    });
    
    res.status(200).json({ success: true, product: updated });
  } catch (error) {
    console.error('Error toggling product stock:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No product IDs provided' });
    }
    
    await prisma.product.deleteMany({
      where: { id: { in: ids } }
    });
    
    res.status(200).json({ success: true, message: 'Products deleted' });
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
