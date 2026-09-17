import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Razorpay Client Singleton
 * Initialized with environment variables RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
 */
let razorpayInstance = null;

export const getRazorpayClient = () => {
  const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!key_id || !key_secret) {
    console.warn('[Razorpay] Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variable is missing.');
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return razorpayInstance;
};

/**
 * Verify Razorpay Checkout Payment Signature
 * Uses HMAC-SHA256 with RAZORPAY_KEY_SECRET
 * 
 * @param {Object} params
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 * @returns {boolean}
 */
export const verifyPaymentSignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!secret) {
    console.error('[Razorpay Security] RAZORPAY_KEY_SECRET is not configured on server.');
    return false;
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }

  try {
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(razorpay_signature, 'utf8');

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch (error) {
    console.error('[Razorpay Signature Error]:', error.message);
    return false;
  }
};

/**
 * Verify Razorpay Webhook Signature
 * Uses HMAC-SHA256 with RAZORPAY_WEBHOOK_SECRET against the RAW request body
 * 
 * @param {string|Buffer} rawBody
 * @param {string} signature - Header 'x-razorpay-signature'
 * @returns {boolean}
 */
export const verifyWebhookSignature = (rawBody, signature) => {
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();

  if (!webhookSecret) {
    console.error('[Razorpay Webhook Security] RAZORPAY_WEBHOOK_SECRET is not configured on server.');
    return false;
  }

  if (!rawBody || !signature) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'))
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const actualBuf = Buffer.from(signature, 'utf8');

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch (error) {
    console.error('[Razorpay Webhook Signature Error]:', error.message);
    return false;
  }
};
