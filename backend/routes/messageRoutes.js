const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

// Get all messages for a task (task creator and assignee only)
router.get('/:taskId', protect, async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId).select('createdBy assignedTo');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isParticipant =
      task.createdBy.toString() === req.user._id.toString() ||
      task.assignedTo.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to view this chat' });
    }

    const messages = await Message.find({ task: taskId })
      .sort('createdAt')
      .populate('sender', 'name role')
      .populate('receiver', 'name role');

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: error.message || 'Failed to load messages' });
  }
});

// Mark all messages for a task as read for the current user
router.put('/:taskId/read', protect, async (req, res) => {
  try {
    const { taskId } = req.params;
    await Message.updateMany(
      { task: taskId, receiver: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

