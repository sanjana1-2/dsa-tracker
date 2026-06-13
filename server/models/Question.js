const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 200
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'solved', 'revisit', 'skipped']
  },
  link: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  solvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

questionSchema.index({ day: 1 });
questionSchema.index({ topic: 1 });
questionSchema.index({ status: 1 });
questionSchema.index({ month: 1 });

module.exports = mongoose.model('Question', questionSchema);
