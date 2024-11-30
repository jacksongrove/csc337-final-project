const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generated using `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
const JWT_SECRET = "4742048d2fb8cf7777f62550766c1e747a1ea48df29cddc648e82f1ab2ce126e";

let users = new Set()

// POST /signup
router.post('/signup', (req, res) => {
    const { username } = req.body;

    // Validate input
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
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
router.post('/login', (req, res) => {
    const { username, auth } = req.body;

    // Validate input
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }

    // Check if user exists
    if (!users.has(username)) {
        return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Login successful.' });
});

module.exports = router;