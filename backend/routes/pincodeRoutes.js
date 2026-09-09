import express from 'express';
import { lookupIndianPincode } from '../services/pincodeService.js';

const router = express.Router();

// GET /api/shipping/pincode/:pincode
router.get('/:pincode', async (req, res) => {
  const result = await lookupIndianPincode(req.params.pincode);
  if (result.success) {
    return res.json(result);
  }
  return res.status(404).json(result);
});

export default router;
