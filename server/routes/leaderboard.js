// Works during the lifespan of the process. Not currently connected to DB
const express = require('express');
const db = require('../db/db');
const account = require('../model/account');
const router = express.Router();

// POST / (leaderboard)
router.get('/', async (req, res) => {
    try {
        const accounts = await db.getAllAccounts();
        accounts.map((account) => stripToLeaderboardAccount(account));
        (await accounts).sort((b, a) => {

            if (a.wins == 0 && b.wins == 0 && a.losses == 0 && b.losses == 0){
                return 0; // don't bother sorting
            }

            // If a player has no wins or losses, automatically put them lower
            // than another player even if the other player has only losses
            if (a.wins == 0 && a.losses == 0) {
                return -1; // a is prioritized
            }
            if (b.wins == 0 && b.losses == 0) {
                return 1; // b is prioritized
            }

            // If one player has only losses while another doesn't then automatically
            // put them lower
            if (a.losses != 0 && b.losses == 0) {
                return -1; // a is prioritized
            }
            if (b.losses != 0 && a.losses == 0) {
                return 1; // b is prioritized
            }

            // if there are no losses then sort by most wins
            if (a.losses == 0 && b.losses == 0) {
                return a.wins - b.wins;
            }

            // if there are no wins then sort by least losses
            if (a.wins == 0 && b.wins == 0) {
                return b.losses - a.losses;
            }

            // If one player has no losses, prioritize them
            if (a.losses == 0 && b.losses > 0) {
                return -1; // a is prioritized
            } else if (b.losses == 0 && a.losses > 0) {
                return 1;  // b is prioritized
            }

            // sort by best ratio (make sure we don't divide by 0 here!)
            if (a.losses > 0 && b.losses > 0) {
                return (a.wins / a.losses) - (b.wins / b.losses);
            }
            
            // unlikely
            return 0
        });
        // if there are somehow hundreds of accounts limit them to 100 outputs
        if (accounts.length > 100) {
            accounts.splice(100);
        }
        res.status(200).json({ accounts });
    } catch (error) {
        console.error('Error handling signup request:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

// function stripToLeaderboardAccounts(accounts) {
//     accounts.map((account) => stripToLeaderboardAccount(account))
// }

function stripToLeaderboardAccount(account) {
    try {
        return {
            name: account.name,
            username: account.username,
            wins: account.wins,
            losses: account.losses,
        };
    } catch (error) {
        console.error("Invalid account found: " + error);
        // throw error;
        // I would rather it give something than crash or fail here
        return {
            name: "INVALID",
            username: "",
            wins: 0,
            losses: 0,
        };
    }
}

module.exports = router;