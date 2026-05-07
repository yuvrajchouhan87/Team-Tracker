const express = require('express');
const router = express.Router();
const TimeLog = require('../models/TimeLog');
const Task = require('../models/Task');
const { protect, managerOnly } = require('../middleware/authMiddleware');

// Get all time logs (Manager sees all, Employee sees own)
router.get('/', protect, async (req, res) => {
    try {
        let logs;
        if (req.user.role === 'Manager' || req.user.role === 'SuperAdmin') {
            logs = await TimeLog.find({}).populate('user', 'name').populate('task', 'title');
        } else {
            logs = await TimeLog.find({ user: req.user._id }).populate('task', 'title');
        }
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start a new time log
router.post('/start', protect, async (req, res) => {
    const { taskId } = req.body;
    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Check if there is an ongoing log
        const ongoingLog = await TimeLog.findOne({ user: req.user._id, endTime: null });
        if (ongoingLog) {
            return res.status(400).json({ message: 'Stop the current timer before starting a new one' });
        }

        const log = new TimeLog({
            task: taskId,
            user: req.user._id,
            startTime: new Date(),
        });
        const createdLog = await log.save();
        res.status(201).json(createdLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Stop the current time log
router.put('/stop/:id', protect, async (req, res) => {
    try {
        const log = await TimeLog.findById(req.params.id);
        if (!log) return res.status(404).json({ message: 'Time log not found' });
        if (log.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

        log.endTime = new Date();
        const durationMs = log.endTime - log.startTime;
        log.duration = Math.round(durationMs / 60000); // converting to minutes

        const updatedLog = await log.save();
        res.json(updatedLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
