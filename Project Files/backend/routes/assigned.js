const express = require('express');
const router = express.Router();
const Assigned = require('../models/Assigned');
const auth = require('../middleware/authMiddleware');

// Assign Agent to Complaint
router.post('/', auth, async (req, res) => {
    try {
        const { complaintId, agentId, agentName } = req.body;
        const newAssignment = new Assigned({ complaintId, agentId, agentName });
        const savedAssignment = await newAssignment.save();
        res.status(201).json(savedAssignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Assignments by Agent ID
router.get('/agent/:agentId', async (req, res) => {
    try {
        const assignments = await Assigned.find({ agentId: req.params.agentId }).populate('complaintId');
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Assignments (Admin)
router.get('/', auth, async (req, res) => {
    try {
        const assignments = await Assigned.find().populate('complaintId agentId');
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
