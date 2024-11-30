// Works during the lifespan of the process. Not currently connected to DB
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generated using `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
const JWT_SECRET = "4742048d2fb8cf7777f62550766c1e747a1ea48df29cddc648e82f1ab2ce126e";

// TEMP
let users = new Set();
// TEMP { username: String -> passwordHash: String }
let userPasswords = new Map();

// POST /signup
router.post('/signup', async (req, res) => {
    const { name, username, password } = req.body;

    // Validate input
    if (!name || !username || !password) {
        return res.status(400).json({ message: 'Name, Username, and password is required.' });
    }

    // Check if user already exists
    if (users.has(username)) {
        return res.status(409).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add the user
    users.add(username);
    userPasswords.set(username, hashedPassword);
    res.status(201).json({ message: 'User created successfully.' });
});

// POST /login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password is required.' });
    }

    // Check if user exists
    if (!users.has(username)) {
        return res.status(404).json({ message: 'User not found.' });
    }

    // Check password
    const storedHashedPassword = userPasswords.get(username);
    const isPasswordValid = await bcrypt.compare(password, storedHashedPassword);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Generate JWT
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful.', token });
});

module.exports = router;