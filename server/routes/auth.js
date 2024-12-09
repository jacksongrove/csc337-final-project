// Works during the lifespan of the process. Not currently connected to DB
const express = require('express');
const db = require('../db/db');
const account = require('../model/account');
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

    // Add the user DEBUG
    users.add(username);
    // Add the user to the database
    let newUser = new account.Account(name, username, 0, 0);
    // TODO temp await, can be potentially skipped
    await db.storeAccount(newUser);
    
    res.cookie('authToken', username, { httpOnly: false});
    res.status(201).json({ message: 'User created successfully.' });
});

// POST /login
router.post('/login', async (req, res) => {
    const { username } = req.body;

    // Validate input
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }
    
    // try loading account
    let loadedAccountResult = await db.loadAccount(username);
    if (loadedAccountResult == null) {
        return res.status(404).json({ message: 'User not found.' });
    }

    res.cookie('authToken', username, { httpOnly: false});

    res.status(200).json({ message: 'Login successful.' });
});

module.exports = router;