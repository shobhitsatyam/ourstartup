import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  getSearchSuggestions,
  getCuratedHighlights,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/curated/highlights', getCuratedHighlights);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

export default router;
