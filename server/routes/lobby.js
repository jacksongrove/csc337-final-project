const express = require('express');
const router = express.Router();
const db = require('../db/db');
const account = require('../model/account');
const clients = require('../model/clients');

router.post('/challenge', async (req, res) => {
    const { challengedUsername } = req.body;

    // Check if we have cookies at all
    if (req.headers.cookie == undefined) {
        return res.status(401).json({ message: 'Cannot challenge without cookies.' });
    }
    const usernameFromCookie = req.cookies.authToken;

    // Check if we have an auth cookie
    if (usernameFromCookie == undefined) {
        return res.status(401).json({ message: 'Cannot challenge without an auth cookie.' });
    }

    // Validate input
    if (!challengedUsername) {
        return res.status(400).json({ message: 'Username is required.' });
    }
    
    // try loading account
    let loadedAccountResult = await db.loadAccount(challengedUsername);
    if (loadedAccountResult == null) {
        return res.status(404).json({ message: 'User not found.' });
    }

    // account exists, notify user of a challenge event
    clients.sendEventToUserName({
        type: 'challenge',
        challenger: usernameFromCookie,
        challenged: challengedUsername,
    }, challengedUsername);
});

module.exports = router;