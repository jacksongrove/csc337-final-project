// Works during the lifespan of the process. Not currently connected to DB
const express = require('express');
const router = express.Router();

// TEMP
let users = new Set();

// POST /signup
router.post('/signup', async (req, res) => {
    const { name, username} = req.body;

    // Validate input
    if (!name || !username) {
        return res.status(400).json({ message: 'Name and Username is required.' });
    }

    // Check if user already exists
    if (users.has(username)) {
        return res.status(409).json({ message: 'User already exists.' });
    }

    // Add the user
    users.add(username);
    res.status(201).json({ message: 'User created successfully.' });
});

// POST /login
router.post('/login', async (req, res) => {
    const { username } = req.body;

    // Validate input
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }

    // Check if user exists
    if (!users.has(username)) {
        return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Login successful.', token });
});

module.exports = router;