/**
 * Zivana Jewels AI Jewellery Stylist & Concierge Controller
 * Provides real-time intelligent recommendations, styling advice, and store assistance.
 */

const SYSTEM_PROMPT = `You are the Zivana Jewels AI Jewellery Stylist & Concierge.
Zivana Jewels is India's premier luxury anti-tarnish fine jewellery maison, creating 18K Gold PVD coated heirlooms that never turn green, black, or lose their champagne golden brilliance.
Key Collections:
- Women: Solitaire & Eternity Rings, Heritage Kundan & Pearl Chandbalis, Tennis Bracelets, Waterproof Payal Anklets, Silk-Safe Saree Brooches.
- Men: 18K Cuban & Byzantine Chains, Signet Rings, Kada Cuffs, Obsidian Studs, Full-Grain Leather Belts.
Policies:
- Complimentary Express Delivery on orders above ₹799 (₹99 for orders below ₹799).
- 7-Day Return Policy on all unworn items in original packaging.
- Cash on Delivery (COD) available with ₹15 handling fee (non-refundable).
- Support: WhatsApp (+91 98765 43210) & Email (jewelszivana@gmail.com).
Tone: Warm, regal, sophisticated, concise, and trustworthy.`;

// Intelligent luxury response generator (offline resilient)
function generateExpertStylistResponse(userQuery) {
  const query = (userQuery || '').toLowerCase();

  if (query.includes('anti-tarnish') || query.includes('waterproof') || query.includes('shower') || query.includes('gym') || query.includes('sweat')) {
    return {
      reply: 'All Zivana Jewels pieces are engineered with medical-grade 316L stainless steel and fused with real 18K Gold using vacuum Physical Vapor Deposition (PVD). Unlike traditional plating, our pieces are 100% waterproof, sweatproof, and perfume-resistant with zero discoloration.',
      suggestions: ['View Waterproof Anklets', 'Explore Men’s Chains', 'How to care for pieces?'],
    };
  }

  if (query.includes('return') || query.includes('exchange') || query.includes('refund') || query.includes('policy')) {
    return {
      reply: 'We offer a seamless 7-Day Return & Replacement Policy from the date of delivery. If you are not completely enchanted with your jewellery, simply contact our concierge team at jewelszivana@gmail.com or WhatsApp to initiate a prompt return.',
      suggestions: ['Initiate Return', 'Track My Order', 'Customer Support'],
    };
  }

  if (query.includes('shipping') || query.includes('delivery') || query.includes('799') || query.includes('charges') || query.includes('cod')) {
    return {
      reply: 'We provide Complimentary Express Delivery across India on all orders above ₹799! For orders below ₹799, standard shipping is ₹99. We also offer Cash on Delivery (COD) with a nominal ₹15 handling fee. Orders are dispatched within 24 hours via BlueDart Luxury Express.',
      suggestions: ['Check Delivery Time', 'Available Payment Methods', 'Shop Bestsellers'],
    };
  }

  if (query.includes('ring') || query.includes('size')) {
    return {
      reply: 'Most of our signature rings are thoughtfully designed with comfortable adjustable bands to fit standard Indian finger sizes (10 to 18) effortlessly. For our fixed solitaire eternity bands, you can measure the inner diameter of an existing ring in millimeters.',
      suggestions: ['Shop Women’s Rings', 'Shop Men’s Rings', 'Wedding Solitaires'],
    };
  }

  if (query.includes('men') || query.includes('chain') || query.includes('brother') || query.includes('husband') || query.includes('boyfriend')) {
    return {
      reply: 'For discerning men, our most coveted designs are the 18K Gold 7mm Ares Cuban Link Chain, the Imperial Byzantine Chain, and our Obsidian Signet Ring. All feature a bold champagne luster and waterproof durability.',
      suggestions: ['Men’s Chains', 'Men’s Bracelets & Cuffs', 'Signet Rings'],
    };
  }

  if (query.includes('wedding') || query.includes('bride') || query.includes('bridal') || query.includes('festive') || query.includes('party') || query.includes('saree')) {
    return {
      reply: 'For celebratory occasions, we recommend our Celestial Aurora Pearl Chandbalis paired with our Kundan Polki Saree Brooch (featuring silk-safe magnetic clasps that never snag delicate fabrics). Both exude timeless royal Indian opulence.',
      suggestions: ['View Chandbalis & Jhumkas', 'Saree Accessories', 'Bridal Chokers'],
    };
  }

  return {
    reply: 'Namaste! I am your Zivana Jewels Personal Stylist. Whether you are looking for timeless everyday anti-tarnish pieces, wedding heirlooms, or gift recommendations, I am delighted to assist you. What piece can I curate for you today?',
    suggestions: ['Anti-tarnish Guarantee', 'Free Delivery above ₹799', 'Curate Gift for Her', 'Men’s Bestsellers'],
  };
}

export const handleChatQuery = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Optional external AI model hook (Gemini / OpenAI) if keys are provided
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${message}` }] },
            ],
          }),
        });
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          return res.json({
            success: true,
            reply: aiText.trim(),
            suggestions: ['Anti-tarnish Guarantee', '7-Day Returns', 'Shop Bestsellers'],
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, using expert concierge fallback:', geminiErr.message);
      }
    }

    // High-performance intelligent concierge fallback
    const result = generateExpertStylistResponse(message);
    return res.json({
      success: true,
      reply: result.reply,
      suggestions: result.suggestions,
    });
  } catch (error) {
    console.error('Error in chatController:', error);
    return res.status(500).json({
      success: false,
      message: 'Our concierge is temporarily unavailable. Please reach out via WhatsApp at +91 98765 43210.',
    });
  }
};
