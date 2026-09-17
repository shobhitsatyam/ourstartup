/**
 * Razorpay Web Checkout SDK Wrapper
 * Handles dynamic script loading and invocation of Razorpay Standard Checkout modal.
 */

let razorpayScriptPromise = null;

export const loadRazorpaySDK = () => {
  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Razorpay SDK can only be loaded in a browser environment.'));
    }

    if (window.Razorpay) {
      return resolve(window.Razorpay);
    }

    // Check if script tag is already in DOM
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.Razorpay));
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay SDK script.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error('Razorpay SDK loaded but window.Razorpay is undefined.'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK from checkout.razorpay.com.'));
    document.head.appendChild(script);
  });

  return razorpayScriptPromise;
};

/**
 * Launch Razorpay Checkout Modal
 * 
 * @param {Object} config
 * @param {string} config.key - Razorpay Key ID
 * @param {number} config.amount - Amount in paise
 * @param {string} config.currency - Currency (INR)
 * @param {string} config.order_id - Razorpay Order ID (order_...)
 * @param {string} [config.name] - Merchant Name
 * @param {string} [config.description] - Order description
 * @param {Object} [config.prefill] - { name, email, contact }
 * @param {Function} config.onSuccess - Success callback receiving { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 * @param {Function} [config.onDismiss] - Callback when user closes the modal without paying
 * @param {Function} [config.onError] - Callback on payment failure
 */
export const launchRazorpayCheckout = async ({
  key,
  amount,
  currency = 'INR',
  order_id,
  name = 'Zivana Jewels',
  description = 'Exquisite Jewellery Order',
  prefill = {},
  notes = {},
  onSuccess,
  onDismiss,
  onError,
}) => {
  const RazorpayConstructor = await loadRazorpaySDK();

  if (!RazorpayConstructor) {
    throw new Error('Razorpay SDK could not be initialized.');
  }

  const razorpayKey = key || import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!razorpayKey) {
    throw new Error('Razorpay Key ID is not configured. Please check environment variables.');
  }

  const options = {
    key: razorpayKey,
    amount,
    currency,
    name,
    description,
    order_id,
    prefill: {
      name: prefill.name || '',
      email: prefill.email || '',
      contact: prefill.contact || '',
    },
    notes: {
      platform: 'Zivana Jewels Web',
      ...notes,
    },
    theme: {
      color: '#17151F',
      backdrop_color: 'rgba(23, 21, 31, 0.75)',
    },
    modal: {
      ondismiss: () => {
        if (typeof onDismiss === 'function') {
          onDismiss();
        }
      },
      escape: true,
      animation: true,
      backdropclose: false,
    },
    handler: (response) => {
      if (typeof onSuccess === 'function') {
        onSuccess(response);
      }
    },
  };

  const instance = new RazorpayConstructor(options);

  if (typeof onError === 'function') {
    instance.on('payment.failed', (response) => {
      onError(response?.error || response);
    });
  }

  instance.open();
  return instance;
};
