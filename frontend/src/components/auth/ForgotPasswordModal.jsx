import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  const handleClose = () => {
    setSent(false);
    setEmail('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-[#17151F]/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D6CFFF]/60 z-10 space-y-5"
        >
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7464B8]">
                Security &amp; Account Recovery
              </span>
              <h3 className="font-serif text-2xl font-light text-[#17151F] mt-0.5">
                Reset Your Password
              </h3>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {sent ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg text-gray-900 font-medium">
                Reset Link Sent
              </h4>
              <p className="text-xs text-gray-600 font-light leading-relaxed max-w-xs mx-auto">
                If an account exists for <strong className="font-semibold text-[#17151F]">{email}</strong>, you will receive an email shortly with instructions to reset your password.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 px-6 py-2.5 bg-[#17151F] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#2A2635] transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Enter the email address registered with your Ocean Jewel account. We will send you a verified link to choose a new password.
              </p>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-gray-700 block text-[11px]">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="w-full h-12 pl-10 pr-3.5 bg-[#FBFBFF] border border-gray-200 rounded-2xl text-xs sm:text-sm text-[#17151F] placeholder-gray-400 focus:outline-none focus:border-[#7464B8] focus:ring-2 focus:ring-[#7464B8]/15 transition-all"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-12 bg-[#17151F] text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded-2xl hover:bg-[#2A2635] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D6CFFF]" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Recovery Link</span>
                    <ArrowRight className="w-4 h-4 text-[#D6CFFF]" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
