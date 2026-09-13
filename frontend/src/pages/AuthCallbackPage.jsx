import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Cleanly redirect any traffic to /account or the saved redirect destination
    const savedRedirect = sessionStorage.getItem('ocean_oauth_redirect');
    sessionStorage.removeItem('ocean_oauth_redirect');
    const redirectParam = savedRedirect || searchParams.get('redirect');
    const destination =
      redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
        ? redirectParam
        : '/account';

    const timer = setTimeout(() => {
      navigate(destination, { replace: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF9FF] py-16 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-[#D6CFFF]/60 shadow-[0_20px_50px_-15px_rgba(23,21,31,0.07)] text-center space-y-5"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#7464B8]">
          Zivana Jewels Client Portal
        </span>
        <div className="space-y-4 py-4">
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#D6CFFF]/40 animate-ping" />
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#17151F] to-[#2A2635] flex items-center justify-center text-[#D6CFFF] shadow-md">
              <Sparkles className="w-5 h-5 text-[#D6CFFF] animate-pulse" />
            </div>
          </div>
          <h2 className="font-serif text-2xl font-light text-[#17151F]">
            Directing to Patron Portal
          </h2>
          <p className="text-xs text-gray-500 font-light leading-relaxed max-w-xs mx-auto">
            Please wait while we transfer you to your account...
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 text-[#7464B8] text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-[#7464B8]" />
            <span>Redirecting</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

