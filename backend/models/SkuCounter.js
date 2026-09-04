import mongoose from 'mongoose';
import Product from './Product.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

const skuCounterSchema = new mongoose.Schema(
  {
    categoryCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    lastNumber: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const SkuCounter = mongoose.model('SkuCounter', skuCounterSchema);

/**
 * Maps category name to 2-letter uppercase category code.
 * Supported codes:
 * Rings -> RG
 * Earrings -> ER
 * Necklaces / Chains -> NK
 * Bracelets / Bangles / Kada -> BR
 * Anklets -> AN
 * Saree Accessories -> SA
 * Belts -> BT
 * Fallback -> JW
 */
export const getCategoryCode = (category = '') => {
  const norm = String(category).trim().toLowerCase();
  if (norm.includes('ring') && !norm.includes('ear') && !norm.includes('nose')) return 'RG';
  if (norm.includes('ear') || norm.includes('stud') || norm.includes('lobe')) return 'ER';
  if (norm.includes('neck') || norm.includes('chain') || norm.includes('choker') || norm.includes('mangal') || norm.includes('pendant')) return 'NK';
  if (norm.includes('brace') || norm.includes('bangle') || norm.includes('kada') || norm.includes('cuff')) return 'BR';
  if (norm.includes('anklet') || norm.includes('payal')) return 'AN';
  if (norm.includes('saree')) return 'SA';
  if (norm.includes('belt')) return 'BT';
  return 'JW';
};

/**
 * Generates the next SKU.
 * Format: OJ-{CATEGORY_CODE}-{NUMBER}
 * e.g., OJ-RG-001, OJ-ER-001, OJ-NK-001
 * 
 * @param {string} category 
 * @param {boolean} isPreview - if true, returns the next number without incrementing counter
 * @returns {Promise<string>}
 */
export const getNextSku = async (category, isPreview = false) => {
  const code = getCategoryCode(category);
  const prefix = `OJ-${code}-`;

  if (isMongoConnected) {
    let counterDoc = await SkuCounter.findOne({ categoryCode: code });

    if (!counterDoc) {
      // Find highest existing number in Product collection for this prefix to avoid collisions with pre-existing products
      const existingProducts = await Product.find({
        sku: { $regex: new RegExp(`^${prefix}\\d+`, 'i') },
      }).select('sku');

      let maxNum = 0;
      for (const p of existingProducts) {
        if (p.sku) {
          const parts = p.sku.split('-');
          const num = parseInt(parts[2] || parts[parts.length - 1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }

      counterDoc = await SkuCounter.create({
        categoryCode: code,
        lastNumber: maxNum,
      });
    }

    if (isPreview) {
      const nextNum = counterDoc.lastNumber + 1;
      return `${prefix}${String(nextNum).padStart(3, '0')}`;
    }

    // Atomically increment counter so deleted products will NEVER cause duplicate SKUs
    const updated = await SkuCounter.findOneAndUpdate(
      { categoryCode: code },
      { $inc: { lastNumber: 1 } },
      { new: true, upsert: true }
    );

    return `${prefix}${String(updated.lastNumber).padStart(3, '0')}`;
  } else {
    // In-memory mockStore fallback
    if (!mockStore.skuCounters) {
      mockStore.skuCounters = {};
    }

    if (mockStore.skuCounters[code] === undefined) {
      let maxNum = 0;
      (mockStore.products || []).forEach((p) => {
        if (p.sku && p.sku.startsWith(prefix)) {
          const parts = p.sku.split('-');
          const num = parseInt(parts[2] || parts[parts.length - 1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      });
      mockStore.skuCounters[code] = maxNum;
    }

    if (isPreview) {
      const nextNum = mockStore.skuCounters[code] + 1;
      return `${prefix}${String(nextNum).padStart(3, '0')}`;
    }

    mockStore.skuCounters[code] += 1;
    return `${prefix}${String(mockStore.skuCounters[code]).padStart(3, '0')}`;
  }
};

export default SkuCounter;
