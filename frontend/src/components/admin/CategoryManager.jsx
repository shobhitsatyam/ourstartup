import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Eye,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  Check,
  RefreshCw,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import ImageUploadField from './ImageUploadField';
import DragDropImageUpload from './DragDropImageUpload';
import { useToast } from '../../context/ToastContext';
import {
  getCategoryCards,
  fetchCategoryCards,
  saveCategoryCardsApi,
  updateCategoryCardImageApi,
  resetCategoryCardsApi,
  DEFAULT_CATEGORY_CARDS,
  LUXURY_PRESET_IMAGES,
} from '../../utils/categoryCardStorage';

export default function CategoryManager() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState(() => getCategoryCards());
  const [isSaving, setIsSaving] = useState(false);

  // Fetch live category cards from MongoDB Atlas on mount
  useEffect(() => {
    let isMounted = true;
    fetchCategoryCards().then((liveCards) => {
      if (isMounted && liveCards) {
        setCategories(liveCards);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for storage events (multi-tab sync)
  useEffect(() => {
    const handleUpdate = () => {
      setCategories(getCategoryCards());
    };
    window.addEventListener('oceanjewel_category_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('oceanjewel_category_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({
    name: '',
    gender: 'women',
    desc: '',
    img: '',
    link: '/women',
    active: true,
    order: 1,
  });

  // Quick Image Selector Modal
  const [quickImageCat, setQuickImageCat] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState('');

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setForm({ ...cat });
    } else {
      setEditingCategory(null);
      setForm({
        name: '',
        gender: 'women',
        desc: '',
        img: '',
        link: '/women',
        active: true,
        order: categories.length + 1,
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Please enter category name', 'error');
      return;
    }

    let updated;
    if (editingCategory) {
      updated = categories.map((c) =>
        c.id === editingCategory.id || c.name === editingCategory.name
          ? { ...form, id: c.id }
          : c
      );
    } else {
      const newCat = { ...form, id: Date.now().toString() };
      updated = [...categories, newCat];
    }

    try {
      setIsSaving(true);
      await saveCategoryCardsApi(updated);
      setCategories(updated);
      setShowModal(false);
      addToast(
        editingCategory
          ? `Category '${form.name}' updated & saved live!`
          : `Category '${form.name}' added & saved live!`,
        'success'
      );
    } catch (err) {
      console.error('Save category error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed saving category cards';
      addToast(`Error saving: ${msg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category card from the live store?')) return;
    const updated = categories.filter((c) => c.id !== id);
    try {
      setIsSaving(true);
      await saveCategoryCardsApi(updated);
      setCategories(updated);
      addToast('Category removed from live store', 'info');
    } catch (err) {
      addToast('Failed to delete category card', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (id) => {
    const updated = categories.map((c) =>
      c.id === id ? { ...c, active: !c.active } : c
    );
    try {
      setIsSaving(true);
      await saveCategoryCardsApi(updated);
      setCategories(updated);
    } catch (err) {
      addToast('Failed to toggle category status', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenQuickImageModal = (cat) => {
    setQuickImageCat(cat);
    setTempImageUrl(cat.img || '');
  };

  const handleSaveQuickImage = async () => {
    if (!quickImageCat) return;
    if (!tempImageUrl.trim()) {
      addToast('Please provide a valid image URL or choose a preset', 'error');
      return;
    }
    try {
      setIsSaving(true);
      const updated = await updateCategoryCardImageApi(quickImageCat.id, tempImageUrl.trim());
      setCategories(updated);
      addToast(`Updated image for '${quickImageCat.name}'! Saved globally to MongoDB Atlas.`, 'success');
      setQuickImageCat(null);
    } catch (err) {
      console.error('Update image error:', err);
      addToast('Failed to save category image', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all category cards to default brand photography across the live store?')) {
      try {
        setIsSaving(true);
        await resetCategoryCardsApi();
        setCategories(DEFAULT_CATEGORY_CARDS);
        addToast('Category cards reset to brand defaults globally', 'info');
      } catch (err) {
        addToast('Failed to reset category cards', 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D6CFFF]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF9FF] border border-[#D6CFFF]/60 text-[10px] font-bold text-[#7464B8] uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Homepage Shop By Category Controller</span>
          </div>
          <h2 className="font-serif text-2xl text-[#171522] font-light">
            Category & Showcase Cards
          </h2>
          <p className="text-xs text-[#6F6B78] mt-0.5">
            Change images, update banner photography, and control the cards displayed on the desktop homepage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            title="Reset category cards to defaults"
            className="p-2 rounded-xl text-gray-400 hover:text-[#171522] hover:bg-white border border-[#D6CFFF]/60 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenModal()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] transition-all shadow-xs disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Grid of Category Cards (Visual Preview) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {categories.map((cat) => (
          <div
            key={cat.id || cat.name}
            className="group relative rounded-2xl overflow-hidden border border-[#D6CFFF]/60 bg-white shadow-xs hover:shadow-md transition-all flex flex-col"
          >
            {/* Image Thumbnail Container */}
            <div className="relative aspect-[4/5] bg-gray-900 overflow-hidden">
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Quick Image Change Button Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-2xs transition-opacity">
                <button
                  type="button"
                  onClick={() => handleOpenQuickImageModal(cat)}
                  className="px-3 py-1.5 rounded-lg bg-white text-[#171522] text-[10px] font-bold tracking-wider uppercase shadow-md hover:bg-[#FAF9FF] flex items-center gap-1.5 transition-all transform active:scale-95"
                >
                  <ImageIcon className="w-3 h-3 text-[#7464B8]" />
                  <span>Change Image</span>
                </button>
              </div>

              {/* Badge */}
              <div className="absolute top-2 left-2">
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-xs text-[#E8E3FF] border border-white/20">
                  {cat.gender}
                </span>
              </div>

              {/* Title on Bottom */}
              <div className="absolute bottom-2 inset-x-2 text-center text-white">
                <h4 className="font-serif text-[11px] font-medium leading-tight truncate">
                  {cat.name}
                </h4>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-2.5 flex items-center justify-between border-t border-[#D6CFFF]/30 bg-[#FAF9FF]">
              <button
                type="button"
                onClick={() => handleOpenQuickImageModal(cat)}
                className="text-[10px] text-[#7464B8] hover:text-[#5f509e] font-semibold flex items-center gap-1"
                title="Change Image"
              >
                <ImageIcon className="w-3 h-3" />
                <span>Image</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenModal(cat)}
                  className="p-1 rounded-md text-gray-400 hover:text-[#7464B8] hover:bg-white"
                  title="Edit Info"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Detailed Table */}
      <div className="bg-white rounded-2xl border border-[#D6CFFF]/50 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-[#FAF9FF] border-b border-[#D6CFFF]/30 flex items-center justify-between">
          <h3 className="font-serif text-sm font-medium text-[#171522]">
            Category Storefront Registry ({categories.length} Cards)
          </h3>
          <span className="text-[11px] text-gray-500 font-light">
            Changes auto-save to storage & sync with storefront
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FF] text-[#171522] font-semibold border-b border-[#D6CFFF]/30 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Image Preview</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Target Store Link</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6CFFF]/20">
              {categories.map((cat, idx) => (
                <tr key={cat.id || cat.name} className="hover:bg-[#FAF9FF]/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-500 font-bold">#{cat.order || idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="relative group w-12 h-14 rounded-lg overflow-hidden bg-gray-900 border border-[#D6CFFF]/40">
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleOpenQuickImageModal(cat)}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Change image"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#171522]">{cat.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF9FF] text-[#7464B8] border border-[#D6CFFF]/60">
                      {cat.gender}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-gray-500">{cat.link || `/shop`}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(cat.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                        cat.active !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {cat.active !== false ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenQuickImageModal(cat)}
                      className="px-2 py-1 rounded-lg text-[11px] font-medium bg-[#FAF9FF] border border-[#D6CFFF] text-[#7464B8] hover:bg-white transition-all inline-flex items-center gap-1"
                      title="Update Category Image"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Change Image</span>
                    </button>
                    <button
                      onClick={() => handleOpenModal(cat)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-[#7464B8] hover:bg-[#FAF9FF] transition-all"
                      title="Edit Category Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK IMAGE CHANGER MODAL */}
      {quickImageCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#D6CFFF]/60 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6CFFF]/30">
              <div>
                <span className="text-[10px] font-bold text-[#7464B8] uppercase tracking-wider">
                  Update Card Photography
                </span>
                <h3 className="font-serif text-lg text-[#171522] font-light">
                  {quickImageCat.name}
                </h3>
              </div>
              <button
                onClick={() => setQuickImageCat(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drag & Drop File Upload + URL Input */}
            <DragDropImageUpload
              label="Upload Category Photo"
              value={tempImageUrl}
              onChange={(url) => setTempImageUrl(url)}
              aspectRatio="aspect-[4/5]"
              helperText="Drag & drop JPG, PNG, or WebP (recommended 4:5 portrait ratio, up to 10MB)"
            />

            {/* Curated Luxury Preset Image Pickers */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                Or Select from Luxury Presets:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {LUXURY_PRESET_IMAGES.map((preset) => {
                  const isSelected = tempImageUrl === preset.url;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setTempImageUrl(preset.url)}
                      className={`group relative rounded-xl overflow-hidden aspect-[4/5] border transition-all ${
                        isSelected
                          ? 'border-[#7464B8] ring-2 ring-[#7464B8]/40 shadow-sm'
                          : 'border-[#D6CFFF]/50 hover:border-[#7464B8]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-1 inset-x-1 text-[8.5px] text-white font-medium truncate text-center">
                        {preset.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7464B8] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#D6CFFF]/30">
              <button
                type="button"
                onClick={() => setQuickImageCat(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickImage}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply to Homepage</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#D6CFFF]/60 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6CFFF]/30">
              <h3 className="font-serif text-xl text-[#171522] font-light">
                {editingCategory ? 'Edit Category Card' : 'Create Category Card'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. SOLITAIRE RINGS"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">
                    Department
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">
                  Target Storefront URL
                </label>
                <input
                  type="text"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="/women/rings"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>

              <div>
                <DragDropImageUpload
                  label="Category Card Image"
                  value={form.img}
                  onChange={(url) => setForm({ ...form, img: url })}
                  aspectRatio="aspect-[4/5]"
                  helperText="Drag & drop JPG, PNG, or WebP (recommended 4:5 portrait ratio)"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#D6CFFF]/30">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] shadow-xs"
                >
                  Save Category Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
