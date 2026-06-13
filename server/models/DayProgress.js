const mongoose = require('mongoose');

const dayProgressSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 200
  },
  date: {
    type: Date,
    default: null
  },
  targetQuestions: {
    type: Number,
    default: 7
  },
  completedQuestions: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DayProgress', dayProgressSchema);
