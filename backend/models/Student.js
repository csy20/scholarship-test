const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  email:  { type: String, required: true },
  class:  { type: Number, required: true, min: 1, max: 12 },
  school: { type: String, required: true },
  score:  { type: Number, default: null },
  total:  { type: Number, default: null },
  percentage: { type: Number, default: null },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
