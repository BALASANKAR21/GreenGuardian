import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: String,
  photoURL: String,
  preferences: {
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      wateringReminders: {
        type: Boolean,
        default: true
      },
      healthAlerts: {
        type: Boolean,
        default: true
      }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: undefined
      }
    }
  },
  stats: {
    plantsCount: {
      type: Number,
      default: 0
    },
    identificationCount: {
      type: Number,
      default: 0
    },
    successfulIdentifications: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Add indices for better query performance
userSchema.index({ 'preferences.location': '2dsphere' });
userSchema.index({ lastActive: -1 });

// Update lastActive timestamp on document updates
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);