const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/authMiddleware');

// Send Message
router.post('/', async (req, res) => {
    try {
        const { complaintId, name, message } = req.body;
        const newMessage = new Message({ complaintId, name, message });
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Messages for a Complaint
router.get('/:complaintId', auth, async (req, res) => {
    try {
        const messages = await Message.find({ complaintId: req.params.complaintId }).sort({ sentAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
