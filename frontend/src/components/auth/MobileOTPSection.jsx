import React, { useState, useEffect, useRef } from 'react';
import { Phone, ArrowLeft, Loader2, CheckCircle2, RotateCw } from 'lucide-react';

export default function MobileOTPSection({ onBackToEmail, onComplete }) {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputsRef = useRef([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOTP = (e) => {
    e?.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);

    // UI state preparation: In actual Supabase integration, supabase.auth.signInWithOtp({ phone }) is called here.
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setTimer(30);
      setCanResend(false);
      // Focus first OTP input
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    }, 600);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const updated = [...otpDigits];
    updated[index] = value.slice(-1);
    setOtpDigits(updated);
    setError('');

    // Automatically jump to next input if digit entered
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const updated = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    setOtpDigits(updated);
    const nextIndex = Math.min(pasted.length, 5);
    otpInputsRef.current[nextIndex]?.focus();
  };

  const handleResend = () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      setTimer(30);
      setCanResend(false);
    }, 500);
  };

  const handleVerify = (e) => {
    e?.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }
    setLoading(true);
    setError('');

    // In future Supabase Phone OTP: supabase.auth.verifyOtp({ phone, token, type: 'sms' })
    // Structure is ready; invoke callback
    setTimeout(() => {
      setLoading(false);
      if (onComplete) {
        onComplete({ phone: `+91${phoneNumber}`, otp: fullOtp });
      }
    }, 800);
  };

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        /* STEP 1: ENTER PHONE NUMBER */
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-medium text-[#17151F]">
              Mobile Phone Verification
            </h3>
            <button
              type="button"
              onClick={onBackToEmail}
              className="text-xs text-[#7464B8] hover:text-[#17151F] flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Use Email</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 font-light leading-relaxed">
            Enter your 10-digit Indian phone number to receive a secure one-time verification passcode.
          </p>

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-gray-700 block text-[11px]">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex rounded-2xl border border-gray-200 hover:border-gray-300 focus-within:border-[#7464B8] focus-within:ring-2 focus-within:ring-[#7464B8]/15 bg-[#FBFBFF] overflow-hidden transition-all duration-150 h-12">
              <span className="inline-flex items-center px-3.5 bg-gray-100/70 border-r border-gray-200 text-xs font-bold text-gray-700 select-none shrink-0">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                  setError('');
                }}
                placeholder="98765 43210"
                className="w-full px-3.5 bg-transparent text-xs sm:text-sm text-[#17151F] placeholder-gray-400 focus:outline-none"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || phoneNumber.length < 10}
            className="w-full h-12 bg-[#17151F] text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded-2xl hover:bg-[#2A2635] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D6CFFF]" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <span>Send OTP Code</span>
            )}
          </button>
        </form>
      ) : (
        /* STEP 2: VERIFY 6-DIGIT OTP */
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-medium text-[#17151F]">
              Enter Verification Code
            </h3>
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtpDigits(['', '', '', '', '', '']);
                setError('');
              }}
              className="text-xs text-[#7464B8] hover:text-[#17151F] flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Number</span>
            </button>
          </div>

          <p className="text-xs text-gray-600 font-light leading-relaxed">
            We sent a 6-digit passcode to{' '}
            <strong className="text-[#17151F] font-semibold">+91 {phoneNumber}</strong>.
          </p>

          {/* 6 Digit Input Boxes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className="w-11 sm:w-12 h-12 sm:h-13 text-center font-bold text-base sm:text-lg rounded-xl border border-gray-200 bg-[#FBFBFF] text-[#17151F] focus:outline-none focus:border-[#7464B8] focus:ring-2 focus:ring-[#7464B8]/20 transition-all"
                />
              ))}
            </div>

            {error && <p className="text-[11px] text-rose-600 font-medium text-center">{error}</p>}
          </div>

          {/* Resend & Timer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
            <span>Didn't receive the code?</span>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="font-bold text-[#7464B8] hover:text-[#17151F] underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>Resend OTP</span>
              </button>
            ) : (
              <span className="font-medium text-gray-400">
                Resend in 00:{timer < 10 ? `0${timer}` : timer}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otpDigits.some((d) => !d)}
            className="w-full h-12 bg-[#17151F] text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded-2xl hover:bg-[#2A2635] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D6CFFF]" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
