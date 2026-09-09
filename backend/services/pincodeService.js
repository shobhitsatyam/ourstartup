/**
 * Indian Pincode Verification & Auto-Lookup Service
 * Utilizes the official India Post open directory with high-speed in-memory caching.
 */

const pincodeCache = new Map();

// Pre-fill major commercial hubs for sub-millisecond lookups
pincodeCache.set('560034', { city: 'Bengaluru', state: 'Karnataka' });
pincodeCache.set('110001', { city: 'New Delhi', state: 'Delhi' });
pincodeCache.set('400001', { city: 'Mumbai', state: 'Maharashtra' });
pincodeCache.set('700001', { city: 'Kolkata', state: 'West Bengal' });
pincodeCache.set('600001', { city: 'Chennai', state: 'Tamil Nadu' });
pincodeCache.set('500001', { city: 'Hyderabad', state: 'Telangana' });
pincodeCache.set('302001', { city: 'Jaipur', state: 'Rajasthan' });
pincodeCache.set('380001', { city: 'Ahmedabad', state: 'Gujarat' });

export const lookupIndianPincode = async (pincode) => {
  const cleanPin = String(pincode || '').trim();

  // Validate 6 digits
  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      success: false,
      message: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  // Check cache
  if (pincodeCache.has(cleanPin)) {
    const cached = pincodeCache.get(cleanPin);
    return {
      success: true,
      pincode: cleanPin,
      city: cached.city,
      state: cached.state,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Postal API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      const po = data[0].PostOffice[0];
      const city = po.District || po.Division || po.Name;
      const state = po.State;

      const result = { city, state };
      pincodeCache.set(cleanPin, result);

      return {
        success: true,
        pincode: cleanPin,
        city,
        state,
      };
    }

    return {
      success: false,
      message: 'PIN code not found. Please enter city and state manually.',
    };
  } catch (error) {
    console.warn(`Pincode lookup error for ${cleanPin}:`, error.message);
    return {
      success: false,
      message: 'PIN lookup service currently unavailable. Please enter details manually.',
    };
  }
};
