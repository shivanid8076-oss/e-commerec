const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAdminStats = async (req, res) => {
  try {
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' }
    });
    
    const revenue = completedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // Recent 5 orders
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Top selling products
    const topProductsRaw = await prisma.order.groupBy({
      by: ['productName'],
      _count: { productName: true },
      _sum: { totalPrice: true },
      where: { status: 'COMPLETED' },
      orderBy: { _count: { productName: 'desc' } },
      take: 3
    });

    // Pending orders count
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
    const cancelledOrders = await prisma.order.count({ where: { status: 'CANCELLED' } });
    const completedCount = await prisma.order.count({ where: { status: 'COMPLETED' } });

    // Out of stock count
    const outOfStock = await prisma.product.count({ where: { isOutOfStock: true } });
    const featured = await prisma.product.count({ where: { isFeatured: true } });

    // Average order value
    const avgOrderValue = completedOrders.length > 0 
      ? revenue / completedOrders.length 
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        revenue,
        recentOrders,
        topProducts: topProductsRaw,
        pendingOrders,
        cancelledOrders,
        completedOrders: completedCount,
        outOfStock,
        featured,
        avgOrderValue
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Advanced analytics endpoint — time-series data for charts
exports.getAnalytics = async (req, res) => {
  try {
    const allOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        productName: true,
        paymentMethod: true,
        quantity: true
      }
    });

    // --- Revenue Over Time (last 30 days, daily) ---
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = {};
    const dailyOrders = {};
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      dailyRevenue[key] = 0;
      dailyOrders[key] = 0;
    }

    allOrders.forEach(order => {
      const day = new Date(order.createdAt).toISOString().split('T')[0];
      if (dailyRevenue.hasOwnProperty(day)) {
        if (order.status === 'COMPLETED') {
          dailyRevenue[day] += order.totalPrice || 0;
        }
        dailyOrders[day] += 1;
      }
    });

    const revenueTimeSeries = Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue),
      orders: dailyOrders[date] || 0,
      label: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    }));

    // --- Weekly Revenue (last 8 weeks) ---
    const weeklyRevenue = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      let weekRev = 0;
      let weekOrd = 0;
      allOrders.forEach(o => {
        const d = new Date(o.createdAt);
        if (d >= weekStart && d <= weekEnd) {
          weekOrd++;
          if (o.status === 'COMPLETED') weekRev += o.totalPrice || 0;
        }
      });
      weeklyRevenue.push({
        week: `W${8 - i}`,
        label: weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        revenue: Math.round(weekRev),
        orders: weekOrd
      });
    }

    // --- Monthly Revenue (last 6 months) ---
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      
      let monthRev = 0;
      let monthOrd = 0;
      allOrders.forEach(o => {
        const d = new Date(o.createdAt);
        if (d >= monthDate && d <= monthEnd) {
          monthOrd++;
          if (o.status === 'COMPLETED') monthRev += o.totalPrice || 0;
        }
      });
      monthlyRevenue.push({
        month: monthName,
        revenue: Math.round(monthRev),
        orders: monthOrd
      });
    }

    // --- Category Distribution (for pie chart) ---
    const allProducts = await prisma.product.findMany({
      select: { category: true, price: true }
    });

    const categoryMap = {};
    allProducts.forEach(p => {
      if (!categoryMap[p.category]) categoryMap[p.category] = { count: 0, value: 0 };
      categoryMap[p.category].count++;
      categoryMap[p.category].value += p.price;
    });

    const categoryDistribution = Object.entries(categoryMap).map(([name, data]) => ({
      name: name.replace(/-/g, ' '),
      count: data.count,
      value: Math.round(data.value)
    }));

    // --- Order Status Distribution (for pie chart) ---
    const statusCounts = {};
    allOrders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const orderStatusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));

    // --- Payment Method Distribution ---
    const paymentCounts = {};
    allOrders.forEach(o => {
      const method = o.paymentMethod || 'UPI';
      paymentCounts[method] = (paymentCounts[method] || 0) + 1;
    });
    const paymentDistribution = Object.entries(paymentCounts).map(([name, value]) => ({
      name,
      value
    }));

    // --- Top 5 Selling Products (by quantity) ---
    const productSales = {};
    allOrders.filter(o => o.status === 'COMPLETED').forEach(o => {
      if (!productSales[o.productName]) productSales[o.productName] = { qty: 0, revenue: 0 };
      productSales[o.productName].qty += o.quantity || 1;
      productSales[o.productName].revenue += o.totalPrice || 0;
    });
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([name, data]) => ({
        name: name.length > 25 ? name.substring(0, 25) + '...' : name,
        fullName: name,
        quantity: data.qty,
        revenue: Math.round(data.revenue)
      }));

    res.status(200).json({
      success: true,
      analytics: {
        revenueTimeSeries,
        weeklyRevenue,
        monthlyRevenue,
        categoryDistribution,
        orderStatusDistribution,
        paymentDistribution,
        topProducts
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      select: { customerName: true, email: true, phone: true, totalPrice: true }
    });
    
    const customerMap = {};
    orders.forEach(o => {
      const key = o.email || o.phone;
      if (!customerMap[key]) {
        customerMap[key] = {
          name: o.customerName,
          email: o.email,
          phone: o.phone,
          totalSpend: 0,
          ordersCount: 0
        };
      }
      customerMap[key].totalSpend += (o.totalPrice || 0);
      customerMap[key].ordersCount += 1;
    });
    
    const customers = Object.values(customerMap).sort((a, b) => b.totalSpend - a.totalSpend);
    res.status(200).json({ success: true, customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
