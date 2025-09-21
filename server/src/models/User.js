const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    unique: true,
    sparse: true // allows multiple null values
  },
  phone: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      telegram: {
        type: Boolean,
        default: true
      }
    }
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    pinHash: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ telegramId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Hash PIN before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('security.pinHash') && this.security.pinHash) {
    this.security.pinHash = await bcrypt.hash(this.security.pinHash, 12);
  }
  next();
});

// Compare PIN method
userSchema.methods.comparePin = async function(candidatePin) {
  if (!this.security.pinHash) return false;
  return await bcrypt.compare(candidatePin, this.security.pinHash);
};

// Get user's full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Transform output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.security.pinHash;
  return user;
};

module.exports = mongoose.model('User', userSchema);
