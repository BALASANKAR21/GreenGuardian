import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  species: String,
  identificationData: {
    confidence: Number,
    scientificName: String,
    commonNames: [String],
    family: String
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
  images: [{
    url: String,
    uploadDate: Date
  }],
  healthStatus: {
    status: {
      type: String,
      enum: ['healthy', 'needs_attention', 'sick'],
      default: 'healthy'
    },
    lastChecked: Date
  },
  environmentalData: {
    soilMoisture: Number,
    temperature: Number,
    humidity: Number,
    lastUpdated: Date
  },
  careInstructions: {
    watering: String,
    sunlight: String,
    temperature: String,
    soil: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indices for better query performance
plantSchema.index({ location: '2dsphere' });
plantSchema.index({ 'healthStatus.status': 1 });
plantSchema.index({ createdAt: -1 });

// Add middleware to update the updatedAt field
plantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Plant = mongoose.models.Plant || mongoose.model('Plant', plantSchema);