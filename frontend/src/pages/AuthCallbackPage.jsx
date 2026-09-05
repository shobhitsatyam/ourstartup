import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Sparkles, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    let isMounted = true;
    let resolved = false;

    const handleCallback = async () => {
      // 1. Extract params from both query string and hash fragment
      const queryParams = new URLSearchParams(window.location.search);
      const hashString = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hashString);

      const oauthError = queryParams.get('error') || hashParams.get('error');
      const errorDescription = queryParams.get('error_description') || hashParams.get('error_description');
      const errorCode = queryParams.get('error_code') || hashParams.get('error_code');

      // Check for OAuth error returned by provider / Supabase
      if (oauthError) {
        console.error('Google OAuth callback error received:', { oauthError, errorCode, errorDescription });
        let friendlyMsg = 'Google authentication could not be completed.';

        if (errorCode === 'unexpected_failure' || oauthError === 'server_error') {
          friendlyMsg =
            'Google Sign-In encountered an unexpected provider exchange error. Please check that third-party cookies are enabled or sign in with your email & password.';
        } else if (errorDescription) {
          friendlyMsg = decodeURIComponent(errorDescription.replace(/\+/g, ' '));
        }

        if (isMounted) {
          setErrorMessage(friendlyMsg);
          if (errorCode || oauthError) {
            setErrorDetails(`Code: ${errorCode || oauthError}`);
          }
        }
        addToast(friendlyMsg, 'error');
        return;
      }

      if (!isSupabaseConfigured) {
        const msg = 'Supabase environment credentials are not configured.';
        if (isMounted) setErrorMessage(msg);
        addToast(msg, 'error');
        return;
      }

      const processSessionUser = async (supaUser) => {
        if (resolved) return;
        resolved = true;

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

        // Synchronize with Ocean Jewel backend API
        const result = await loginWithGoogle({ email, name, avatar, googleId });

        if (result?.success) {
          const redirectParam = queryParams.get('redirect') || hashParams.get('redirect');
          const destination =
            redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
              ? redirectParam
              : '/account';
          navigate(destination, { replace: true });
        } else {
          const errorMsg = result?.message || 'Failed to synchronize user account with server.';
          if (isMounted) setErrorMessage(errorMsg);
        }
      };

      try {
        // 2. PKCE Authorization Code Exchange
        const authCode = queryParams.get('code') || hashParams.get('code');
        let currentSession = null;

        if (authCode) {
          try {
            const { data: exchangeData, error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(authCode);
            if (!exchangeError && exchangeData?.session) {
              currentSession = exchangeData.session;
            } else if (exchangeError) {
              console.warn('PKCE exchangeCodeForSession notice:', exchangeError.message);
            }
          } catch (codeErr) {
            console.warn('Code exchange attempt caught:', codeErr);
          }
        }

        // 3. Check existing or detected session from Supabase client
        if (!currentSession) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (session) {
            currentSession = session;
          }
        }

        if (currentSession?.user) {
          await processSessionUser(currentSession.user);
          return;
        }

        // 4. Subscribe to auth state change events
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, authSession) => {
          if (
            (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') &&
            authSession?.user
          ) {
            authListener?.subscription?.unsubscribe();
            await processSessionUser(authSession.user);
          }
        });

        // 5. Timeout safety fallback after 8 seconds
        setTimeout(() => {
          if (isMounted && !resolved) {
            authListener?.subscription?.unsubscribe();
            setErrorMessage('Authentication session timed out. Please return to the login portal and try again.');
          }
        }, 8000);
      } catch (err) {
        console.error('OAuth Callback Processing Error:', err);
        const msg = err.message || 'Failed to complete Google authentication.';
        if (isMounted) setErrorMessage(msg);
        addToast(msg, 'error');
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
            {errorDetails && (
              <p className="text-[11px] text-gray-400 font-mono">
                {errorDetails}
              </p>
            )}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/account', { replace: true })}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#17151F] text-white text-xs font-medium hover:bg-[#2A2635] transition-colors shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#D6CFFF] text-[#17151F] text-xs font-medium hover:bg-[#FAF9FF] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
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
