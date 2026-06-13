const express = require('express');
const router = express.Router();
const DayProgress = require('../models/DayProgress');
const Question = require('../models/Question');

// GET /api/days — list all day progress
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    const filter = {};
    if (month) filter.month = Number(month);

    const days = await DayProgress.find(filter).sort({ day: 1 });
    res.json(days);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/days/:day — get specific day with questions
router.get('/:day', async (req, res) => {
  try {
    const dayNum = Number(req.params.day);
    let dayProgress = await DayProgress.findOne({ day: dayNum });

    if (!dayProgress) {
      dayProgress = await DayProgress.create({
        day: dayNum,
        month: dayNum <= 30 ? 1 : dayNum <= 60 ? 2 : 3
      });
    }

    const questions = await Question.find({ day: dayNum }).sort({ difficulty: 1 });

    res.json({
      progress: dayProgress,
      questions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/days/:day — update day progress
router.put('/:day', async (req, res) => {
  try {
    const dayNum = Number(req.params.day);
    const updates = req.body;

    // Auto-calculate completed questions
    const solvedCount = await Question.countDocuments({ day: dayNum, status: 'solved' });
    updates.completedQuestions = solvedCount;

    const totalForDay = await Question.countDocuments({ day: dayNum });
    updates.isCompleted = solvedCount >= totalForDay && totalForDay > 0;

    const dayProgress = await DayProgress.findOneAndUpdate(
      { day: dayNum },
      updates,
      { new: true, upsert: true, runValidators: true }
    );

    res.json(dayProgress);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
