const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: function() {
      return this.type !== 'deposit';
    }
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: function() {
      return this.type !== 'withdrawal';
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['transfer', 'deposit', 'withdrawal', 'payment', 'refund'],
    required: true
  },
  category: {
    type: String,
    enum: ['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'education', 'other'],
    default: 'other'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'RUB', 'UAH']
  },
  exchangeRate: {
    type: Number,
    default: 1
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  reference: {
    type: String,
    default: ''
  },
  metadata: {
    location: {
      type: String,
      default: ''
    },
    merchant: {
      type: String,
      default: ''
    },
    tags: [{
      type: String
    }],
    receipt: {
      type: String, // URL to receipt image
      default: ''
    }
  },
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    exchangeFee: {
      type: Number,
      default: 0
    }
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ fromAccount: 1, createdAt: -1 });
transactionSchema.index({ toAccount: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ transactionId: 1 });

// Generate transaction ID before saving
transactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionId) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.transactionId = `TXN${timestamp.slice(-10)}${random}`;
  }
  next();
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount / 100);
});

// Virtual for total amount including fees
transactionSchema.virtual('totalAmount').get(function() {
  return this.amount + this.fees.processingFee + this.fees.exchangeFee;
});

// Method to mark transaction as completed
transactionSchema.methods.complete = function() {
  this.status = 'completed';
  this.processedAt = new Date();
  return this.save();
};

// Method to mark transaction as failed
transactionSchema.methods.fail = function() {
  this.status = 'failed';
  this.processedAt = new Date();
  return this.save();
};

// Static method to get user's transaction summary
transactionSchema.statics.getUserSummary = async function(userId, startDate, endDate) {
  const match = { userId: new mongoose.Types.ObjectId(userId) };
  
  if (startDate && endDate) {
    match.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);
