const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  
  // 🧭 New GeoJSON Location Field
  location: {
    type: {
      type: String, // Must be 'Point' for GeoJSON Point
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number], // [<longitude>, <latitude>] format
      required: false
    },
    // Optional: Store a human-readable name for display
    name: {
      type: String,
      required: false
    }
  },
  
  createdAt: { type: Date, default: Date.now }
}, { collection: 'save-travel-entry' });

// IMPORTANT: Create a 2dsphere index for geospatial queries
entrySchema.index({ location: '2dsphere' });

const entryModel = mongoose.model("save-travel-entry", entrySchema);
module.exports = entryModel;