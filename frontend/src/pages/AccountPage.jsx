import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Package,
  Heart,
  MapPin,
  Award,
  Settings,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import RewardsCard from '../components/RewardsCard';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

export default function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { user, isAuthenticated, isAdmin, login, register, logout, updateProfile, refreshUser } = useAuth();
  const { wishlist } = useWishlist();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Auth Form State (For unauthenticated visitors)
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [loginEmail, setLoginEmail] = useState('riya.sharma@example.com');
  const [loginPassword, setLoginPassword] = useState('Customer@123');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    house: '',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    landmark: '',
    isDefault: false,
  });

  // Rewards State
  const [rewardsData, setRewardsData] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'orders') {
        setOrdersLoading(true);
        api.get('/orders/my-orders').then((res) => {
          if (res.data?.success) setOrders(res.data.data || []);
        }).finally(() => setOrdersLoading(false));
      } else if (activeTab === 'addresses') {
        api.get('/auth/addresses').then((res) => {
          if (res.data?.success) setAddresses(res.data.data || []);
        });
      } else if (activeTab === 'rewards') {
        api.get('/rewards/my-rewards').then((res) => {
          if (res.data?.success) setRewardsData(res.data.data);
        });
      }
    }
  }, [isAuthenticated, activeTab]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    const res = await login(loginEmail, loginPassword);
    setAuthLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    const res = await register(regName, regEmail, regPhone, regPassword);
    setAuthLoading(false);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const payload = { name: profileName, phone: profilePhone };
    if (newPassword) payload.password = newPassword;
    await updateProfile(payload);
    setNewPassword('');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/addresses', addressForm);
      if (res.data?.success) {
        setAddresses((prev) => [res.data.data, ...prev]);
        setShowAddressModal(false);
        addToast('Address saved successfully', 'success');
      }
    } catch (e) {
      addToast(e.response?.data?.message || 'Error saving address', 'error');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      await api.delete(`/auth/addresses/${addrId}`);
      setAddresses((prev) => prev.filter((a) => a._id !== addrId));
      addToast('Address removed', 'info');
    } catch (e) {
      addToast('Failed to delete address', 'error');
    }
  };

  // UNAUTHENTICATED LOGIN / REGISTER PORTAL
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF9FF] py-16 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white p-8 sm:p-10 border border-[#D6CFFF]/60 shadow-2xl space-y-6"
          >
            {/* Header */}
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#7464B8]">
                Ocean Jewel Client Portal
              </span>
              <h1 className="font-serif text-3xl font-light text-[#17151F] mt-1">
                {authMode === 'login' ? 'WELCOME BACK' : 'BECOME A PATRON'}
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                {authMode === 'login'
                  ? 'Access your orders, saved addresses, and Ocean Points'
                  : 'Join today and receive 50 complimentary Ocean Points'}
              </p>
            </div>

            {/* Switch Tabs */}
            <div className="flex rounded-2xl bg-gray-100 p-1 text-xs font-bold">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  authMode === 'login' ? 'bg-[#17151F] text-white shadow' : 'text-gray-600 hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  authMode === 'register' ? 'bg-[#17151F] text-white shadow' : 'text-gray-600 hover:text-black'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Fast Demo Credentials Help */}
            {authMode === 'login' && (
              <div className="p-3 rounded-xl bg-[#F8F7FF] border border-[#D6CFFF]/40 text-[11px] text-gray-600 space-y-1">
                <p className="font-bold text-[#17151F]">⚡ Quick One-Click Demo Logins:</p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('riya.sharma@example.com');
                      setLoginPassword('Customer@123');
                    }}
                    className="px-2 py-1 bg-white border border-gray-200 rounded-lg font-medium hover:border-black"
                  >
                    Client (550 Pts)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('admin@oceanjewel.com');
                      setLoginPassword('');
                    }}
                    className="px-2 py-1 bg-[#17151F] text-[#D6CFFF] rounded-lg font-medium"
                  >
                    Admin Email
                  </button>
                </div>
              </div>
            )}

            {/* Login Form */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-[#17151F] text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-[#2A2635] shadow-lg btn-shine"
                >
                  {authLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Kavita Patel"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Password *</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 bg-[#17151F] text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-[#2A2635] shadow-lg btn-shine"
                >
                  {authLoading ? 'Creating Account...' : 'Register & Claim 50 Points'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED USER PORTAL
  return (
    <div className="min-h-screen bg-[#FAF9FF] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Welcome Banner Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#17151F] via-[#2A2635] to-[#17151F] text-white border border-[#D6CFFF]/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D6CFFF]">
              Ocean Jewel Patron Profile
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-light mt-1">
              Namaste, {user.name}
            </h1>
            <p className="text-xs text-white/60 font-light mt-0.5">{user.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Rewards Badge */}
            <div
              onClick={() => setActiveTab('rewards')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-[#D6CFFF]/40 flex items-center gap-2 cursor-pointer hover:bg-white/20 transition-colors shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#D6CFFF]" />
              <div className="text-left">
                <span className="text-[10px] text-white/60 block leading-tight">Reward Balance</span>
                <span className="text-xs font-bold text-[#D6CFFF]">{user.oceanPoints || 0} Ocean Points (₹{user.oceanPoints || 0})</span>
              </div>
            </div>

            {/* Admin Portal Link if Admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2.5 rounded-2xl bg-[#D6CFFF] text-[#17151F] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:opacity-95 transition-opacity"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}

            <button
              onClick={logout}
              className="p-2.5 rounded-2xl bg-white/10 text-white/80 hover:text-rose-400 hover:bg-white/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#D6CFFF]/30">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'orders', label: 'Orders & Tracking', icon: Package },
            { id: 'wishlist', label: 'Saved Wishlist', icon: Heart },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'rewards', label: 'Ocean Points Rewards', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#17151F] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-[#D6CFFF]/40 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D6CFFF]' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="pt-2">
          {/* 1. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl rounded-3xl bg-white p-6 sm:p-8 border border-[#D6CFFF]/60 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-medium text-gray-900 pb-4 border-b border-gray-100">
                Personal Information & Security
              </h3>

              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Email Address (Primary)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">Update Password (Leave blank to keep unchanged)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7464B8]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-[#17151F] text-white font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-[#2A2635] btn-shine"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* 2. ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 rounded-full border-2 border-[#D6CFFF] border-t-black animate-spin mx-auto" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-[#D6CFFF]/40 p-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-serif text-lg font-light text-gray-900">No Orders Placed Yet</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-4">Explore our signature anti-tarnish creations.</p>
                  <Link to="/shop" className="px-6 py-2.5 bg-[#17151F] text-white rounded-xl text-xs font-semibold uppercase tracking-wider">
                    Browse Showroom
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order._id}
                    className="p-6 rounded-3xl bg-white border border-[#D6CFFF]/60 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 text-xs">
                      <div>
                        <span className="text-gray-400">Order ID: </span>
                        <strong className="text-gray-900 font-mono text-sm">{order.orderId}</strong>
                        <span className="text-gray-400 ml-3">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#17151F] text-[#D6CFFF]">
                          {order.orderStatus}
                        </span>
                        <span className="font-bold text-sm text-gray-900">
                          ₹{order.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Ordered Items Preview */}
                    <div className="flex items-center gap-3 overflow-x-auto py-1">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 shrink-0 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                          <img src={item.image} alt={item.name} className="w-10 h-12 rounded-xl object-cover" />
                          <div className="text-xs pr-2">
                            <p className="font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                            <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Link
                        to={`/orders/${order._id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7464B8] hover:text-[#17151F]"
                      >
                        <span>View Order Timeline & Tracking</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div>
              {wishlist.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-[#D6CFFF]/40 p-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-serif text-lg font-light text-gray-900">Your Wishlist is Empty</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-4">Save pieces you love to inspect and purchase anytime.</p>
                  <Link to="/shop" className="px-6 py-2.5 bg-[#17151F] text-white rounded-xl text-xs font-semibold uppercase tracking-wider">
                    Explore Showroom
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {wishlist.map((p) => (
                    <ProductCard key={p._id || p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-xl font-medium text-gray-900">Saved Delivery Addresses</h3>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#17151F] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#2A2635]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr._id} className="p-5 rounded-3xl bg-white border border-[#D6CFFF]/60 shadow-sm space-y-2 relative">
                    {addr.isDefault && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#D6CFFF] text-[#17151F] mb-1">
                        Default Address
                      </span>
                    )}
                    <h4 className="font-bold text-sm text-gray-900">{addr.fullName}</h4>
                    <p className="text-xs text-gray-600">{addr.house}, {addr.street}</p>
                    <p className="text-xs text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-xs text-gray-500 font-medium">Mobile: {addr.phone}</p>

                    <div className="pt-3 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Address Modal */}
              <AnimatePresence>
                {showAddressModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowAddressModal(false)}
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-4"
                    >
                      <h3 className="font-serif text-xl font-medium text-gray-900">Add New Indian Delivery Address</h3>
                      <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                          className="w-full px-3.5 py-2 bg-gray-50 border rounded-xl"
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Mobile Phone *"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2 bg-gray-50 border rounded-xl"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Flat / House / Building *"
                          value={addressForm.house}
                          onChange={(e) => setAddressForm({ ...addressForm, house: e.target.value })}
                          className="w-full px-3.5 py-2 bg-gray-50 border rounded-xl"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Street & Area *"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="w-full px-3.5 py-2 bg-gray-50 border rounded-xl"
                          required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="City *"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full px-3.5 py-2 bg-gray-50 border rounded-xl"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Pincode *"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                            className="w-full px-3.5 py-2 bg-gray-50 border rounded-xl"
                            required
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="State *"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="w-full px-3.5 py-2 bg-gray-50 border rounded-xl"
                          required
                        />
                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddressModal(false)}
                            className="flex-1 py-2.5 bg-gray-100 rounded-xl font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 bg-[#17151F] text-white rounded-xl font-bold btn-shine"
                          >
                            Save Address
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 5. REWARDS TAB */}
          {activeTab === 'rewards' && (
            <RewardsCard rewardsData={rewardsData} />
          )}
        </div>
      </div>
    </div>
  );
}
