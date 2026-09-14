/**
 * Cashfree JS Web Checkout SDK Wrapper (Sandbox / Test Mode)
 * Docs: https://docs.cashfree.com/docs/js-integration
 */

let cashfreePromise = null;

export const loadCashfreeSDK = () => {
  if (cashfreePromise) {
    return cashfreePromise;
  }

  cashfreePromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Cashfree SDK can only be loaded in a browser environment.'));
    }

    if (window.Cashfree) {
      return resolve(window.Cashfree);
    }

    const existingScript = document.querySelector('script[src*="cashfree.com/js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.Cashfree));
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Cashfree SDK script.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        reject(new Error('Cashfree SDK loaded but window.Cashfree is undefined.'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK script from CDN.'));
    document.head.appendChild(script);
  });

  return cashfreePromise;
};

/**
 * Initializes and returns the configured Cashfree instance (Sandbox mode)
 */
export const getCashfree = async () => {
  const CashfreeClass = await loadCashfreeSDK();
  return CashfreeClass({
    mode: 'sandbox', // Strictly sandbox / test mode
  });
};

/**
 * Launches Cashfree hosted web checkout
 * @param {string} paymentSessionId - Cashfree payment_session_id returned by our backend
 * @param {string} [redirectTarget='_self'] - '_self' for full-page redirect back to return_url
 */
export const launchCashfreeCheckout = async (paymentSessionId, redirectTarget = '_self') => {
  if (!paymentSessionId) {
    throw new Error('Cashfree payment_session_id is required to launch checkout.');
  }

  const cashfree = await getCashfree();
  return cashfree.checkout({
    paymentSessionId,
    redirectTarget,
  });
};

export default {
  loadCashfreeSDK,
  getCashfree,
  launchCashfreeCheckout,
};
