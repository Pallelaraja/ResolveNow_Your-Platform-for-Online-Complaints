const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Get All Users (Admin only)
router.get('/', auth, async (req, res) => {
    try {
        // Check if user is Admin
        if (req.user.userType !== 'Admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const users = await User.find().select('-password'); // Exclude password
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete User (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'Admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
