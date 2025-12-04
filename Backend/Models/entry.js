const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'save-travel-entry' });

const entryModel = mongoose.model("save-travel-entry", entrySchema);
module.exports = entryModel;

