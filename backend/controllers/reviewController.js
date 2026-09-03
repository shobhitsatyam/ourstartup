import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and review comment are required' });
    }

    if (isMongoConnected) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      await Review.create({
        user: req.user._id,
        userName: req.user.name,
        product: productId,
        rating: Number(rating),
        title: title || '',
        comment,
        images: images || [],
        isVerifiedPurchase: true,
      });

      const allReviews = await Review.find({ product: productId });
      const totalRating = allReviews.reduce((acc, item) => acc + item.rating, 0);
      const avgRating = Number((totalRating / allReviews.length).toFixed(1));

      product.rating = avgRating;
      product.numReviews = allReviews.length;
      await product.save();

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your verified review has been published.',
        data: { rating: avgRating, numReviews: allReviews.length },
      });
    } else {
      const product = mockStore.products.find((p) => p._id.toString() === productId.toString());
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      const newRev = {
        _id: `rev_${Date.now()}`,
        user: req.user._id,
        userName: req.user.name,
        product: productId,
        rating: Number(rating),
        title: title || '',
        comment,
        images: images || [],
        isVerifiedPurchase: true,
        createdAt: new Date().toISOString(),
      };
      mockStore.reviews.push(newRev);

      const allProductReviews = mockStore.reviews.filter((r) => r.product.toString() === productId.toString());
      const totalRating = allProductReviews.reduce((acc, item) => acc + item.rating, 0);
      const avgRating = Number((totalRating / allProductReviews.length).toFixed(1));

      product.rating = avgRating;
      product.numReviews = allProductReviews.length;

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your verified review has been published.',
        data: { rating: avgRating, numReviews: allProductReviews.length },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    if (isMongoConnected) {
      const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
      return res.json({ success: true, data: reviews });
    } else {
      const reviews = mockStore.reviews.filter((r) => r.product.toString() === req.params.productId.toString());
      return res.json({ success: true, data: reviews });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
