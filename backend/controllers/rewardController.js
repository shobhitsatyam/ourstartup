import User from '../models/User.js';
import RewardTransaction from '../models/RewardTransaction.js';
import { isMongoConnected } from '../config/db.js';
import { mockStore } from '../config/mockStore.js';

export const getMyRewards = async (req, res) => {
  try {
    let points = 0;
    let transactions = [];

    if (isMongoConnected) {
      const user = await User.findById(req.user._id);
      points = user ? user.oceanPoints : 0;
      transactions = await RewardTransaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    } else {
      const user = mockStore.users.find((u) => u._id.toString() === req.user._id.toString());
      points = user ? user.oceanPoints : 0;
      transactions = mockStore.rewardTransactions.filter((r) => r.user.toString() === req.user._id.toString());
    }

    const rupeeValue = points * 1;
    const redemptionThreshold = 500;
    const isEligibleForRedeem = points >= redemptionThreshold;
    const pointsNeededForNextReward = isEligibleForRedeem ? 0 : redemptionThreshold - points;
    const progressPercentage = Math.min(100, Math.round((points / redemptionThreshold) * 100));

    res.json({
      success: true,
      data: {
        pointsBalance: points,
        rupeeValue,
        redemptionThreshold,
        isEligibleForRedeem,
        pointsNeededForNextReward,
        progressPercentage,
        transactions,
        rules: [
          { rule: 'Earn 1 Ocean Point for every ₹100 spent on all orders.' },
          { rule: '1 Ocean Point equals ₹1 in value.' },
          { rule: 'Reach 500 points to unlock instant ₹500 checkout savings.' },
          { rule: 'Bonus points awarded on account registration and special events.' },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
