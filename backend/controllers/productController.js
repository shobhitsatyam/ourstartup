import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

export const PRODUCT_CARD_FIELDS = '_id name slug price originalPrice discount images image rating totalReviews gender category subCategory isNewArrival isBestseller isTrending isAntiTarnish sizes inStock isActive';

// In-memory cache for curated homepage highlights
let curatedHighlightsCache = null;
let curatedHighlightsCacheExpiry = 0;

export const invalidateCuratedHighlightsCache = () => {
  curatedHighlightsCache = null;
  curatedHighlightsCacheExpiry = 0;
};

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
        const cleaned = category.toLowerCase().replace(/[-_]/g, ' ').trim();
        let catRegex;
        if (cleaned.includes('ring') && !cleaned.includes('ear') && !cleaned.includes('nose')) {
          catRegex = new RegExp('ring', 'i');
        } else if (cleaned.includes('ear') || cleaned.includes('stud') || cleaned.includes('lobe')) {
          catRegex = new RegExp('(earring|ear stud|lobe)', 'i');
        } else if (cleaned.includes('neck') || cleaned.includes('chain') || cleaned.includes('choker') || cleaned.includes('mangal') || cleaned.includes('pendant')) {
          catRegex = new RegExp('(necklace|chain|choker|pendant|mangal)', 'i');
        } else if (cleaned.includes('brace') || cleaned.includes('bangle') || cleaned.includes('kada') || cleaned.includes('cuff')) {
          catRegex = new RegExp('(bracelet|bangle|kada|cuff)', 'i');
        } else if (cleaned.includes('anklet') || cleaned.includes('payal')) {
          catRegex = new RegExp('(anklet|payal)', 'i');
        } else if (cleaned.includes('saree')) {
          catRegex = new RegExp('saree', 'i');
        } else {
          catRegex = new RegExp(`^${cleaned.replace(/&/g, '(&|and)')}$`, 'i');
        }
        query.category = { $regex: catRegex };
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

      // Parallelize count and find queries for 2x faster product listing response
      const [totalProducts, products] = await Promise.all([
        Product.countDocuments(query),
        Product.find(query).select(PRODUCT_CARD_FIELDS).sort(sortOption).skip(skip).limit(pageSize).lean(),
      ]);

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
        const target = category.toLowerCase().replace(/[-_]/g, ' ').trim();
        list = list.filter((p) => {
          const pCat = (p.category || '').toLowerCase();
          const pSub = (p.subCategory || '').toLowerCase();
          if (target.includes('ring') && !target.includes('ear') && !target.includes('nose')) {
            return (pCat.includes('ring') || pSub.includes('ring')) && !pCat.includes('ear') && !pCat.includes('nose');
          }
          if (target.includes('ear') || target.includes('stud') || target.includes('lobe')) {
            return pCat.includes('ear') || pSub.includes('ear') || pCat.includes('stud') || pCat.includes('lobe');
          }
          if (target.includes('neck') || target.includes('chain') || target.includes('choker') || target.includes('pendant')) {
            return pCat.includes('neck') || pSub.includes('neck') || pCat.includes('chain') || pSub.includes('chain') || pCat.includes('choker');
          }
          if (target.includes('brace') || target.includes('bangle') || target.includes('kada')) {
            return pCat.includes('brace') || pSub.includes('brace') || pCat.includes('bangle') || pCat.includes('kada');
          }
          if (target.includes('anklet') || target.includes('payal')) {
            return pCat.includes('anklet') || pSub.includes('anklet') || pCat.includes('payal');
          }
          return pCat.includes(target) || pSub.includes(target);
        });
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
      const product = await Product.findOne({ slug: req.params.slug, isActive: true }).lean();
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      // Run reviews and related products in parallel
      const [reviews, relatedProducts] = await Promise.all([
        Review.find({ product: product._id }).sort({ createdAt: -1 }).lean(),
        Product.find({
          _id: { $ne: product._id },
          gender: product.gender,
          isActive: true,
        }).select(PRODUCT_CARD_FIELDS).limit(10).lean(),
      ]);

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
    // Serve from server in-memory cache if fresh (sub-millisecond response)
    if (curatedHighlightsCache && Date.now() < curatedHighlightsCacheExpiry) {
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
      return res.json({
        success: true,
        data: curatedHighlightsCache,
        cached: true,
      });
    }

    if (isMongoConnected) {
      // Execute all highlight queries in parallel with lean document projection
      const [rawNewArrivals, rawBestsellers, rawTrending, activePool] = await Promise.all([
        Product.find({ isNewArrival: true, isActive: true }).select(PRODUCT_CARD_FIELDS).lean().limit(16),
        Product.find({ isBestseller: true, isActive: true }).select(PRODUCT_CARD_FIELDS).lean().limit(16),
        Product.find({ isTrending: true, isActive: true }).select(PRODUCT_CARD_FIELDS).lean().limit(16),
        Product.find({ isActive: true }).select(PRODUCT_CARD_FIELDS).lean().limit(24),
      ]);

      let newArrivals = [...rawNewArrivals];
      let bestsellers = [...rawBestsellers];
      const trending = [...rawTrending];

      // In-memory backfill from active pool if fewer than 16 products exist
      if (newArrivals.length < 16) {
        const existingIds = new Set(newArrivals.map((p) => p._id.toString()));
        const moreNew = activePool.filter((p) => !existingIds.has(p._id.toString()));
        newArrivals = [...newArrivals, ...moreNew].slice(0, 16);
      }
      if (bestsellers.length < 16) {
        const existingIds = new Set(bestsellers.map((p) => p._id.toString()));
        const moreBest = activePool.filter((p) => !existingIds.has(p._id.toString()));
        bestsellers = [...bestsellers, ...moreBest].slice(0, 16);
      }

      const responseData = { newArrivals, bestsellers, trending };
      curatedHighlightsCache = responseData;
      curatedHighlightsCacheExpiry = Date.now() + 5 * 60 * 1000; // 5 mins cache

      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
      return res.json({
        success: true,
        data: responseData,
      });
    } else {
      let newArrivals = mockStore.products.filter((p) => p.isNewArrival && p.isActive !== false).slice(0, 16);
      let bestsellers = mockStore.products.filter((p) => p.isBestseller && p.isActive !== false).slice(0, 16);
      const trending = mockStore.products.filter((p) => p.isTrending && p.isActive !== false).slice(0, 16);

      const allActive = mockStore.products.filter((p) => p.isActive !== false);
      if (newArrivals.length < 16) {
        const rest = allActive.filter((p) => !newArrivals.some((n) => n._id.toString() === p._id.toString()));
        newArrivals = [...newArrivals, ...rest].slice(0, 16);
      }
      if (bestsellers.length < 16) {
        const rest = allActive.filter((p) => !bestsellers.some((b) => b._id.toString() === p._id.toString()));
        bestsellers = [...bestsellers, ...rest].slice(0, 16);
      }

      const responseData = { newArrivals, bestsellers, trending };
      curatedHighlightsCache = responseData;
      curatedHighlightsCacheExpiry = Date.now() + 5 * 60 * 1000;

      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
      return res.json({
        success: true,
        data: responseData,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
