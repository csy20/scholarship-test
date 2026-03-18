const express = require('express');
const router  = express.Router();
const Student = require('../models/Student');

// Register — blocks if email already submitted a test
router.post('/register', async (req, res) => {
  try {
    const { name, email, class: cls, school } = req.body;
    const existing = await Student.findOne({ email: email.toLowerCase().trim() });

    if (existing && existing.score !== null) {
      return res.status(409).json({
        success: false,
        blocked: true,
        message: `This email has already been used to attempt the test. Each email is allowed only one attempt.`,
        score: existing.score,
        total: existing.total,
        percentage: existing.percentage
      });
    }

    // If they registered but never finished — overwrite
    if (existing && existing.score === null) {
      await Student.deleteOne({ _id: existing._id });
    }

    const student = new Student({ name, email: email.toLowerCase().trim(), class: cls, school });
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
    const student    = await Student.findByIdAndUpdate(
      studentId,
      { score, total, percentage },
      { new: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, score, total, percentage, name: student.name });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
