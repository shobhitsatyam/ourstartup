import React from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles, Gift, CheckCircle2, History, ArrowUpRight } from 'lucide-react';

export default function RewardsCard({ rewardsData }) {
  const points = rewardsData?.pointsBalance || 0;
  const rupeeValue = points; // 1 Point = ₹1
  const isEligible = points >= 500;
  const progress = Math.min(100, Math.round((points / 500) * 100));

  return (
    <div className="space-y-6">
      {/* Master Luxury Loyalty Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#17151F] via-[#2A2635] to-[#17151F] p-6 sm:p-8 text-white shadow-2xl border border-[#D6CFFF]/30"
      >
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D6CFFF]/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D6CFFF] text-[10px] font-bold tracking-widest uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ocean Royalty Program</span>
            </div>
            <h3 className="font-serif text-3xl sm:text-4xl font-light tracking-wide text-white">
              {points.toLocaleString('en-IN')} <span className="text-xl font-sans text-[#D6CFFF]">Points</span>
            </h3>
            <p className="text-xs text-white/70 mt-1">
              Worth <strong className="text-white font-semibold">₹{rupeeValue.toLocaleString('en-IN')}</strong> in checkout discounts
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end">
            {isEligible ? (
              <div className="px-4 py-2 rounded-2xl bg-[#D6CFFF] text-[#17151F] font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-pulse">
                <Gift className="w-4 h-4" />
                <span>₹500 Reward Ready to Redeem!</span>
              </div>
            ) : (
              <div className="text-xs text-white/60 text-left md:text-right">
                <span className="text-[#D6CFFF] font-semibold">{500 - points} more points</span> to unlock ₹500 reward
              </div>
            )}
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="relative z-10 pt-6">
          <div className="flex justify-between text-xs text-white/70 mb-2 font-medium">
            <span>Progress to Next Tier Reward</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#D6CFFF] to-[#B6ABF4] rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Rules Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-card bg-white border border-[#D6CFFF]/40">
          <div className="w-8 h-8 rounded-xl bg-[#F3EFFF] text-[#7464B8] flex items-center justify-center font-bold text-xs mb-2">
            ₹100
          </div>
          <h4 className="text-xs font-bold text-gray-900">Earn On Every Spend</h4>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
            Get 1 Ocean Point for every ₹100 spent across all fine jewellery.
          </p>
        </div>

        <div className="p-4 rounded-2xl glass-card bg-white border border-[#D6CFFF]/40">
          <div className="w-8 h-8 rounded-xl bg-[#F3EFFF] text-[#7464B8] flex items-center justify-center font-bold text-xs mb-2">
            1:1
          </div>
          <h4 className="text-xs font-bold text-gray-900">Real Cash Value</h4>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
            1 Point = ₹1 Rupee. Your accumulated points never expire.
          </p>
        </div>

        <div className="p-4 rounded-2xl glass-card bg-white border border-[#D6CFFF]/40">
          <div className="w-8 h-8 rounded-xl bg-[#F3EFFF] text-[#7464B8] flex items-center justify-center font-bold text-xs mb-2">
            500
          </div>
          <h4 className="text-xs font-bold text-gray-900">Instant Redemption</h4>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
            Redeem ₹500 directly in your cart with one tap at checkout.
          </p>
        </div>
      </div>

      {/* Points History Ledger */}
      {rewardsData?.transactions && rewardsData.transactions.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-[#D6CFFF]/40 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-800">
            <History className="w-4 h-4 text-[#7464B8]" />
            <span>Ocean Points Activity Ledger</span>
          </div>

          <div className="divide-y divide-gray-100">
            {rewardsData.transactions.map((tx) => (
              <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-gray-900">{tx.description}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className={`font-bold ${tx.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.points > 0 ? `+${tx.points}` : tx.points} Points
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
