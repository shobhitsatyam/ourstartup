import Category from '../models/Category.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

export const getCategories = async (req, res) => {
  try {
    const { gender } = req.query;

    if (isMongoConnected) {
      const query = {};
      if (gender && gender !== 'all') {
        query.gender = gender.toLowerCase();
      }
      const categories = await Category.find(query).sort({ gender: 1, name: 1 });
      return res.json({ success: true, data: categories });
    } else {
      let list = mockStore.categories;
      if (gender && gender !== 'all') {
        list = list.filter((c) => c.gender === gender.toLowerCase());
      }
      return res.json({ success: true, data: list });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    if (isMongoConnected) {
      const category = await Category.findOne({ slug: req.params.slug });
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
      return res.json({ success: true, data: category });
    } else {
      const category = mockStore.categories.find((c) => c.slug === req.params.slug);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
      return res.json({ success: true, data: category });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
