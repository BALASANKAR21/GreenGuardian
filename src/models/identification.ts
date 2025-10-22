import mongoose from 'mongoose';

const identificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  results: [{
    scientificName: String,
    commonName: String,
    confidence: Number,
    family: String,
    genus: String,
    details: mongoose.Schema.Types.Mixed
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number]
    }
  },
  metadata: {
    deviceInfo: String,
    imageSize: String,
    captureDate: Date
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date
});

// Add indices for better query performance
identificationSchema.index({ status: 1 });
identificationSchema.index({ createdAt: -1 });
identificationSchema.index({ location: '2dsphere' });

export const Identification = mongoose.models.Identification || mongoose.model('Identification', identificationSchema);