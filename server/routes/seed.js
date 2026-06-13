const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const DayProgress = require('../models/DayProgress');
const seedQuestions = require('../data/seedData');

// POST /api/seed — seed the database with 600 questions
router.post('/', async (req, res) => {
  try {
    // Check if already seeded
    const existing = await Question.countDocuments();
    if (existing > 0 && !req.query.force) {
      return res.status(400).json({
        error: 'Database already seeded. Use ?force=true to re-seed.',
        count: existing
      });
    }

    // Clear existing data if force re-seed
    if (req.query.force) {
      await Question.deleteMany({});
      await DayProgress.deleteMany({});
    }

    // Insert all questions
    const questions = seedQuestions.map(q => ({
      ...q,
      status: 'pending',
      notes: '',
      timeTaken: 0,
      solvedAt: null
    }));

    await Question.insertMany(questions);

    // Create day progress entries for all 90 days
    const dayEntries = [];
    for (let day = 1; day <= 90; day++) {
      const questionsForDay = seedQuestions.filter(q => q.day === day);
      dayEntries.push({
        day,
        month: day <= 30 ? 1 : day <= 60 ? 2 : 3,
        targetQuestions: questionsForDay.length,
        completedQuestions: 0,
        isCompleted: false
      });
    }

    await DayProgress.insertMany(dayEntries);

    const totalInserted = await Question.countDocuments();
    res.json({
      message: `Successfully seeded ${totalInserted} questions across 90 days!`,
      total: totalInserted,
      byMonth: {
        month1: seedQuestions.filter(q => q.month === 1).length,
        month2: seedQuestions.filter(q => q.month === 2).length,
        month3: seedQuestions.filter(q => q.month === 3).length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/seed — clear all data
router.delete('/', async (req, res) => {
  try {
    await Question.deleteMany({});
    await DayProgress.deleteMany({});
    res.json({ message: 'All data cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
