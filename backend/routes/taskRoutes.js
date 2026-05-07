const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect, managerOnly, adminOnly, adminOrManager } = require('../middleware/authMiddleware');

// Get all tasks
router.get('/', protect, async (req, res) => {
    try {
        let tasks;
        if (req.user.role === 'SuperAdmin') {
            tasks = await Task.find({}).populate('assignedTo', 'name email role').populate('createdBy', 'name email role');
        } else if (req.user.role === 'Manager') {
            tasks = await Task.find({ createdBy: req.user._id }).populate('assignedTo', 'name email role').populate('createdBy', 'name email role');
        } else {
            tasks = await Task.find({ assignedTo: req.user._id }).populate('createdBy', 'name email role');
        }

        // Fetch unread counts for each task
        const Message = require('../models/Message');
        const tasksWithUnread = await Promise.all(
            tasks.map(async (task) => {
                const unreadCount = await Message.countDocuments({
                    task: task._id,
                    receiver: req.user._id,
                    read: false,
                });
                return { ...task.toObject(), unreadCount };
            })
        );

        res.json(tasksWithUnread);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a task
router.post('/', protect, adminOrManager, async (req, res) => {
    const { title, description, priority, deadline, assignedTo } = req.body;
    try {
        const task = new Task({
            title,
            description,
            priority,
            deadline,
            assignedTo,
            createdBy: req.user._id,
        });
        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update task status and progress
router.put('/:id', protect, async (req, res) => {
    const { status, progress } = req.body;
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if ((req.user.role === 'Developer' || req.user.role === 'Intern') && task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        if (status) task.status = status;
        if (progress !== undefined) task.progress = progress;

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a task
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await task.deleteOne();
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
