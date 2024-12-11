// Works during the lifespan of the process. Not currently connected to DB
const express = require('express');
const db = require('../db/db');
const account = require('../model/account');
const router = express.Router();

// POST /signup
router.post('/signup', async (req, res) => {
    try {
        const { name, username} = req.body;
    
        // Validate input
        if (!name || !username) {
            return res.status(400).json({ message: 'Name and Username is required.' });
        }
    
        // Check if user already exists
        // try loading account
        let loadedAccountResult = await db.loadAccount(username);
        if (loadedAccountResult != null) {
            return res.status(409).json({ message: 'User already exists.' });
        }
    
        // Add the user to the database (name username wins)
        let newUser = new account.Account(name, username, 0, 0);
        // wait for the database to store it. Once it is a success then we can
        // proceed.
        await db.storeAccount(newUser);
        
        res.cookie('authToken', username, { httpOnly: false});
        res.cookie('name', loadedAccountResult.name, { httpOnly: false});

        res.redirect('/lobby.html');
        // res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        console.error('Error handling signup request:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    try {
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
        res.cookie('name', loadedAccountResult.name, { httpOnly: false});

        return res.redirect('/lobby.html');
        // res.status(200).json({ message: 'Login successful.' });
    } catch (error) {
        console.error('Error handling login request:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

// POST /logout
router.post('/logout', (req, res) => {
    try {
        // Clear the authentication cookie
        res.clearCookie('authToken');

        // Redirect to the login page
        return res.redirect('/login.html');
    } catch (error) {
        console.error('Error handling logout request:', error);
        res.status(500).json({ message: 'An error occurred during logout.' });
    }
});


module.exports = router;