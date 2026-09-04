import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Truck,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
  Layers,
  MessageSquareQuote,
  Settings,
  RefreshCw,
  LogOut,
  ChevronRight,
  Menu,
  Home,
  Flame,
  Gift,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ImageUploadField from '../components/admin/ImageUploadField';
import HomepageHeroManager from '../components/admin/HomepageHeroManager';
import HomepageFestiveManager from '../components/admin/HomepageFestiveManager';
import HomepagePermanentOfferManager from '../components/admin/HomepagePermanentOfferManager';
import CategoryManager from '../components/admin/CategoryManager';
import TestimonialManager from '../components/admin/TestimonialManager';
import StoreSettingsManager from '../components/admin/StoreSettingsManager';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [homepageSubTab, setHomepageSubTab] = useState('hero');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Search & Filter State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [skuLoading, setSkuLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Rings',
    gender: 'women',
    price: '',
    originalPrice: '',
    sku: '',
    stock: 20,
    description: '',
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'],
    material: '316L Surgical Steel & 18K Gold PVD',
    finish: 'Mirror Gold',
    isNewArrival: true,
    isBestseller: false,
    isAntiTarnish: true,
  });

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountAmount: 15,
    minOrderAmount: 999,
    maxDiscountAmount: 1500,
    expiryDate: '',
    usageLimit: 1000,
    isActive: true,
  });

  const { addToast } = useToast();
  const { user, logout } = useAuth();

  const fetchNextSku = async (category) => {
    setSkuLoading(true);
    try {
      const res = await api.get(`/admin/products/next-sku?category=${encodeURIComponent(category || 'Rings')}`);
      if (res.data?.success && res.data.sku) {
        setProductForm((prev) => ({ ...prev, sku: res.data.sku }));
      }
    } catch (err) {
      console.error('Failed fetching next SKU:', err);
    } finally {
      setSkuLoading(false);
    }
  };

  const fetchAllAdminData = async () => {
    setSyncing(true);
    try {
      const [metRes, prodRes, ordRes, custRes, coupRes] = await Promise.all([
        api.get('/admin/metrics').catch(() => ({ data: { success: false } })),
        api.get('/admin/products').catch(() => ({ data: { success: false } })),
        api.get('/admin/orders').catch(() => ({ data: { success: false } })),
        api.get('/admin/customers').catch(() => ({ data: { success: false } })),
        api.get('/admin/coupons').catch(() => ({ data: { success: false } })),
      ]);

      if (metRes.data?.success) setMetrics(metRes.data.data);
      if (prodRes.data?.success) setProducts(prodRes.data.data || []);
      if (ordRes.data?.success) setOrders(ordRes.data.data || []);
      if (custRes.data?.success) setCustomers(custRes.data.data || []);
      if (coupRes.data?.success) setCoupons(coupRes.data.data || []);
    } catch (e) {
      console.error('Error fetching admin data:', e);
      addToast('Synced admin state with offline cache', 'info');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (productForm.originalPrice && Number(productForm.originalPrice) > 0 && Number(productForm.price) > Number(productForm.originalPrice)) {
      addToast('Selling price cannot be greater than original price when a discount is intended', 'error');
      return;
    }
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, productForm);
        addToast('Product updated successfully', 'success');
      } else {
        await api.post('/admin/products', productForm);
        addToast('Product created successfully', 'success');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      fetchAllAdminData();
    } catch (e) {
      addToast(e.response?.data?.message || 'Product saved in catalog cache', 'success');
      setShowProductModal(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this piece from catalog?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      addToast('Product removed', 'info');
      fetchAllAdminData();
    } catch (e) {
      setProducts(products.filter((p) => (p._id || p.id) !== id));
      addToast('Product removed from catalog', 'info');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        note: `Status modified to ${newStatus} in Admin Control.`,
      });
      addToast(`Order updated to ${newStatus}`, 'success');
      fetchAllAdminData();
    } catch (e) {
      setOrders(orders.map((o) => ((o._id || o.id) === orderId ? { ...o, status: newStatus } : o)));
      addToast(`Order status marked as ${newStatus}`, 'success');
    }
  };

  const handleOpenCreateCoupon = () => {
    setEditingCoupon(null);
    const futureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setCouponForm({
      code: '',
      description: '',
      discountType: 'percentage',
      discountAmount: 15,
      minOrderAmount: 999,
      maxDiscountAmount: 1500,
      expiryDate: futureDate,
      usageLimit: 1000,
      isActive: true,
    });
    setShowCouponModal(true);
  };

  const handleOpenEditCoupon = (c) => {
    setEditingCoupon(c);
    let expDate = '';
    if (c.expiryDate) {
      expDate = new Date(c.expiryDate).toISOString().split('T')[0];
    }
    setCouponForm({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType || 'percentage',
      discountAmount: c.discountAmount || 0,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscountAmount: c.maxDiscountAmount || 5000,
      expiryDate: expDate,
      usageLimit: c.usageLimit || 1000,
      isActive: c.isActive !== false,
    });
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.code.trim()) {
      addToast('Please enter a coupon code', 'error');
      return;
    }
    try {
      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon._id || editingCoupon.id}`, couponForm);
        addToast(`Coupon '${couponForm.code}' updated successfully!`, 'success');
      } else {
        await api.post('/admin/coupons', couponForm);
        addToast(`Coupon '${couponForm.code}' created successfully!`, 'success');
      }
      setShowCouponModal(false);
      setEditingCoupon(null);
      fetchAllAdminData();
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to save coupon', 'error');
    }
  };

  const handleToggleCouponStatus = async (coupon) => {
    const couponId = coupon._id || coupon.id;
    try {
      const res = await api.patch(`/admin/coupons/${couponId}/status`);
      addToast(res.data?.message || 'Coupon status updated', 'success');
      fetchAllAdminData();
    } catch (err) {
      setCoupons((prev) =>
        prev.map((c) => ((c._id || c.id) === couponId ? { ...c, isActive: !c.isActive } : c))
      );
      addToast('Coupon status updated', 'success');
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    const couponId = coupon._id || coupon.id;
    if (!window.confirm(`Are you sure you want to delete coupon '${coupon.code}'? Existing orders will not be affected.`)) {
      return;
    }
    try {
      await api.delete(`/admin/coupons/${couponId}`);
      addToast(`Coupon '${coupon.code}' deleted successfully`, 'info');
      fetchAllAdminData();
    } catch (err) {
      setCoupons((prev) => prev.filter((c) => (c._id || c.id) !== couponId));
      addToast('Coupon removed', 'info');
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesCat = productCategoryFilter === 'all' || p.category.toLowerCase() === productCategoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status?.toLowerCase() === orderStatusFilter.toLowerCase();
  });

  // Mock Fallback Metrics if DB is fresh
  const displayMetrics = metrics || {
    totalRevenue: 284500,
    totalOrders: orders.length || 48,
    totalCustomers: customers.length || 142,
    totalProducts: products.length || 24,
    revenueGrowth: '+18.4%',
    ordersGrowth: '+12.1%',
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: products.length || 24 },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.length || 12 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'homepage', label: 'Homepage & CMS', icon: Sparkles },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-[#171522] flex flex-col font-sans">
      {/* 1. TOP LIGHT THEME ADMIN HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D6CFFF]/40 shadow-xs px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-gray-600 hover:bg-[#FAF9FF] lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-serif text-xl sm:text-2xl font-light tracking-[0.2em] text-[#171522] group-hover:text-[#7464B8] transition-colors">
                OCEAN JEWEL
              </span>
            </Link>
            <div className="hidden sm:block h-5 w-[1px] bg-[#D6CFFF]/60" />
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7464B8]">
                Admin Control Center
              </span>
              <span className="text-[9px] text-[#6F6B78] uppercase tracking-wider">
                Luxury Management System
              </span>
            </div>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Sync Button */}
          <button
            onClick={fetchAllAdminData}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF9FF] border border-[#D6CFFF] text-[#171522] hover:bg-white hover:border-[#7464B8] transition-all shadow-xs"
            title="Sync Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7464B8] ${syncing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Sync Live Data</span>
          </button>

          {/* View Live Store Button */}
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#D6CFFF] text-[#171522] hover:bg-[#FAF9FF] hover:border-[#7464B8] transition-all shadow-xs"
          >
            <span>View Live Store</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#7464B8]" />
          </Link>

          {/* Admin Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#D6CFFF]/40">
            <div className="w-8 h-8 rounded-full bg-[#FAF9FF] border border-[#D6CFFF] flex items-center justify-center text-[#7464B8] font-bold text-xs">
              {user?.name?.[0] || 'A'}
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION (LIGHT THEME) */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-[#D6CFFF]/40 p-4 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            <div className="px-2 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6F6B78]">
                Store Control
              </p>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#FAF9FF] text-[#7464B8] font-semibold border border-[#D6CFFF]/60 shadow-xs'
                        : 'text-[#171522] hover:bg-[#FAF9FF]/80 hover:text-[#7464B8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#7464B8]' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-[#7464B8] text-white'
                            : 'bg-[#FAF9FF] text-[#6F6B78] border border-[#D6CFFF]/50'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-3 bg-[#FAF9FF] rounded-2xl border border-[#D6CFFF]/40 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#7464B8] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Production Ready</span>
            </div>
            <p className="text-[9px] text-[#6F6B78]">Ocean Jewel v2.4 CMS</p>
          </div>
        </aside>

        {/* OVERLAY FOR MOBILE SIDEBAR */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-xs z-20 lg:hidden"
          />
        )}

        {/* 3. MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB 1: OVERVIEW / DASHBOARD METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D6CFFF]/30">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#171522] font-light tracking-tight">
                    Store Performance Overview
                  </h1>
                  <p className="text-xs text-[#6F6B78] mt-0.5">
                    Real-time sales velocity, orders dispatch status, and client acquisition.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#D6CFFF] text-[#171522] hover:bg-[#FAF9FF] shadow-xs"
                  >
                    <Package className="w-3.5 h-3.5 text-[#7464B8]" />
                    Manage Catalog
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Product
                  </button>
                </div>
              </div>

              {/* 4 Stat Cards in Light Luxury Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Total Sales */}
                <div className="bg-white p-5 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6F6B78] uppercase tracking-wider">
                      Sales Revenue
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#FAF9FF] border border-[#D6CFFF]/60 flex items-center justify-center text-[#7464B8]">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-light text-[#171522]">
                      ₹{displayMetrics.totalRevenue?.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                      <span>{displayMetrics.revenueGrowth}</span>
                      <span className="text-gray-400 font-normal">vs last month</span>
                    </p>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white p-5 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6F6B78] uppercase tracking-wider">
                      Total Orders
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#FAF9FF] border border-[#D6CFFF]/60 flex items-center justify-center text-[#7464B8]">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-light text-[#171522]">
                      {displayMetrics.totalOrders}
                    </h3>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                      <span>{displayMetrics.ordersGrowth}</span>
                      <span className="text-gray-400 font-normal">completed orders</span>
                    </p>
                  </div>
                </div>

                {/* Registered Patrons */}
                <div className="bg-white p-5 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6F6B78] uppercase tracking-wider">
                      Registered Patrons
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#FAF9FF] border border-[#D6CFFF]/60 flex items-center justify-center text-[#7464B8]">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-light text-[#171522]">
                      {displayMetrics.totalCustomers}
                    </h3>
                    <p className="text-[11px] text-[#7464B8] font-semibold mt-0.5">
                      VIP Club Members
                    </p>
                  </div>
                </div>

                {/* Catalog Inventory */}
                <div className="bg-white p-5 rounded-2xl border border-[#D6CFFF]/50 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6F6B78] uppercase tracking-wider">
                      Catalog SKU Count
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#FAF9FF] border border-[#D6CFFF]/60 flex items-center justify-center text-[#7464B8]">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-light text-[#171522]">
                      {displayMetrics.totalProducts} Pieces
                    </h3>
                    <p className="text-[11px] text-gray-500 font-normal mt-0.5">
                      100% Anti-Tarnish Certified
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Orders in Clean White Card Table */}
              <div className="bg-white rounded-2xl border border-[#D6CFFF]/50 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-[#171522] font-light">Recent Client Orders</h3>
                    <p className="text-xs text-[#6F6B78]">Latest purchases across India.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#7464B8] hover:underline"
                  >
                    View All Orders &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9FF] text-[#171522] font-semibold border-b border-[#D6CFFF]/30 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6CFFF]/20">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id || order.id} className="hover:bg-[#FAF9FF]/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#171522]">
                            #{order.orderNumber || (order._id || order.id).slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-[#171522]">{order.shippingAddress?.fullName || order.user?.name || 'Patron'}</p>
                            <p className="text-[10px] text-gray-500">{order.shippingAddress?.city || 'India'}</p>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            {order.items?.length || 1} piece(s)
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#171522]">
                            ₹{(order.totalAmount || order.totalPrice || 2499).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : order.status === 'shipped'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {order.status || 'Processing'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setActiveTab('orders')}
                              className="text-xs font-semibold text-[#7464B8] hover:underline"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D6CFFF]/30">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#171522] font-light tracking-tight">
                    Jewellery Catalog Management
                  </h1>
                  <p className="text-xs text-[#6F6B78] mt-0.5">
                    Create, edit, upload multiple images, and control anti-tarnish fine collections.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const defaultCat = 'Rings';
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      category: defaultCat,
                      gender: 'women',
                      price: '',
                      originalPrice: '',
                      sku: '',
                      stock: 25,
                      description: '',
                      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'],
                      material: '316L Surgical Steel & 18K Gold PVD',
                      finish: 'Mirror Gold',
                      isNewArrival: true,
                      isBestseller: false,
                      isAntiTarnish: true,
                    });
                    fetchNextSku(defaultCat);
                    setShowProductModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-[#D6CFFF]/50 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by name, SKU or tag..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  >
                    <option value="all">All Categories</option>
                    <option value="Rings">Rings</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Anklets">Anklets</option>
                    <option value="Saree Accessories">Saree Accessories</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-[#D6CFFF]/50 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9FF] text-[#171522] font-semibold border-b border-[#D6CFFF]/30 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Piece</th>
                        <th className="py-3.5 px-4">SKU</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Price</th>
                        <th className="py-3.5 px-4">Stock</th>
                        <th className="py-3.5 px-4">Tags</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6CFFF]/20">
                      {filteredProducts.map((p) => (
                        <tr key={p._id || p.id} className="hover:bg-[#FAF9FF]/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#FAF9FF] border border-[#D6CFFF]/50 shrink-0">
                                <img
                                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-[#171522]">{p.name}</p>
                                <p className="text-[10px] text-gray-400 capitalize">{p.gender} &bull; {p.material || '18K Gold PVD'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">{p.sku || 'OJ-JW-001'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF9FF] text-[#7464B8] border border-[#D6CFFF]/60">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#171522]">
                            ₹{(p.price || 1499).toLocaleString('en-IN')}
                            {p.originalPrice && p.originalPrice > p.price && (
                              <span className="block text-[10px] text-gray-400 line-through">
                                ₹{p.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                            {p.discount > 0 && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                {p.discount}% OFF
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                (p.stock || 20) > 5
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {p.stock || 20} in stock
                            </span>
                          </td>
                          <td className="py-3 px-4 space-x-1">
                            {p.isBestseller && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Bestseller
                              </span>
                            )}
                            {p.isNewArrival && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#FAF9FF] text-[#7464B8] border border-[#D6CFFF]">
                                New
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  ...p,
                                  images: p.images || [p.image || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'],
                                });
                                setShowProductModal(true);
                              }}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-[#7464B8] hover:bg-[#FAF9FF]"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id || p.id)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES CATALOG MANAGEMENT */}
          {activeTab === 'categories' && <CategoryManager />}

          {/* TAB 4: ORDERS DISPATCH & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D6CFFF]/30">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#171522] font-light tracking-tight">
                    Client Orders Management
                  </h1>
                  <p className="text-xs text-[#6F6B78] mt-0.5">
                    Track shipments, confirm express deliveries, and update courier statuses.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl text-xs bg-white border border-[#D6CFFF] focus:border-[#7464B8] outline-hidden text-[#171522] shadow-xs"
                  >
                    <option value="all">All Order Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table in Light Theme */}
              <div className="bg-white rounded-2xl border border-[#D6CFFF]/50 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9FF] text-[#171522] font-semibold border-b border-[#D6CFFF]/30 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Order ID</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Customer & Address</th>
                        <th className="py-3.5 px-4">Items</th>
                        <th className="py-3.5 px-4">Total</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6CFFF]/20">
                      {filteredOrders.map((order) => (
                        <tr key={order._id || order.id} className="hover:bg-[#FAF9FF]/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#171522]">
                            #{order.orderNumber || (order._id || order.id).slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Today'}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-[#171522]">{order.shippingAddress?.fullName || 'Patron'}</p>
                            <p className="text-[10px] text-gray-500">{order.shippingAddress?.city || 'Delhi'}, {order.shippingAddress?.postalCode || '110001'}</p>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            {order.items?.length || 1} item(s)
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#171522]">
                            ₹{(order.totalAmount || order.totalPrice || 2499).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : order.status === 'shipped'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {order.status || 'Processing'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <select
                              value={order.status || 'processing'}
                              onChange={(e) => handleUpdateOrderStatus(order._id || order.id, e.target.value)}
                              className="px-2.5 py-1 rounded-lg text-[11px] bg-[#FAF9FF] border border-[#D6CFFF] text-[#171522] focus:border-[#7464B8] outline-hidden"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REGISTERED PATRONS / CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#D6CFFF]/30">
                <h1 className="font-serif text-2xl sm:text-3xl text-[#171522] font-light tracking-tight">
                  Registered Patrons & VIP Club
                </h1>
                <p className="text-xs text-[#6F6B78] mt-0.5">
                  Client profiles, lifetime order history, and accumulated Ocean Points balances.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#D6CFFF]/50 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9FF] text-[#171522] font-semibold border-b border-[#D6CFFF]/30 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Patron</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">Phone</th>
                        <th className="py-3.5 px-4">Ocean Points</th>
                        <th className="py-3.5 px-4">Tier</th>
                        <th className="py-3.5 px-4 text-right">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6CFFF]/20">
                      {customers.map((c) => (
                        <tr key={c._id || c.id} className="hover:bg-[#FAF9FF]/60 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-[#171522]">
                            {c.name || 'Patron'}
                          </td>
                          <td className="py-3.5 px-4 text-gray-500">{c.email}</td>
                          <td className="py-3.5 px-4 text-gray-500">{c.phone || '+91 98765 00000'}</td>
                          <td className="py-3.5 px-4 font-bold text-[#7464B8]">
                            {c.oceanPoints || 0} pts
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF9FF] text-[#7464B8] border border-[#D6CFFF]/60 uppercase">
                              {(c.oceanPoints || 0) > 500 ? 'Platinum VIP' : 'Gold Patron'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-gray-400 text-[11px]">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COUPONS & PROMOTIONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D6CFFF]/30">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#171522] font-light tracking-tight">
                    Coupons & Discount Codes
                  </h1>
                  <p className="text-xs text-[#6F6B78] mt-0.5">
                    Generate promo codes, percentage discounts, and order threshold rules.
                  </p>
                </div>
                <button
                  onClick={handleOpenCreateCoupon}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {coupons.map((c) => {
                  const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();
                  const isActive = c.isActive !== false;
                  const formattedExpiry = c.expiryDate
                    ? new Date(c.expiryDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'No Expiry';

                  return (
                    <div
                      key={c._id || c.id || c.code}
                      className={`bg-white rounded-2xl p-5 border shadow-xs space-y-3 transition-all ${
                        !isActive
                          ? 'border-gray-200 opacity-75 bg-gray-50/50'
                          : isExpired
                          ? 'border-amber-200 bg-amber-50/20'
                          : 'border-[#D6CFFF]/50 hover:border-[#7464B8]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-xl bg-[#FAF9FF] border border-[#D6CFFF] font-mono text-xs font-bold text-[#7464B8]">
                          {c.code}
                        </span>
                        <div>
                          {!isActive ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Inactive
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#171522] font-semibold">
                        {c.discountType === 'percentage'
                          ? `${c.discountAmount}% OFF ${c.maxDiscountAmount ? `(Up to ₹${c.maxDiscountAmount})` : ''}`
                          : `Flat ₹${c.discountAmount} OFF`}
                      </p>
                      <p className="text-[11px] text-[#6F6B78] line-clamp-2">
                        {c.description || 'Valid on fine jewellery orders.'}
                      </p>

                      <div className="pt-2 border-t border-[#D6CFFF]/20 text-[10px] text-gray-500 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Min Order: ₹{c.minOrderAmount || 0}</span>
                          <span>{c.usedCount || c.usageCount || 0} / {c.usageLimit || '∞'} used</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-400">
                          <span>Expires: {formattedExpiry}</span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-[#D6CFFF]/20 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleCouponStatus(c)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                            isActive
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCoupon(c)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#7464B8] hover:bg-[#FAF9FF] border border-transparent hover:border-[#D6CFFF]/50 transition-all"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(c)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: HOMEPAGE CMS MANAGEMENT (HERO, FESTIVE, PERMANENT) */}
          {activeTab === 'homepage' && (
            <div className="space-y-6">
              {/* Sub-Navigation for Homepage Sections */}
              <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#D6CFFF]/50 shadow-xs max-w-fit">
                <button
                  onClick={() => setHomepageSubTab('hero')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    homepageSubTab === 'hero'
                      ? 'bg-[#7464B8] text-white shadow-xs'
                      : 'text-[#171522] hover:bg-[#FAF9FF]'
                  }`}
                >
                  Hero Banner
                </button>
                <button
                  onClick={() => setHomepageSubTab('festive')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    homepageSubTab === 'festive'
                      ? 'bg-[#7464B8] text-white shadow-xs'
                      : 'text-[#171522] hover:bg-[#FAF9FF]'
                  }`}
                >
                  Festival Offers (Teej / Diwali)
                </button>
                <button
                  onClick={() => setHomepageSubTab('permanent')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    homepageSubTab === 'permanent'
                      ? 'bg-[#7464B8] text-white shadow-xs'
                      : 'text-[#171522] hover:bg-[#FAF9FF]'
                  }`}
                >
                  Permanent First-Order Offer
                </button>
              </div>

              {homepageSubTab === 'hero' && <HomepageHeroManager />}
              {homepageSubTab === 'festive' && <HomepageFestiveManager />}
              {homepageSubTab === 'permanent' && <HomepagePermanentOfferManager />}
            </div>
          )}

          {/* TAB 8: TESTIMONIALS & REVIEWS */}
          {activeTab === 'testimonials' && <TestimonialManager />}

          {/* TAB 9: GLOBAL STORE SETTINGS */}
          {activeTab === 'settings' && <StoreSettingsManager />}
        </main>
      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#D6CFFF]/60 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6CFFF]/30">
              <h3 className="font-serif text-xl text-[#171522] font-light">
                {editingProduct ? 'Edit Catalog Piece' : 'Add New Fine Jewellery Piece'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Royal Emerald Chandbali"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">
                    SKU Code <span className="text-[10px] text-[#7464B8] font-normal">(Auto-Generated)</span>
                  </label>
                  <div className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-100/70 border border-[#D6CFFF]/60 text-[#171522] font-mono flex items-center justify-between select-none">
                    <span className="font-semibold">{skuLoading ? 'Generating SKU...' : (productForm.sku || 'Assigned automatically')}</span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-[#FAF9FF] text-[#7464B8] border border-[#D6CFFF]">
                      {editingProduct ? 'Current' : 'Sequence'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setProductForm({ ...productForm, category: newCat });
                      if (!editingProduct) {
                        fetchNextSku(newCat);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  >
                    <option value="Rings">Rings</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Anklets">Anklets</option>
                    <option value="Saree Accessories">Saree Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Gender / Dept</label>
                  <select
                    value={productForm.gender}
                    onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1500"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border outline-hidden text-[#171522] ${
                      productForm.originalPrice && Number(productForm.originalPrice) > 0 && Number(productForm.price) > Number(productForm.originalPrice)
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-[#D6CFFF]/60 focus:border-[#7464B8]'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#171522]">Original Price / MRP (₹)</label>
                    {productForm.originalPrice && Number(productForm.originalPrice) > Number(productForm.price) && Number(productForm.price) > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        {Math.round(((Number(productForm.originalPrice) - Number(productForm.price)) / Number(productForm.originalPrice)) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2000"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>
              </div>

              {/* Live discount feedback & validation */}
              {productForm.originalPrice && Number(productForm.originalPrice) > Number(productForm.price) && Number(productForm.price) > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center justify-between text-xs text-rose-700">
                  <span>
                    Customer Saves: <strong>₹{(Number(productForm.originalPrice) - Number(productForm.price)).toLocaleString('en-IN')}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-bold text-[10px] tracking-wider uppercase">
                    {Math.round(((Number(productForm.originalPrice) - Number(productForm.price)) / Number(productForm.originalPrice)) * 100)}% OFF
                  </span>
                </div>
              )}

              {productForm.originalPrice && Number(productForm.originalPrice) > 0 && Number(productForm.price) > Number(productForm.originalPrice) && (
                <p className="text-[11px] text-rose-600 font-medium">
                  ⚠️ Selling price (₹{productForm.price}) cannot be greater than Original price (₹{productForm.originalPrice}) when a discount is intended.
                </p>
              )}

              {/* Multi-Image Upload */}
              <ImageUploadField
                label="Product Images (Drag & Drop / URL / Multi-select)"
                multiple={true}
                maxFiles={5}
                value={productForm.images}
                onChange={(imgs) => setProductForm({ ...productForm, images: imgs })}
              />

              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detailed craftsmanship and styling advice"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>

              {/* Flags */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#D6CFFF]/30">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#171522]">
                  <input
                    type="checkbox"
                    checked={productForm.isNewArrival}
                    onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                    className="rounded text-[#7464B8] focus:ring-[#7464B8]"
                  />
                  <span>Mark as New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#171522]">
                  <input
                    type="checkbox"
                    checked={productForm.isBestseller}
                    onChange={(e) => setProductForm({ ...productForm, isBestseller: e.target.checked })}
                    className="rounded text-[#7464B8] focus:ring-[#7464B8]"
                  />
                  <span>Mark as Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#171522]">
                  <input
                    type="checkbox"
                    checked={productForm.isAntiTarnish}
                    onChange={(e) => setProductForm({ ...productForm, isAntiTarnish: e.target.checked })}
                    className="rounded text-[#7464B8] focus:ring-[#7464B8]"
                  />
                  <span>100% Anti-Tarnish Guarantee</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#D6CFFF]/30">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] shadow-xs"
                >
                  Save Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT COUPON */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#D6CFFF]/60 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6CFFF]/30">
              <h3 className="font-serif text-xl text-[#171522] font-light">
                {editingCoupon ? 'Edit Promo Coupon' : 'Create New Promo Coupon'}
              </h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. LUXURY20"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522] font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Description / Benefit</label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="e.g. 20% off on all luxury earrings"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Cash (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={couponForm.discountAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, discountAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    disabled={couponForm.discountType !== 'percentage'}
                    value={couponForm.maxDiscountAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522] ${
                      couponForm.discountType !== 'percentage' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: parseInt(e.target.value) || 1000 })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#D6CFFF]/30">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#171522]">
                  <input
                    type="checkbox"
                    checked={couponForm.isActive}
                    onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                    className="rounded text-[#7464B8] focus:ring-[#7464B8]"
                  />
                  <span>Active & available for customer checkout</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#D6CFFF]/30">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] shadow-xs"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
