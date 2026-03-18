const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Register student
router.post('/register', async (req, res) => {
  try {
    const { name, email, class: cls, school } = req.body;
    const student = new Student({ name, email, class: cls, school });
    await student.save();
    res.json({ success: true, studentId: student._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Submit score
router.post('/submit', async (req, res) => {
  try {
    const { studentId, score, total } = req.body;
    const percentage = Math.round((score / total) * 100);
    const student = await Student.findByIdAndUpdate(
      studentId,
      { score, total, percentage },
      { new: true }
    );
    res.json({ success: true, score, total, percentage, name: student.name });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
