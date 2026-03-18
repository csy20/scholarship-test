const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

const classToGroup = (cls) => {
  if (cls <= 3)  return '1-3';
  if (cls <= 5)  return '4-5';
  if (cls <= 8)  return '6-8';
  if (cls <= 10) return '9-10';
  return '11-12';
};

// Get 50 questions for a class: 20 logical, 15 english, 15 gk
router.get('/:class', async (req, res) => {
  try {
    const group = classToGroup(parseInt(req.params.class));
    const [logical, english, gk] = await Promise.all([
      Question.aggregate([{ $match: { classGroup: group, subject: 'logical' } }, { $sample: { size: 20 } }]),
      Question.aggregate([{ $match: { classGroup: group, subject: 'english' } }, { $sample: { size: 15 } }]),
      Question.aggregate([{ $match: { classGroup: group, subject: 'gk'      } }, { $sample: { size: 15 } }])
    ]);
    res.json({ success: true, questions: [...logical, ...english, ...gk] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
