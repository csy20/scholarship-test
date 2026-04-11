const express = require('express');
const router  = express.Router();
const Student = require('../models/Student');

// Register — blocks if WhatsApp number already submitted a test
router.post('/register', async (req, res) => {
  try {
    const { name, whatsapp, class: cls, school } = req.body;
    const existing = await Student.findOne({ whatsapp: whatsapp.trim() });

    if (existing && existing.score !== null) {
      return res.status(409).json({
        success: false,
        blocked: true,
        message: `This WhatsApp number has already been used to attempt the test. Each number is allowed only one attempt.`,
        score: existing.score,
        total: existing.total,
        percentage: existing.percentage
      });
    }

    // If they registered but never finished — overwrite
    if (existing && existing.score === null) {
      await Student.deleteOne({ _id: existing._id });
    }

    const student = new Student({ name, whatsapp: whatsapp.trim(), class: cls, school });
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

// Admin — get all students
router.get('/all', async (req, res) => {
  try {
    const students = await Student.find().sort({ submittedAt: -1 });
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
