import crypto from 'crypto';

// Cashfree Environment Configuration
export const getCashfreeConfig = () => {
  const appId = (process.env.CASHFREE_APP_ID || '').trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || '').trim();
  const env = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase().trim();
  const apiVersion = (process.env.CASHFREE_API_VERSION || '2023-08-01').trim();

  const isProduction = env === 'production';
  const baseUrl = isProduction
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

  return {
    appId,
    secretKey,
    env,
    apiVersion,
    baseUrl,
    isProduction,
  };
};

/**
 * Common headers for Cashfree PG API requests
 */
const getHeaders = (config) => ({
  'Content-Type': 'application/json',
  'x-client-id': config.appId,
  'x-client-secret': config.secretKey,
  'x-api-version': config.apiVersion,
});

/**
 * Format and sanitize Indian phone number for Cashfree (needs 10-digit number)
 */
export const sanitizePhoneNumber = (phone) => {
  if (!phone) return '9876543210';
  const digits = phone.toString().replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits.padEnd(10, '0');
};

/**
 * Create a new Cashfree PG Order
 * @param {Object} params
 * @param {string} params.orderId - Unique order ID for Cashfree
 * @param {number} params.orderAmount - Order amount in INR
 * @param {Object} params.customerDetails - Customer info { customer_id, customer_name, customer_email, customer_phone }
 * @param {string} params.returnUrl - Frontend return/callback URL
 * @param {string} [params.notifyUrl] - Backend webhook URL
 * @param {string} [params.orderNote] - Order note
 */
export const createCashfreePgOrder = async ({
  orderId,
  orderAmount,
  customerDetails,
  returnUrl,
  notifyUrl,
  orderNote,
}) => {
  const config = getCashfreeConfig();

  if (!config.appId || !config.secretKey) {
    throw new Error('Cashfree payment service is unavailable. Please use Razorpay online payment.');
  }

  const payload = {
    order_id: orderId,
    order_amount: Number(Number(orderAmount).toFixed(2)),
    order_currency: 'INR',
    customer_details: {
      customer_id: String(customerDetails.customer_id || 'cust_guest').slice(0, 50),
      customer_name: customerDetails.customer_name || 'Zivana Patron',
      customer_email: customerDetails.customer_email || 'patron@zivanajewels.com',
      customer_phone: sanitizePhoneNumber(customerDetails.customer_phone),
    },
    order_meta: {
      return_url: returnUrl,
    },
  };

  if (notifyUrl) {
    payload.order_meta.notify_url = notifyUrl;
  }

  if (orderNote) {
    payload.order_note = orderNote.slice(0, 200);
  }

  const response = await fetch(`${config.baseUrl}/orders`, {
    method: 'POST',
    headers: getHeaders(config),
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMsg = responseData?.message || responseData?.description || `Cashfree API returned HTTP ${response.status}`;
    console.error(`[Cashfree API Error] Order Creation Failed (${response.status}):`, errorMsg);
    throw new Error(errorMsg);
  }

  return responseData;
};

/**
 * Fetch Order details from Cashfree
 * @param {string} orderId - Cashfree order_id
 */
export const fetchCashfreePgOrder = async (orderId) => {
  const config = getCashfreeConfig();

  if (!config.appId || !config.secretKey) {
    throw new Error('Cashfree credentials are not configured in backend environment variables.');
  }

  const response = await fetch(`${config.baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: getHeaders(config),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMsg = responseData?.message || `Cashfree API returned HTTP ${response.status}`;
    console.error(`[Cashfree API Error] Fetch Order Failed (${response.status}):`, errorMsg);
    throw new Error(errorMsg);
  }

  return responseData;
};

/**
 * Fetch Payments list for an Order from Cashfree
 * @param {string} orderId - Cashfree order_id
 */
export const fetchCashfreePgOrderPayments = async (orderId) => {
  const config = getCashfreeConfig();

  if (!config.appId || !config.secretKey) {
    throw new Error('Cashfree credentials are not configured in backend environment variables.');
  }

  const response = await fetch(`${config.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
    method: 'GET',
    headers: getHeaders(config),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMsg = responseData?.message || `Cashfree API returned HTTP ${response.status}`;
    console.error(`[Cashfree API Error] Fetch Order Payments Failed (${response.status}):`, errorMsg);
    throw new Error(errorMsg);
  }

  return responseData;
};

/**
 * Cryptographically verify Cashfree Webhook signature using HMAC-SHA256
 * @param {string} signature - x-webhook-signature header
 * @param {string} rawBody - Raw unparsed request body string
 * @param {string} timestamp - x-webhook-timestamp header
 * @returns {boolean}
 */
export const verifyCashfreeWebhookSignature = (signature, rawBody, timestamp) => {
  const config = getCashfreeConfig();
  if (!config.secretKey) {
    console.error('[Cashfree Webhook] CASHFREE_SECRET_KEY is not set');
    return false;
  }

  if (!signature || !rawBody || !timestamp) {
    return false;
  }

  try {
    const dataToSign = `${timestamp}${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.secretKey)
      .update(dataToSign)
      .digest('base64');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const providedBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch (err) {
    console.error('[Cashfree Webhook] Error during signature calculation:', err.message);
    return false;
  }
};
