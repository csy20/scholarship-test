const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  classGroup: { type: String, required: true }, // "1-3","4-5","6-8","9-10","11-12"
  subject: { type: String, enum: ['logical', 'english', 'gk'], required: true },
  question: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: Number, required: true } // index 0-3
});

module.exports = mongoose.model('Question', questionSchema);
