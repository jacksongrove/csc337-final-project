// Works during the lifespan of the process. Not currently connected to DB
const express = require('express');
const db = require('../db/db');
const account = require('../model/account');
const router = express.Router();

// POST / (history)
router.get('/', async (req, res) => {
    try {
        // Check cookies and auth
        const username = getUsername(req);
        if (!username) {
            return res.status(401).json({ message: 'Cannot get history without an auth cookie.' });
        }

        // Validate input
        if (!validateUsername(username, res)) return;

        // Check if the challenged account exists (something went super wrong if so)
        const selfAccountExists = await doesAccountExist(username, res);
        if (!selfAccountExists) return;

        /** @type {string[]} */
        const playerGames = [];
        const gamesPromise = await db.getAllGameStates();

        gamesPromise.forEach(game => {
            if (game.PlayerO == username || game.PlayerX == username)
                playerGames.push(game.toString());
        });

        res.status(200).json({ games: playerGames.reverse() });
    } catch (error) {
        console.error('Error handling challenge request:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

function getUsername(req) {
    if (!req.headers.cookie) return null;
    return req.cookies.authToken || null;
}

function validateUsername(username, res) {
    if (!username) {
        res.status(400).json({ message: 'Username is required.' });
        return false;
    }
    return true;
}

async function doesAccountExist(username, res) {
    const account = await db.loadAccount(username);
    if (!account) {
        res.status(404).json({ message: 'User not found.' });
        return false;
    }
    return true;
}

module.exports = router;