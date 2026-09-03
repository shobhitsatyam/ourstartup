import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, X, Image as ImageIcon, Eye, ArrowUpDown } from 'lucide-react';
import ImageUploadField from './ImageUploadField';
import { useToast } from '../../context/ToastContext';

export default function CategoryManager() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([
    { id: '1', name: 'RINGS', gender: 'women', desc: 'Solitaires, stackables & adjustable 18K gold bands', img: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80', active: true, order: 1 },
    { id: '2', name: 'EARRINGS & CHANDBALIS', gender: 'women', desc: 'Traditional jhumkas, modern studs & ear cuffs', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80', active: true, order: 2 },
    { id: '3', name: 'CUBAN & BYZANTINE CHAINS', gender: 'men', desc: 'Heavy waterproof Cuban links & Byzantine statement chains', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80', active: true, order: 3 },
    { id: '4', name: 'BRACELETS & CUFFS', gender: 'unisex', desc: 'Tennis bracelets, kada cuffs & charm chains', img: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80', active: true, order: 4 },
    { id: '5', name: 'WATERPROOF ANKLETS', gender: 'women', desc: 'Delicate payals engineered for pools and beaches', img: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80', active: true, order: 5 },
    { id: '6', name: 'SAREE ACCESSORIES & PINS', gender: 'women', desc: 'Luxury brooches, saree clips & waist chains', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80', active: true, order: 6 },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({
    name: '',
    gender: 'women',
    desc: '',
    img: '',
    active: true,
    order: 1,
  });

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
        active: true,
        order: categories.length + 1,
      });
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Please enter category name', 'error');
      return;
    }

    if (editingCategory) {
      setCategories(categories.map((c) => (c.id === editingCategory.id ? { ...form, id: c.id } : c)));
      addToast(`Category '${form.name}' updated!`, 'success');
    } else {
      const newCat = { ...form, id: Date.now().toString() };
      setCategories([...categories, newCat]);
      addToast(`Category '${form.name}' added!`, 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this category?')) return;
    setCategories(categories.filter((c) => c.id !== id));
    addToast('Category removed', 'info');
  };

  const handleToggleActive = (id) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D6CFFF]/30">
        <div>
          <h2 className="font-serif text-2xl text-[#171522] font-light">Category Management</h2>
          <p className="text-xs text-[#6F6B78] mt-0.5">Manage jewellery categories, showcase banners, and storefront sorting order.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-[#D6CFFF]/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FF] text-[#171522] font-semibold border-b border-[#D6CFFF]/30 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6CFFF]/20">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#FAF9FF]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-gray-500 font-bold">#{cat.order}</td>
                  <td className="py-3.5 px-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF9FF] border border-[#D6CFFF]/40">
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#171522]">{cat.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF9FF] text-[#7464B8] border border-[#D6CFFF]/60">
                      {cat.gender}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">{cat.desc}</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleActive(cat.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                        cat.active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {cat.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(cat)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-[#7464B8] hover:bg-[#FAF9FF] transition-all"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#D6CFFF]/60 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6CFFF]/30">
              <h3 className="font-serif text-xl text-[#171522] font-light">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. SOLITAIRE RINGS"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Department</label>
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
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Display Sorting Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Description / Subtitle</label>
                <input
                  type="text"
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  placeholder="Brief luxury description"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                />
              </div>

              <ImageUploadField
                label="Category Banner Image"
                value={form.img}
                onChange={(val) => setForm({ ...form, img: val })}
                helperText="Upload category card banner (aspect ratio 4:5)"
              />

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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
