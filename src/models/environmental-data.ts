import mongoose from 'mongoose';

const environmentalDataSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true,
    index: true
  },
  readings: {
    soilMoisture: Number,
    temperature: Number,
    humidity: Number,
    lightLevel: Number,
    airQuality: {
      co2: Number,
      tvoc: Number
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
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    enum: ['sensor', 'manual', 'forecast'],
    required: true
  }
});

// Add compound index for efficient time-series queries
environmentalDataSchema.index({ userId: 1, plantId: 1, timestamp: -1 });
environmentalDataSchema.index({ location: '2dsphere' });

// Add TTL index to automatically delete old data after 30 days
environmentalDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const EnvironmentalData = mongoose.models.EnvironmentalData || 
  mongoose.model('EnvironmentalData', environmentalDataSchema);