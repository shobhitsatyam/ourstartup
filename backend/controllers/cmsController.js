import CmsContent from '../models/CmsContent.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

// Set aggressive no-cache headers for all CMS read endpoints
const setNoCacheHeaders = (res) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
};

// @desc    Get all CMS contents
// @route   GET /api/cms
// @access  Public
export const getAllCms = async (req, res) => {
  try {
    setNoCacheHeaders(res);

    if (isMongoConnected) {
      const records = await CmsContent.find({});
      const cmsMap = {};
      records.forEach((doc) => {
        cmsMap[doc.key] = doc.data;
      });
      return res.json({
        success: true,
        data: cmsMap,
        records,
      });
    } else {
      return res.json({
        success: true,
        data: mockStore.cmsContent || {},
        records: [],
      });
    }
  } catch (error) {
    console.error('Error in getAllCms:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get CMS content by key
// @route   GET /api/cms/:key
// @access  Public
export const getCmsByKey = async (req, res) => {
  try {
    setNoCacheHeaders(res);
    const key = req.params.key?.toLowerCase()?.trim();

    if (!key) {
      return res.status(400).json({ success: false, message: 'CMS key is required' });
    }

    if (isMongoConnected) {
      const record = await CmsContent.findOne({ key });
      if (!record) {
        return res.json({
          success: true,
          key,
          data: null,
          message: `No custom CMS configuration found for key '${key}', use defaults`,
        });
      }

      return res.json({
        success: true,
        key: record.key,
        data: record.data,
        updatedAt: record.updatedAt,
      });
    } else {
      const memoryData = mockStore.cmsContent?.[key] ?? null;
      return res.json({
        success: true,
        key,
        data: memoryData,
      });
    }
  } catch (error) {
    console.error(`Error in getCmsByKey (${req.params.key}):`, error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update or create CMS content by key
// @route   PUT /api/cms/:key or PUT /api/admin/cms/:key
// @access  Private / Admin
export const updateCmsByKey = async (req, res) => {
  try {
    const key = req.params.key?.toLowerCase()?.trim();
    const { data } = req.body;

    if (!key) {
      return res.status(400).json({ success: false, message: 'CMS key is required' });
    }

    if (data === undefined) {
      return res.status(400).json({ success: false, message: 'Data payload is required' });
    }

    if (isMongoConnected) {
      const updatedRecord = await CmsContent.findOneAndUpdate(
        { key },
        {
          key,
          data,
          updatedBy: req.user?._id || null,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`✅ [Ocean Jewel CMS] Persisted live configuration for '${key}' to MongoDB Atlas`);

      return res.json({
        success: true,
        message: `CMS configuration for '${key}' successfully saved`,
        key: updatedRecord.key,
        data: updatedRecord.data,
        updatedAt: updatedRecord.updatedAt,
      });
    } else {
      if (!mockStore.cmsContent) mockStore.cmsContent = {};
      mockStore.cmsContent[key] = data;

      return res.json({
        success: true,
        message: `CMS configuration for '${key}' saved in mock memory`,
        key,
        data,
      });
    }
  } catch (error) {
    console.error(`Error in updateCmsByKey (${req.params.key}):`, error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset CMS content by key (deletes custom configuration to restore defaults)
// @route   DELETE /api/cms/:key or DELETE /api/admin/cms/:key
// @access  Private / Admin
export const resetCmsByKey = async (req, res) => {
  try {
    const key = req.params.key?.toLowerCase()?.trim();

    if (!key) {
      return res.status(400).json({ success: false, message: 'CMS key is required' });
    }

    if (isMongoConnected) {
      await CmsContent.findOneAndDelete({ key });
      console.log(`ℹ️ [Ocean Jewel CMS] Cleared custom configuration for '${key}', reverting to system defaults`);
    } else if (mockStore.cmsContent) {
      delete mockStore.cmsContent[key];
    }

    return res.json({
      success: true,
      message: `CMS configuration for '${key}' reset to defaults`,
      key,
    });
  } catch (error) {
    console.error(`Error in resetCmsByKey (${req.params.key}):`, error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
