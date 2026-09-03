import mongoose from 'mongoose';

const rewardTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    points: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['EARNED', 'REDEEMED', 'BONUS', 'REFUNDED'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const RewardTransaction = mongoose.model('RewardTransaction', rewardTransactionSchema);
export default RewardTransaction;
