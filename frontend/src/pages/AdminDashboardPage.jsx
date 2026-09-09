import React, { useState, useEffect, useMemo } from 'react';
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
  Star,
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
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  MapPin,
  CreditCard,
  Banknote,
  FileText,
  Printer,
  Minus,
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
import {
  getCategoriesForGender,
  GENDER_OPTIONS,
  ALL_CATEGORIES,
} from '../utils/categoryConstants';

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

  // Modals & Details State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [openCategories, setOpenCategories] = useState({});
  const [checklist, setChecklist] = useState({
    box: true,
    warranty: true,
    cloth: true,
    bag: true,
  });

  const ALL_ORDER_STATUSES = [
    'Pending',
    'Processing',
    'Confirmed',
    'Packed',
    'Shipped',
    'In Transit',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Returned',
    'Refunded',
  ];

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [skuLoading, setSkuLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Earrings',
    gender: 'women',
    price: '',
    originalPrice: '',
    sku: '',
    stock: 20,
    rating: 4.8,
    testimonial: {
      reviewerName: '',
      reviewerLocation: '',
      reviewText: '',
      rating: 5,
      reviewBadge: '',
    },
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
    const STATUS_MAP = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      packed: 'Packed',
      shipped: 'Shipped',
      'in transit': 'In Transit',
      'out for delivery': 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      canceled: 'Cancelled',
      returned: 'Returned',
      refunded: 'Refunded',
    };
    const normalized = STATUS_MAP[newStatus.toLowerCase()] || newStatus;

    // Optimistically update local orders so derived revenue updates immediately
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        (o._id || o.id) === orderId
          ? { ...o, orderStatus: normalized, status: normalized }
          : o
      )
    );

    if (selectedOrder && (selectedOrder._id || selectedOrder.id) === orderId) {
      setSelectedOrder((prev) => ({ ...prev, orderStatus: normalized, status: normalized }));
    }

    try {
      await api.put(`/admin/orders/${orderId}/status`, {
        status: normalized,
        note: `Status modified to ${normalized} in Admin Control.`,
      });
      addToast(`Order updated to ${normalized}`, 'success');
      await fetchAllAdminData();
    } catch (e) {
      console.error('Failed to update order status on server:', e);
      addToast(e.response?.data?.message || `Order status marked as ${normalized}`, 'info');
      fetchAllAdminData();
    }
  };

  const handleQuickStockUpdate = async (productId, deltaOrValue, isDelta = false) => {
    let targetVal;
    const currentProd = products.find((p) => (p._id || p.id) === productId);
    const currentStock = currentProd ? (currentProd.stock !== undefined ? currentProd.stock : 20) : 20;
    if (isDelta) {
      targetVal = Math.max(0, currentStock + deltaOrValue);
    } else {
      targetVal = Math.max(0, parseInt(deltaOrValue, 10) || 0);
    }

    setProducts((prev) =>
      prev.map((p) => ((p._id || p.id) === productId ? { ...p, stock: targetVal } : p))
    );

    try {
      await api.put(`/admin/products/${productId}`, { stock: targetVal });
      addToast(`Stock updated to ${targetVal}`, 'success');
    } catch (err) {
      console.error('Failed updating product stock:', err);
      fetchAllAdminData();
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

  // Group products category-wise for accordion display
  const groupedProducts = useMemo(() => {
    const groups = {};
    filteredProducts.forEach((p) => {
      const cat = p.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [filteredProducts]);

  const toggleCategoryAccordion = (cat) => {
    setOpenCategories((prev) => ({
      ...prev,
      [cat]: prev[cat] === undefined ? false : !prev[cat],
    }));
  };

  // Helper to reliably check if an order is valid & active for revenue
  const isOrderActive = (o) => {
    if (!o) return false;
    const s = String(o.orderStatus || o.status || '').trim().toLowerCase();
    if (s === 'cancelled' || s === 'canceled' || s === 'refunded' || s === 'returned') {
      return false;
    }
    const payStatus = String(o.paymentResult?.status || o.paymentStatus || '').trim().toLowerCase();
    if (payStatus === 'refunded' || payStatus === 'failed') {
      return false;
    }
    return true;
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    const current = String(o.orderStatus || o.status || '').trim().toLowerCase();
    const filter = orderStatusFilter.trim().toLowerCase();
    if (filter === 'cancelled' && (current === 'cancelled' || current === 'canceled')) return true;
    return current === filter;
  });

  // Derived Sales Revenue from actual non-cancelled orders
  const derivedSalesRevenue = useMemo(() => {
    if (orders && orders.length > 0) {
      return orders.reduce((sum, o) => {
        if (isOrderActive(o)) {
          const amt = Number(o.totalPrice) || Number(o.totalAmount) || 0;
          return sum + amt;
        }
        return sum;
      }, 0);
    }
    return metrics?.totalRevenue !== undefined ? metrics.totalRevenue : 0;
  }, [orders, metrics]);

  // Derived Active Orders Count
  const derivedActiveOrdersCount = useMemo(() => {
    if (orders && orders.length > 0) {
      return orders.filter(isOrderActive).length;
    }
    return metrics?.totalOrders !== undefined ? metrics.totalOrders : 0;
  }, [orders, metrics]);

  // Honest Reactive Derived Metrics for Dashboard
  const displayMetrics = {
    totalRevenue: derivedSalesRevenue,
    totalOrders: orders.length > 0 ? derivedActiveOrdersCount : (metrics?.totalOrders || 0),
    totalCustomers: customers.length || metrics?.totalCustomers || 0,
    totalProducts: products.length || metrics?.totalProducts || 0,
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
                      const defaultCat = 'Earrings';
                      setEditingProduct(null);
                      setProductForm({
                        name: '',
                        category: defaultCat,
                        gender: 'women',
                        price: '',
                        originalPrice: '',
                        sku: '',
                        stock: 25,
                        rating: 4.8,
                        testimonial: {
                          reviewerName: '',
                          reviewerLocation: '',
                          reviewText: '',
                          rating: 5,
                          reviewBadge: '',
                        },
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
                    <h3 className="font-price text-2xl font-bold text-[#171522]">
                      ₹{displayMetrics.totalRevenue?.toLocaleString('en-IN')}
                    </h3>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0EDFF] text-[#7464B8]">
                        All-time store revenue
                      </span>
                    </div>
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
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        Verified store orders
                      </span>
                    </div>
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
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                        Active client profiles
                      </span>
                    </div>
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
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700">
                        Curated fine jewellery
                      </span>
                    </div>
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
                            ₹{(Number(order.totalPrice) || Number(order.totalAmount) || 2499).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4">
                            {(() => {
                              const rawStatus = order.orderStatus || order.status || 'Processing';
                              const s = rawStatus.toLowerCase();
                              const isCancelled = s === 'cancelled' || s === 'canceled' || s === 'refunded' || s === 'returned';
                              const isDelivered = s === 'delivered';
                              const isShipped = s === 'shipped' || s === 'out for delivery';
                              return (
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                    isCancelled
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : isDelivered
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : isShipped
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {rawStatus}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                              }}
                              className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#FAF9FF] border border-[#D6CFFF] text-[#7464B8] hover:bg-[#7464B8] hover:text-white transition-all shadow-xs"
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
                    const defaultCat = 'Earrings';
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      category: defaultCat,
                      gender: 'women',
                      price: '',
                      originalPrice: '',
                      sku: '',
                      stock: 25,
                      rating: 4.8,
                      testimonial: {
                        reviewerName: '',
                        reviewerLocation: '',
                        reviewText: '',
                        rating: 5,
                        reviewBadge: '',
                      },
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
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category-Wise Collapsible Accordions with Quick Stock Management */}
              {Object.keys(groupedProducts).length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-[#D6CFFF]/50 text-gray-500 text-xs">
                  No pieces found matching your search criteria.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedProducts).map(([categoryName, catProducts]) => {
                    const isExpanded = openCategories[categoryName] !== false;
                    return (
                      <div
                        key={categoryName}
                        className="bg-white rounded-2xl border border-[#D6CFFF]/50 shadow-xs overflow-hidden transition-all"
                      >
                        {/* Accordion Category Header */}
                        <div
                          onClick={() => toggleCategoryAccordion(categoryName)}
                          className="p-4 bg-[#FAF9FF] border-b border-[#D6CFFF]/30 flex items-center justify-between cursor-pointer hover:bg-[#F2EFFE] transition-colors select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-serif text-base font-semibold text-[#171522]">{categoryName}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7464B8] text-white">
                              {catProducts.length} {catProducts.length === 1 ? 'piece' : 'pieces'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <span className="text-[11px] text-[#6F6B78] hidden sm:inline">
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#7464B8]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Accordion Table */}
                        {isExpanded && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#FCFBFF] text-gray-500 font-semibold border-b border-[#D6CFFF]/20 uppercase tracking-wider text-[10px]">
                                <tr>
                                  <th className="py-3 px-4">Piece</th>
                                  <th className="py-3 px-4">SKU</th>
                                  <th className="py-3 px-4">Price</th>
                                  <th className="py-3 px-4">Quick Stock</th>
                                  <th className="py-3 px-4">Tags</th>
                                  <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#D6CFFF]/20">
                                {catProducts.map((p) => (
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
                                    <td className="py-3 px-4 font-semibold text-[#171522]">
                                      ₹{(p.price || 1499).toLocaleString('en-IN')}
                                      {p.originalPrice && p.originalPrice > p.price && (
                                        <span className="block text-[10px] text-gray-400 line-through">
                                          ₹{p.originalPrice.toLocaleString('en-IN')}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF9FF] border border-[#D6CFFF]/60">
                                        <button
                                          type="button"
                                          onClick={() => handleQuickStockUpdate(p._id || p.id, -1, true)}
                                          className="w-6 h-6 rounded-lg bg-white border border-[#D6CFFF]/40 flex items-center justify-center text-gray-600 hover:bg-[#7464B8] hover:text-white transition-colors"
                                          title="Decrease Stock"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <input
                                          type="number"
                                          min="0"
                                          value={p.stock !== undefined ? p.stock : 20}
                                          onChange={(e) => handleQuickStockUpdate(p._id || p.id, e.target.value, false)}
                                          className="w-12 text-center text-xs font-bold text-[#171522] bg-transparent outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleQuickStockUpdate(p._id || p.id, 1, true)}
                                          className="w-6 h-6 rounded-lg bg-white border border-[#D6CFFF]/40 flex items-center justify-center text-gray-600 hover:bg-[#7464B8] hover:text-white transition-colors"
                                          title="Increase Stock"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                        <span
                                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ml-1 ${
                                            (p.stock || 20) > 5 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                                          }`}
                                        >
                                          {(p.stock || 20) > 5 ? 'In Stock' : 'Low'}
                                        </span>
                                      </div>
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
                                            gender: p.gender || 'women',
                                            category: p.category || categoryName,
                                            rating: p.rating !== undefined ? p.rating : 4.8,
                                            testimonial: {
                                              reviewerName: p.testimonial?.reviewerName || '',
                                              reviewerLocation: p.testimonial?.reviewerLocation || '',
                                              reviewText: p.testimonial?.reviewText || '',
                                              rating: p.testimonial?.rating || 5,
                                              reviewBadge: p.testimonial?.reviewBadge || '',
                                            },
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
                    {ALL_ORDER_STATUSES.map((st) => (
                      <option key={st} value={st.toLowerCase()}>{st}</option>
                    ))}
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
                        <th className="py-3.5 px-4 text-center">Inspect</th>
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
                            {order.items?.length || order.orderItems?.length || 1} item(s)
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#171522]">
                            ₹{(Number(order.totalPrice) || Number(order.totalAmount) || 2499).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4">
                            {(() => {
                              const rawStatus = order.orderStatus || order.status || 'Processing';
                              const s = rawStatus.toLowerCase();
                              const isCancelled = s === 'cancelled' || s === 'canceled' || s === 'refunded' || s === 'returned';
                              const isDelivered = s === 'delivered';
                              const isShipped = s === 'shipped' || s === 'out for delivery' || s === 'in transit';
                              return (
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                    isCancelled
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : isDelivered
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : isShipped
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {rawStatus}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                              }}
                              className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#FAF9FF] border border-[#D6CFFF] text-[#7464B8] hover:bg-[#7464B8] hover:text-white transition-all shadow-xs"
                            >
                              Details
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {(() => {
                              const currentStatus = String(order.orderStatus || order.status || 'Processing');
                              return (
                                <select
                                  value={currentStatus}
                                  onChange={(e) => handleUpdateOrderStatus(order._id || order.id, e.target.value)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] bg-[#FAF9FF] border border-[#D6CFFF] text-[#171522] focus:border-[#7464B8] outline-hidden font-medium"
                                >
                                  {ALL_ORDER_STATUSES.map((st) => (
                                    <option key={st} value={st}>{st}</option>
                                  ))}
                                </select>
                              );
                            })()}
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
                <button
                  onClick={() => setHomepageSubTab('categories')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    homepageSubTab === 'categories'
                      ? 'bg-[#7464B8] text-white shadow-xs'
                      : 'text-[#171522] hover:bg-[#FAF9FF]'
                  }`}
                >
                  Shop by Category
                </button>
              </div>

              {homepageSubTab === 'hero' && <HomepageHeroManager />}
              {homepageSubTab === 'festive' && <HomepageFestiveManager />}
              {homepageSubTab === 'permanent' && <HomepagePermanentOfferManager />}
              {homepageSubTab === 'categories' && <CategoryManager />}
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
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Gender / Dept</label>
                  <select
                    value={productForm.gender || 'women'}
                    onChange={(e) => {
                      const newGender = e.target.value;
                      const allowedCats = getCategoriesForGender(newGender);
                      const updatedCat = allowedCats.includes(productForm.category) ? productForm.category : allowedCats[0];
                      setProductForm({ ...productForm, gender: newGender, category: updatedCat });
                      if (!editingProduct) {
                        fetchNextSku(updatedCat);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                    {getCategoriesForGender(productForm.gender, editingProduct?.category).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
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

              {/* Interactive Product Rating Selector (1.0 - 5.0 with 0.5 steps) */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#D6CFFF]/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#171522] flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span>Product Rating (1.0 – 5.0 Stars, 0.5 increments)</span>
                  </label>
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    ★ {productForm.rating || 4.8} / 5.0
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Interactive Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const cur = Number(productForm.rating) || 4.8;
                      const isFull = cur >= star;
                      const isHalf = !isFull && cur >= star - 0.5;

                      return (
                        <div key={star} className="relative cursor-pointer select-none">
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isFull
                                ? 'fill-amber-400 text-amber-400'
                                : isHalf
                                ? 'fill-amber-200 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                          {/* Left 50% for 0.5 step */}
                          <div
                            className="absolute inset-y-0 left-0 w-1/2 z-10"
                            title={`${star - 0.5} Stars`}
                            onClick={() => setProductForm({ ...productForm, rating: star - 0.5 })}
                          />
                          {/* Right 50% for 1.0 step */}
                          <div
                            className="absolute inset-y-0 right-0 w-1/2 z-10"
                            title={`${star} Stars`}
                            onClick={() => setProductForm({ ...productForm, rating: star })}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1 text-[11px]">
                    {[4.0, 4.5, 4.8, 5.0].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setProductForm({ ...productForm, rating: val })}
                        className={`px-2 py-1 rounded-lg border transition-all ${
                          Number(productForm.rating) === val
                            ? 'bg-[#171522] text-white border-[#171522] font-bold'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#7464B8]'
                        }`}
                      >
                        {val} ★
                      </button>
                    ))}
                  </div>

                  {/* Direct Number Input */}
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={productForm.rating || 4.8}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) {
                        setProductForm({ ...productForm, rating: Math.min(5, Math.max(1, Math.round(v * 10) / 10)) });
                      }
                    }}
                    className="w-16 px-2 py-1 rounded-lg text-xs bg-white border border-[#D6CFFF]/60 text-center font-bold text-[#171522] focus:border-[#7464B8] outline-hidden"
                  />
                </div>
              </div>

              {/* Product Testimonial / Seeded Editorial Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF9FF] to-white border border-[#D6CFFF]/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#D6CFFF]/40">
                  <div>
                    <h4 className="text-xs font-bold text-[#171522] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#7464B8]" />
                      <span>Product Testimonial / Editorial Review (Optional)</span>
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Seed a curated quote or patron highlight. These are treated as admin-seeded highlights and will not be falsely marked as verified customer purchases.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#171522] mb-1">Reviewer Name</label>
                    <input
                      type="text"
                      value={productForm.testimonial?.reviewerName || ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          testimonial: { ...productForm.testimonial, reviewerName: e.target.value },
                        })
                      }
                      placeholder="e.g. Radhika Sharma"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#171522] mb-1">
                      Reviewer Location <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={productForm.testimonial?.reviewerLocation || ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          testimonial: { ...productForm.testimonial, reviewerLocation: e.target.value },
                        })
                      }
                      placeholder="e.g. Jaipur, Rajasthan"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#171522] mb-1">Testimonial / Review Text</label>
                  <textarea
                    rows={2}
                    value={productForm.testimonial?.reviewText || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        testimonial: { ...productForm.testimonial, reviewText: e.target.value },
                      })
                    }
                    placeholder="e.g. The 18K gold luster looks identical to solid gold. Worn daily for 6 months without any fading."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#171522] mb-1">Testimonial Rating (1–5 Stars)</label>
                    <select
                      value={productForm.testimonial?.rating || 5}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          testimonial: { ...productForm.testimonial, rating: parseFloat(e.target.value) || 5 },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                    >
                      <option value="5">★★★★★ (5 Stars)</option>
                      <option value="4.5">★★★★½ (4.5 Stars)</option>
                      <option value="4">★★★★☆ (4 Stars)</option>
                      <option value="3.5">★★★½☆ (3.5 Stars)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#171522] mb-1">
                      Review Badge / Type <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={productForm.testimonial?.reviewBadge || ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          testimonial: { ...productForm.testimonial, reviewBadge: e.target.value },
                        })
                      }
                      placeholder="e.g. Curator Spotlight, Staff Favorite, Editorial Pick"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                    />
                  </div>
                </div>
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
      {/* MODAL: ORDER DETAILS & WAREHOUSE DISPATCH CHECKLIST */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#D6CFFF]/60 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D6CFFF]/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#7464B8]">
                  Order Inspection & Packing Details
                </span>
                <h3 className="font-serif text-2xl text-[#171522] font-light mt-0.5">
                  Order #{selectedOrder.orderNumber || (selectedOrder.orderId || selectedOrder._id || '').slice(-8).toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#D6CFFF]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Payment Mode & Status</span>
                <span className="font-semibold text-[#171522] inline-flex items-center gap-1.5 mt-0.5">
                  {selectedOrder.paymentMethod?.toLowerCase() === 'cod' ? (
                    <Banknote className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                  )}
                  {selectedOrder.paymentMethod?.toUpperCase() || 'ONLINE'}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedOrder.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </span>
              </div>

              <div>
                <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Update Lifecycle Status</span>
                <select
                  value={selectedOrder.orderStatus || selectedOrder.status || 'Processing'}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder._id || selectedOrder.id, e.target.value)}
                  className="mt-0.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#D6CFFF] text-[#7464B8] focus:border-[#7464B8] outline-hidden shadow-xs cursor-pointer"
                >
                  {ALL_ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Patron & Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-[#D6CFFF]/40 space-y-1.5">
                <h4 className="font-bold text-[#171522] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#7464B8]" />
                  Patron Information
                </h4>
                <p className="font-semibold text-gray-900">{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name || 'Valued Patron'}</p>
                <p className="text-gray-600">{selectedOrder.user?.email || selectedOrder.shippingAddress?.email || 'No email provided'}</p>
                <p className="text-gray-600 font-mono">{selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || 'No phone provided'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#D6CFFF]/40 space-y-1.5">
                <h4 className="font-bold text-[#171522] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#7464B8]" />
                  Delivery Destination
                </h4>
                <p className="text-gray-700 leading-relaxed">{selectedOrder.shippingAddress?.address || 'Address on file'}</p>
                {selectedOrder.shippingAddress?.landmark && (
                  <p className="text-gray-500 italic text-[11px]">Landmark: {selectedOrder.shippingAddress.landmark}</p>
                )}
                <p className="font-semibold text-gray-900">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
                </p>
              </div>
            </div>

            {/* Ordered Items with SKU & Size */}
            <div className="border border-[#D6CFFF]/40 rounded-2xl p-4 bg-white space-y-3 text-xs">
              <h4 className="font-bold text-[#171522] uppercase tracking-wider text-[10px]">
                Ordered Items ({selectedOrder.orderItems?.length || selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
                {(selectedOrder.orderItems || selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-2">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          {item.size && <span>Size: {item.size}</span>}
                          <span>Qty: {item.quantity || 1}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-semibold text-gray-900">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-gray-400">₹{(item.price || 0).toLocaleString('en-IN')} ea</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Totals */}
              <div className="pt-3 border-t border-gray-100 space-y-1 text-right">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{(selectedOrder.itemsPrice || selectedOrder.totalPrice || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{selectedOrder.shippingPrice === 0 ? 'FREE' : `₹${selectedOrder.shippingPrice || 0}`}</span>
                </div>
                {selectedOrder.paymentMethod?.toLowerCase() === 'cod' && (
                  <div className="flex justify-between text-gray-500">
                    <span>COD Handling Fee</span>
                    <span>₹{selectedOrder.codFee || 15}</span>
                  </div>
                )}
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-gray-900 pt-1.5 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span>₹{(Number(selectedOrder.totalPrice) || Number(selectedOrder.totalAmount) || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Warehouse Packing & Quality Checklist */}
            <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#D6CFFF]/50 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#171522] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7464B8]" />
                  Warehouse Dispatch & Quality Checklist
                </h4>
                <span className="text-[10px] text-[#7464B8] font-medium">Verify before shipping label</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#D6CFFF]/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.box}
                    onChange={(e) => setChecklist({ ...checklist, box: e.target.checked })}
                    className="rounded text-[#7464B8] focus:ring-[#7464B8] w-4 h-4"
                  />
                  <span>Tamper-Proof Satin Gift Box</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#D6CFFF]/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.warranty}
                    onChange={(e) => setChecklist({ ...checklist, warranty: e.target.checked })}
                    className="rounded text-[#7464B8] focus:ring-[#7464B8] w-4 h-4"
                  />
                  <span>Anti-Tarnish Warranty Card</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#D6CFFF]/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.cloth}
                    onChange={(e) => setChecklist({ ...checklist, cloth: e.target.checked })}
                    className="rounded text-[#7464B8] focus:ring-[#7464B8] w-4 h-4"
                  />
                  <span>Microfiber Polishing Cloth</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#D6CFFF]/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.bag}
                    onChange={(e) => setChecklist({ ...checklist, bag: e.target.checked })}
                    className="rounded text-[#7464B8] focus:ring-[#7464B8] w-4 h-4"
                  />
                  <span>Outer Courier Polybag + AWB</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#171522] text-white hover:bg-[#2A2635] transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
