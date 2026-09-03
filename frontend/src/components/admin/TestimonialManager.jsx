import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Star, CheckCircle2, X, MessageSquareQuote, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function TestimonialManager() {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([
    {
      id: '1',
      name: 'Ananya Sharma',
      city: 'South Delhi',
      rating: 5,
      product: '18K Gold Emerald Chandbali',
      comment: 'Wore these for 3 wedding functions and continuous dancing. Zero tarnishing, absolutely feather-light on the ears!',
      verified: true,
      active: true,
      date: '2026-08-28',
    },
    {
      id: '2',
      name: 'Rohan Singhania',
      city: 'Bandra, Mumbai',
      rating: 5,
      product: 'Obsidian Signet Ring & Heavy Cuban Chain',
      comment: 'I shower and work out with the Cuban chain daily. It stays as bright as day one. Best men’s jewellery brand in India.',
      verified: true,
      active: true,
      date: '2026-08-25',
    },
    {
      id: '3',
      name: 'Dr. Meera Nambiar',
      city: 'Indiranagar, Bengaluru',
      rating: 5,
      product: 'Freshwater Pearl Royal Choker',
      comment: 'The craftsmanship and PVD coating quality rivals heritage heirloom houses at a fraction of the gold fragility.',
      verified: true,
      active: true,
      date: '2026-08-20',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [form, setForm] = useState({
    name: '',
    city: '',
    rating: 5,
    product: '',
    comment: '',
    verified: true,
    active: true,
  });

  const handleOpenModal = (rev = null) => {
    if (rev) {
      setEditingReview(rev);
      setForm({ ...rev });
    } else {
      setEditingReview(null);
      setForm({
        name: '',
        city: '',
        rating: 5,
        product: '',
        comment: '',
        verified: true,
        active: true,
      });
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) {
      addToast('Please enter name and testimonial text', 'error');
      return;
    }

    if (editingReview) {
      setReviews(reviews.map((r) => (r.id === editingReview.id ? { ...form, id: r.id, date: r.date } : r)));
      addToast('Testimonial updated!', 'success');
    } else {
      const newRev = { ...form, id: Date.now().toString(), date: new Date().toISOString().split('T')[0] };
      setReviews([newRev, ...reviews]);
      addToast('New review added!', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    setReviews(reviews.filter((r) => r.id !== id));
    addToast('Testimonial deleted', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D6CFFF]/30">
        <div>
          <h2 className="font-serif text-2xl text-[#171522] font-light">Client Testimonials & Reviews</h2>
          <p className="text-xs text-[#6F6B78] mt-0.5">Manage verified patron reviews and ratings displayed on the live homepage.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#7464B8] text-white hover:bg-[#5f509e] transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl p-5 border border-[#D6CFFF]/50 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                {rev.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              <p className="text-xs text-[#171522] font-light leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-3 border-t border-[#D6CFFF]/30 flex items-end justify-between">
              <div>
                <p className="font-semibold text-xs text-[#171522]">{rev.name}</p>
                <p className="text-[10px] text-[#6F6B78]">{rev.city} &bull; {rev.product}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenModal(rev)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#7464B8] hover:bg-[#FAF9FF]"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#D6CFFF]/60 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#D6CFFF]/30">
              <h3 className="font-serif text-xl text-[#171522] font-light">
                {editingReview ? 'Edit Testimonial' : 'Add Client Testimonial'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">City / Location</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Purchased Product</label>
                  <input
                    type="text"
                    value={form.product}
                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171522] mb-1">Star Rating (1-5)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
                  >
                    <option value={5}>5 Stars (Exceptional)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171522] mb-1">Testimonial Review</label>
                <textarea
                  rows={3}
                  required
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Customer experience and review quote"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9FF] border border-[#D6CFFF]/60 focus:border-[#7464B8] outline-hidden text-[#171522]"
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
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
