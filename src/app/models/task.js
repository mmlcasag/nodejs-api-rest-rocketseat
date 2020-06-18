const mongoose = require('../../database');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  project: {
    type: String,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: String,
    ref: 'User',
    required: true
  },
  completed: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
