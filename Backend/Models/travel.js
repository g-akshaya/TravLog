const mongoose = require('mongoose')

const travelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { collection: 'travel_notes' });

const travelModel = mongoose.model("travel_notes", travelSchema)
module.exports = travelModel