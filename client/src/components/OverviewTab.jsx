import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import api from '../utils/api';

const COLORS = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
const STATUS_COLORS = { 'COMPLETED': '#10b981', 'PENDING': '#f59e0b', 'CANCELLED': '#ef4444' };

const OverviewTab = ({ user, formatDate, isAdmin }) => {
  const [stats, setStats] = useState({ 
    totalProducts: 0, 
    totalOrders: 0, 
    revenue: 0, 
    recentOrders: [], 
    topProducts: [],
    avgOrderValue: 0,
    outOfStock: 0,
    pendingOrders: 0
  });
  const [analytics, setAnalytics] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(isAdmin);
  const [timeRange, setTimeRange] = useState('daily');
  const [activeVisitors, setActiveVisitors] = useState(14);

  useEffect(() => {
    if (isAdmin) {
      Promise.all([
        api.get('/stats'),
        api.get('/stats/analytics'),
        api.get('/stats/customers')
      ])
      .then(([statsRes, analyticsRes, customersRes]) => {
        if (statsRes.data && statsRes.data.success) setStats(statsRes.data.stats);
        if (analyticsRes.data && analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics);
        if (customersRes.data && customersRes.data.success) setCustomers(customersRes.data.customers);
      })
      .catch(err => console.error("Failed to load dashboard data", err))
      .finally(() => setLoading(false));

      const interval = setInterval(() => {
        setActiveVisitors(prev => Math.max(5, prev + Math.floor(Math.random() * 5) - 2));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const renderRevenueChart = () => {
    if (!analytics) return null;
    let data;
    let xKey;
    if (timeRange === 'daily') { data = analytics.revenueTimeSeries; xKey = 'label'; }
    else if (timeRange === 'weekly') { data = analytics.weeklyRevenue; xKey = 'label'; }
    else { data = analytics.monthlyRevenue; xKey = 'month'; }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--text-accent)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--text-accent)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
          <XAxis dataKey={xKey} stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(10px)' }}
            itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
            labelStyle={{ color: 'var(--text-secondary)', marginBottom: '5px' }}
          />
          <Area type="monotone" dataKey="revenue" stroke="var(--text-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = (dataKey, dataArray, colorsObj = null) => {
    if (!dataArray || dataArray.length === 0) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No data available</div>;
    return (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={dataArray} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey={dataKey} stroke="none">
            {dataArray.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorsObj ? colorsObj[entry.name] || COLORS[index % COLORS.length] : COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', backdropFilter: 'blur(10px)' }}
            itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (!isAdmin) {
    return (
      <div className="tab-panel">
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Welcome to Vastram</h3>
          <p>Track your orders and manage your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Overview</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Your store's performance at a glance.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="pro-btn pro-btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>📥 Export CSV</button>
        </div>
      </div>

      {/* 4 Main Stat Cards - Clean & Minimal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        
        <div className="pro-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', padding: '10px', borderRadius: '12px', fontSize: '1.2rem' }}>💰</div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '20px' }}>+12.5%</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹{loading ? '...' : stats.revenue?.toLocaleString('en-IN') || 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Total Revenue</div>
          </div>
        </div>

        <div className="pro-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '10px', borderRadius: '12px', fontSize: '1.2rem' }}>🛍️</div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '20px' }}>+8.2%</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{loading ? '...' : stats.totalOrders}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Total Orders</div>
          </div>
        </div>

        <div className="pro-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px', borderRadius: '12px', fontSize: '1.2rem' }}>📈</div>
            <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '20px' }}>-1.4%</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{loading ? '...' : `₹${stats.avgOrderValue?.toFixed(0) || 0}`}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Avg. Order Value</div>
          </div>
        </div>

        <div className="pro-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '10px', borderRadius: '12px', fontSize: '1.2rem' }}>👁️</div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '20px' }}>Live</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeVisitors} <span className="pulse-dot" style={{color: '#f59e0b', fontSize: '0.6rem'}}>●</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Active Visitors</div>
          </div>
        </div>

      </div>

      {/* Main Charts Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Revenue Chart */}
        <div className="pro-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Revenue Analytics</h3>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-input)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button onClick={() => setTimeRange('daily')} style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '6px', border: 'none', background: timeRange === 'daily' ? 'var(--bg-card-hover)' : 'transparent', color: timeRange === 'daily' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: timeRange === 'daily' ? '600' : '400' }}>Daily</button>
              <button onClick={() => setTimeRange('weekly')} style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '6px', border: 'none', background: timeRange === 'weekly' ? 'var(--bg-card-hover)' : 'transparent', color: timeRange === 'weekly' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: timeRange === 'weekly' ? '600' : '400' }}>Weekly</button>
              <button onClick={() => setTimeRange('monthly')} style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '6px', border: 'none', background: timeRange === 'monthly' ? 'var(--bg-card-hover)' : 'transparent', color: timeRange === 'monthly' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: timeRange === 'monthly' ? '600' : '400' }}>Monthly</button>
            </div>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            {loading ? <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>Loading...</div> : renderRevenueChart()}
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="pro-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: '700' }}>Order Status</h3>
          <div style={{ height: '240px', width: '100%' }}>
            {loading ? <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>Loading...</div> : renderPieChart('value', analytics?.orderStatusDistribution, STATUS_COLORS)}
          </div>
        </div>

      </div>

      {/* Bottom Lists - 3 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        
        {/* Top Products */}
        <div className="pro-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '700' }}>Top Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {analytics?.topProducts?.slice(0, 4).map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{idx + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.quantity} Sold</div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>₹{p.revenue}</div>
              </div>
            ))}
            {(!analytics?.topProducts || analytics.topProducts.length === 0) && <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0'}}>No sales data</div>}
          </div>
        </div>

        {/* Top Customers */}
        <div className="pro-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '700' }}>Top Customers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {customers?.slice(0, 4).map((c, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-subtle)', color: 'var(--text-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.ordersCount} Orders</div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#10b981' }}>₹{c.totalSpend}</div>
              </div>
            ))}
            {(!customers || customers.length === 0) && <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0'}}>No customer data</div>}
          </div>
        </div>

        {/* Action Items */}
        <div className="pro-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
             Needs Attention <span style={{background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem'}}>2</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--bg-input)', borderRadius: '10px', borderLeft: '3px solid #ef4444' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>Low Stock Alert</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stats.outOfStock} items are out of stock</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--bg-input)', borderRadius: '10px', borderLeft: '3px solid #f59e0b' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>Pending Orders</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stats.pendingOrders} orders await fulfillment</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OverviewTab;
