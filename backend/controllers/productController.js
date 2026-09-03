import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

export const getProducts = async (req, res) => {
  try {
    const {
      gender,
      category,
      subCategory,
      minPrice,
      maxPrice,
      rating,
      material,
      isNewArrival,
      isBestseller,
      isTrending,
      isAntiTarnish,
      search,
      sort,
      page = 1,
      limit = 24,
    } = req.query;

    if (isMongoConnected) {
      const query = { isActive: true };

      if (gender && gender !== 'all') {
        query.gender = { $in: [gender.toLowerCase(), 'unisex'] };
      }

      if (category && category !== 'all') {
        const formattedCategory = category.replace(/-/g, ' ');
        query.category = { $regex: new RegExp(`^${formattedCategory}$`, 'i') };
      }

      if (subCategory && subCategory !== 'all') {
        const formattedSubCategory = subCategory.replace(/-/g, ' ');
        query.subCategory = { $regex: new RegExp(`^${formattedSubCategory}$`, 'i') };
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      if (rating) query.rating = { $gte: Number(rating) };
      if (material) query.material = { $regex: new RegExp(material, 'i') };
      if (isNewArrival === 'true') query.isNewArrival = true;
      if (isBestseller === 'true') query.isBestseller = true;
      if (isTrending === 'true') query.isTrending = true;
      if (isAntiTarnish === 'true') query.isAntiTarnish = true;

      if (search && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { subCategory: searchRegex },
          { tags: searchRegex },
        ];
      }

      let sortOption = { createdAt: -1 };
      if (sort === 'price_asc') sortOption = { price: 1 };
      else if (sort === 'price_desc') sortOption = { price: -1 };
      else if (sort === 'rating') sortOption = { rating: -1 };
      else if (sort === 'bestseller') sortOption = { isBestseller: -1, rating: -1 };
      else if (sort === 'newest') sortOption = { createdAt: -1 };

      const pageSize = Number(limit);
      const currentPage = Number(page);
      const skip = (currentPage - 1) * pageSize;

      const totalProducts = await Product.countDocuments(query);
      const products = await Product.find(query).sort(sortOption).skip(skip).limit(pageSize);

      return res.json({
        success: true,
        data: {
          products,
          page: currentPage,
          pages: Math.ceil(totalProducts / pageSize),
          total: totalProducts,
        },
      });
    } else {
      // Memory store filtering
      let list = mockStore.products.filter((p) => p.isActive !== false);

      if (gender && gender !== 'all') {
        list = list.filter((p) => p.gender === gender.toLowerCase() || p.gender === 'unisex');
      }

      if (category && category !== 'all') {
        const target = category.toLowerCase().replace(/-/g, ' ');
        list = list.filter((p) => p.category.toLowerCase() === target || p.subCategory.toLowerCase() === target);
      }

      if (subCategory && subCategory !== 'all') {
        const target = subCategory.toLowerCase().replace(/-/g, ' ');
        list = list.filter((p) => p.subCategory.toLowerCase() === target);
      }

      if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
      if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
      if (rating) list = list.filter((p) => p.rating >= Number(rating));
      if (material) list = list.filter((p) => p.material.toLowerCase().includes(material.toLowerCase()));
      if (isNewArrival === 'true') list = list.filter((p) => p.isNewArrival);
      if (isBestseller === 'true') list = list.filter((p) => p.isBestseller);
      if (isTrending === 'true') list = list.filter((p) => p.isTrending);
      if (isAntiTarnish === 'true') list = list.filter((p) => p.isAntiTarnish);

      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }

      if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
      else if (sort === 'bestseller') list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));

      const pageSize = Number(limit);
      const currentPage = Number(page);
      const start = (currentPage - 1) * pageSize;
      const paginated = list.slice(start, start + pageSize);

      return res.json({
        success: true,
        data: {
          products: paginated,
          page: currentPage,
          pages: Math.ceil(list.length / pageSize),
          total: list.length,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    if (isMongoConnected) {
      const product = await Product.findOne({ slug: req.params.slug, isActive: true });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
      const relatedProducts = await Product.find({
        _id: { $ne: product._id },
        gender: product.gender,
        isActive: true,
      }).limit(4);

      return res.json({
        success: true,
        data: { product, reviews, relatedProducts },
      });
    } else {
      const product = mockStore.products.find((p) => p.slug === req.params.slug && p.isActive !== false);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      const reviews = mockStore.reviews.filter((r) => r.product.toString() === product._id.toString());
      const relatedProducts = mockStore.products
        .filter((p) => p._id.toString() !== product._id.toString() && p.gender === product.gender && p.isActive !== false)
        .slice(0, 4);

      return res.json({
        success: true,
        data: { product, reviews, relatedProducts },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    if (isMongoConnected) {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, data: product });
    } else {
      const product = mockStore.products.find((p) => p._id.toString() === req.params.id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, data: product });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ success: true, data: { products: [], categories: [] } });
    }

    if (isMongoConnected) {
      const regex = new RegExp(q.trim(), 'i');
      const products = await Product.find({
        isActive: true,
        $or: [{ name: regex }, { category: regex }, { tags: regex }],
      }).select('name slug price images category gender').limit(6);

      const categories = await Product.distinct('category', { category: regex, isActive: true });

      return res.json({
        success: true,
        data: { products, categories: categories.slice(0, 4) },
      });
    } else {
      const queryStr = q.toLowerCase().trim();
      const products = mockStore.products
        .filter((p) => p.name.toLowerCase().includes(queryStr) || p.category.toLowerCase().includes(queryStr))
        .slice(0, 6)
        .map((p) => ({
          _id: p._id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          images: p.images,
          category: p.category,
          gender: p.gender,
        }));

      const categories = [
        ...new Set(mockStore.categories.filter((c) => c.name.toLowerCase().includes(queryStr)).map((c) => c.name)),
      ].slice(0, 4);

      return res.json({
        success: true,
        data: { products, categories },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCuratedHighlights = async (req, res) => {
  try {
    if (isMongoConnected) {
      const newArrivals = await Product.find({ isNewArrival: true, isActive: true }).limit(8);
      const bestsellers = await Product.find({ isBestseller: true, isActive: true }).limit(8);
      const trending = await Product.find({ isTrending: true, isActive: true }).limit(8);
      return res.json({
        success: true,
        data: { newArrivals, bestsellers, trending },
      });
    } else {
      const newArrivals = mockStore.products.filter((p) => p.isNewArrival && p.isActive !== false).slice(0, 8);
      const bestsellers = mockStore.products.filter((p) => p.isBestseller && p.isActive !== false).slice(0, 8);
      const trending = mockStore.products.filter((p) => p.isTrending && p.isActive !== false).slice(0, 8);
      return res.json({
        success: true,
        data: { newArrivals, bestsellers, trending },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
