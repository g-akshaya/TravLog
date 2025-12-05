const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
});

const entrySchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  
  // 🗺️ GeoJSON Location Field
  location: {
    type: {
      type: String, 
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false
    },
    name: {
      type: String,
      required: false
    }
  },
  
  // 🌍 NEW: Country Name for easy display
  country: {
    type: String,
    required: false
  },
  
  // 💰 Structured Expenses
  currency: { 
    type: String, 
    default: 'USD' 
  },
  expenses: [expenseSchema],

  createdAt: { type: Date, default: Date.now }
}, { collection: 'save-travel-entry' });

entrySchema.index({ location: '2dsphere' });

const entryModel = mongoose.model("save-travel-entry", entrySchema);
module.exports = entryModel;