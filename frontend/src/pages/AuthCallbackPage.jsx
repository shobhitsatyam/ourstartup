import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      // 1. Check for OAuth error query parameters
      const oauthError = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (oauthError) {
        console.error('Google OAuth error returned:', oauthError, errorDescription);
        const msg = errorDescription || 'Google sign-in was cancelled or failed. Please try again.';
        if (isMounted) setErrorMessage(msg);
        addToast(msg, 'error');
        setTimeout(() => navigate('/account'), 2500);
        return;
      }

      if (!isSupabaseConfigured) {
        const msg = 'Supabase environment credentials are not configured.';
        if (isMounted) setErrorMessage(msg);
        addToast(msg, 'error');
        setTimeout(() => navigate('/account'), 2500);
        return;
      }

      try {
        // 2. Fetch session from Supabase client (which automatically exchanges PKCE code or access_token)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session && session.user) {
          await processSessionUser(session.user);
          return;
        }

        // 3. If session is not immediately ready, listen for auth state change event
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && currentSession?.user) {
            authListener?.subscription?.unsubscribe();
            await processSessionUser(currentSession.user);
          }
        });

        // 4. Timeout fallback if OAuth exchange does not resolve in 8 seconds
        setTimeout(() => {
          if (isMounted) {
            authListener?.subscription?.unsubscribe();
            setErrorMessage('Authentication timed out. Please verify your Google credentials.');
            setTimeout(() => navigate('/account'), 2000);
          }
        }, 8000);
      } catch (err) {
        console.error('OAuth Callback Processing Error:', err);
        const msg = err.message || 'Failed to complete Google authentication.';
        if (isMounted) setErrorMessage(msg);
        addToast(msg, 'error');
        setTimeout(() => navigate('/account'), 2500);
      }
    };

    const processSessionUser = async (supaUser) => {
      const email = supaUser.email;
      const name =
        supaUser.user_metadata?.full_name ||
        supaUser.user_metadata?.name ||
        email?.split('@')[0] ||
        'Valued Patron';
      const avatar =
        supaUser.user_metadata?.avatar_url ||
        supaUser.user_metadata?.picture ||
        '';
      const googleId = supaUser.id;

      // Sync with Ocean Jewel backend system
      const result = await loginWithGoogle({ email, name, avatar, googleId });

      if (result?.success) {
        // Read redirect parameter if present (e.g. ?redirect=/checkout)
        const redirectParam = searchParams.get('redirect');
        const destination = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/account';
        navigate(destination, { replace: true });
      } else {
        const errorMsg = result?.message || 'Failed to synchronize user account with server.';
        if (isMounted) setErrorMessage(errorMsg);
        setTimeout(() => navigate('/account'), 2500);
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate, loginWithGoogle, addToast]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF9FF] py-16 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-[#D6CFFF]/60 shadow-[0_20px_50px_-15px_rgba(23,21,31,0.07)] text-center space-y-5"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#7464B8]">
          Ocean Jewel Client Portal
        </span>

        {errorMessage ? (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-light text-[#17151F]">
              Authentication Issue
            </h2>
            <p className="text-xs text-rose-700 bg-rose-50/80 p-3 rounded-xl border border-rose-200/60 font-medium leading-relaxed">
              {errorMessage}
            </p>
            <p className="text-xs text-gray-500">
              Redirecting you back to the login portal...
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#D6CFFF]/40 animate-ping" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#17151F] to-[#2A2635] flex items-center justify-center text-[#D6CFFF] shadow-md">
                <Sparkles className="w-5 h-5 text-[#D6CFFF] animate-pulse" />
              </div>
            </div>
            <h2 className="font-serif text-2xl font-light text-[#17151F]">
              Connecting to Google
            </h2>
            <p className="text-xs text-gray-500 font-light leading-relaxed max-w-xs mx-auto">
              Finalizing your secure patron session. You will be redirected momentarily...
            </p>
            <div className="flex items-center justify-center gap-2 pt-2 text-[#7464B8] text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-[#7464B8]" />
              <span>Verifying credentials</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
