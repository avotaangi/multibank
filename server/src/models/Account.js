const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  accountNumber: {
    type: String,
    unique: true,
    required: true
  },
  accountType: {
    type: String,
    enum: ['checking', 'savings', 'credit', 'investment'],
    default: 'checking'
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'RUB', 'UAH']
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  availableBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  interestRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'closed', 'pending'],
    default: 'active'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  metadata: {
    bankName: {
      type: String,
      default: 'MultiBank'
    },
    branchCode: {
      type: String,
      default: '001'
    },
    openedDate: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes
accountSchema.index({ userId: 1, accountType: 1 });
accountSchema.index({ accountNumber: 1 });
accountSchema.index({ status: 1 });

// Generate account number before saving
accountSchema.pre('save', async function(next) {
  if (this.isNew && !this.accountNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.accountNumber = `MB${timestamp.slice(-8)}${random}`;
  }
  next();
});

// Ensure only one default account per user
accountSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Virtual for formatted balance
accountSchema.virtual('formattedBalance').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.balance / 100); // Assuming balance is stored in cents
});

// Method to check if account has sufficient funds
accountSchema.methods.hasSufficientFunds = function(amount) {
  return this.availableBalance >= amount;
};

// Method to debit account
accountSchema.methods.debit = function(amount) {
  if (!this.hasSufficientFunds(amount)) {
    throw new Error('Insufficient funds');
  }
  this.balance -= amount;
  this.availableBalance -= amount;
  return this.save();
};

// Method to credit account
accountSchema.methods.credit = function(amount) {
  this.balance += amount;
  this.availableBalance += amount;
  return this.save();
};

module.exports = mongoose.model('Account', accountSchema);
