const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /api/questions — list with filters
router.get('/', async (req, res) => {
  try {
    const { day, topic, difficulty, status, month } = req.query;
    const filter = {};
    if (day) filter.day = Number(day);
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    if (month) filter.month = Number(month);

    const questions = await Question.find(filter).sort({ day: 1, difficulty: 1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/questions/stats — aggregated statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await Question.countDocuments();
    const solved = await Question.countDocuments({ status: 'solved' });
    const revisit = await Question.countDocuments({ status: 'revisit' });
    const skipped = await Question.countDocuments({ status: 'skipped' });
    const pending = await Question.countDocuments({ status: 'pending' });

    // By difficulty
    const easySolved = await Question.countDocuments({ difficulty: 'Easy', status: 'solved' });
    const easyTotal = await Question.countDocuments({ difficulty: 'Easy' });
    const mediumSolved = await Question.countDocuments({ difficulty: 'Medium', status: 'solved' });
    const mediumTotal = await Question.countDocuments({ difficulty: 'Medium' });
    const hardSolved = await Question.countDocuments({ difficulty: 'Hard', status: 'solved' });
    const hardTotal = await Question.countDocuments({ difficulty: 'Hard' });

    // By topic
    const topicStats = await Question.aggregate([
      {
        $group: {
          _id: '$topic',
          total: { $sum: 1 },
          solved: {
            $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // By day (for charts)
    const dailyStats = await Question.aggregate([
      {
        $group: {
          _id: '$day',
          total: { $sum: 1 },
          solved: {
            $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // By month
    const monthStats = await Question.aggregate([
      {
        $group: {
          _id: '$month',
          total: { $sum: 1 },
          solved: {
            $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Streak calculation
    const solvedByDay = await Question.aggregate([
      { $match: { status: 'solved' } },
      {
        $group: {
          _id: '$day',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const solvedDays = new Set(solvedByDay.map(d => d._id));
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (let i = 1; i <= 90; i++) {
      if (solvedDays.has(i)) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Current streak (from latest solved day going backwards)
    let latestDay = 0;
    for (let i = 90; i >= 1; i--) {
      if (solvedDays.has(i)) {
        latestDay = i;
        break;
      }
    }
    currentStreak = 0;
    for (let i = latestDay; i >= 1; i--) {
      if (solvedDays.has(i)) {
        currentStreak++;
      } else {
        break;
      }
    }

    res.json({
      total,
      solved,
      revisit,
      skipped,
      pending,
      difficulty: {
        easy: { solved: easySolved, total: easyTotal },
        medium: { solved: mediumSolved, total: mediumTotal },
        hard: { solved: hardSolved, total: hardTotal }
      },
      topicStats,
      dailyStats,
      monthStats,
      streak: { current: currentStreak, max: maxStreak }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/questions — add a question
router.post('/', async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/questions/:id — update a question
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.status === 'solved' && !updates.solvedAt) {
      updates.solvedAt = new Date();
    }
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: 'after', runValidators: true }
    );
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/questions/:id — remove a question
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
