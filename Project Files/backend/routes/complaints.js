const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const auth = require('../middleware/authMiddleware');

// Create Complaint
router.post('/', auth, async (req, res) => {
    try {
        const newComplaint = new Complaint(req.body);
        const savedComplaint = await newComplaint.save();
        
        // Emit event
        const io = req.app.get('io');
        io.emit('complaintCreated', savedComplaint);

        res.status(201).json(savedComplaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Complaints
router.get('/', auth, async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Single Complaint
router.get('/:id', auth, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
        res.json(complaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Complaint
router.put('/:id', async (req, res) => {
    try {
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedComplaint) return res.status(404).json({ error: 'Complaint not found' });

        // Emit event
        const io = req.app.get('io');
        io.emit('complaintUpdated', updatedComplaint);

        res.json(updatedComplaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Complaint
router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedComplaint = await Complaint.findByIdAndDelete(req.params.id);
        if (!deletedComplaint) return res.status(404).json({ error: 'Complaint not found' });

        // Emit event
        const io = req.app.get('io');
        io.emit('complaintDeleted', req.params.id);

        res.json({ message: 'Complaint deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
