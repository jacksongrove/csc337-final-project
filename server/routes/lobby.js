const express = require('express');
const router = express.Router();
const db = require('../db/db');
const account = require('../model/account');
const clients = require('../model/clients');
const Challenge = require('../model/challenge');
const GameState = require('../model/gameState');

router.get('/onlineUsers', async (req, res) => {
    try {
        const allOnlineUsers = await getAllOnlineUsers();
        // return our list of online users.
        res.status(200).json({allOnlineUsers});
    } catch (error) {
        console.error('Error handling onlineUsers request:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

router.post('/challenge', async (req, res) => {
    try {
        const { challengedUsername } = req.body;

        // Check cookies and auth
        const challengerUsername = getChallengerUsername(req);
        if (!challengerUsername) {
            return res.status(401).json({ message: 'Cannot challenge without an auth cookie.' });
        }

        // Validate input
        if (!validateUsername(challengedUsername, res)) return;

        // Check if the challenger account exists (something went super wrong if so)
        const selfAccountExists = await doesAccountExist(challengerUsername, res);
        if (!selfAccountExists) return;

        // Check if the challenged account exists
        const accountExists = await doesAccountExist(challengedUsername, res);
        if (!accountExists) return;

        // TODO, check if they are offline. If so then we also cannot challenge.

        // Check for duplicate challenges
        if (Challenge.isDuplicateChallenge(challengerUsername, challengedUsername, res,
            'Cannot challenge the same person twice.')) return;

        // Add challenge and notify user
        Challenge.addChallenge(challengerUsername, challengedUsername);
        notifyChallengeEvent(challengerUsername, challengedUsername);

        res.status(200).json({ message: 'Challenge sent successfully.' });
    } catch (error) {
        console.error('Error handling challenge request:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

// TODO the functions below may requre a mutex if we run into concurrency issues
// eg. One user accepting while another user is in the middle of declining.
// The server should only choose to process one at a time, not both.

router.post('/challengeAccept', async (req, res) => {
    // Accept the challenge. If this happens before the decline then the game
    // will go through and begin.
    // Any other challenge requests must be cancelled.
    // Both players are notified that the game has started and they should join
    // the lobby.

    try {
        const { challengerUsername } = req.body;

        // Check cookies and auth
        const challengedUsername = getChallengerUsername(req);
        if (!challengedUsername) {
            return res.status(401).json({ message: 'Cannot accept challenge without an auth cookie.' });
        }

        // Validate input
        if (!validateUsername(challengerUsername, res)) return;

        // Check if the challenged account exists (something went super wrong if so)
        const selfAccountExists = await doesAccountExist(challengedUsername, res);
        if (!selfAccountExists) return;

        // Check if the challenger account exists
        const accountExists = await doesAccountExist(challengerUsername, res);
        if (!accountExists) return;

        // Check if it even exists
        if (!Challenge.challengeExists(challengerUsername, challengedUsername, res,
            'Cannot accept a challenge that doesn\'t exist.')) return;

        // Remove the challenge and notify both users that it was accepted.
        Challenge.removeChallenge(challengerUsername, challengedUsername);
        notifyChallengeAcceptEvent(challengerUsername, challengedUsername);

        // build the game
        new GameState(challengerUsername, challengedUsername);

        res.status(200).json({ message: 'Decline challenge sent successfully.' });
    } catch (error) {
        console.error('Error handling challenge request:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

router.post('/challengeDecline', async (req, res) => {
    // Either the user that received the challenge can decline or the
    // challenger can cancel/decline.


    // If declined by either parties then no game can be allowed to spawn and
    // both clients will be informed about the cancellation process.

    // If the game has already started then neither user can decline.

    try {
        let { challengerUsername, challengedUsername } = req.body;

        // Check cookies and auth
        const declinerUsername = getChallengerUsername(req);
        if (!declinerUsername) {
            return res.status(401).json({ message: 'Cannot decline challenge without an auth cookie.' });
        }

        // Validate input
        if (!validateUsername(challengerUsername, res)) return;

        // Check if the challenger account exists (something went super wrong if so)
        const selfAccountExists = await doesAccountExist(declinerUsername, res);
        if (!selfAccountExists) return;

        // Check if the challenged account exists
        const accountExists = await doesAccountExist(challengerUsername, res);
        if (!accountExists) return;

        if (challengedUsername == undefined) {
            // user did not send us a challenger, assume that the user themselves
            // is the challenger.
            challengedUsername = declinerUsername
        }

        if (challengerUsername != declinerUsername && challengedUsername != declinerUsername) {
            // wait a minute, you can't decline a game if you aren't the sender or recepient.
            return res.status(401).json({ message: 'Cannot decline challenge if user is not a sender or recepient.' });
        }

        // Check if it even exists
        if (!Challenge.challengeExists(challengerUsername, challengedUsername, res,
            'Cannot decline a challenge that doesn\'t exist.')) return;

        // Remove the challenge and notify both users that it was declined
        Challenge.removeChallenge(declinerUsername, challengedUsername);
        notifyChallengeDeclineEvent(challengerUsername, challengedUsername);

        // Create a game lobby for the players to join. When the players go into
        // /tictactoe.html they will see their game automatically. Furthermore
        // the client should automatically send them to the game.

        res.status(200).json({ message: 'Decline challenge sent successfully.' });
    } catch (error) {
        console.error('Error handling challenge request:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

function getChallengerUsername(req) {
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

// send a notification to our challenged user
function notifyChallengeEvent(challenger, challenged) {
    clients.sendEventToUserName(
        { type: 'challenge', challenger, challenged },
        challenged
    );
}

// send a notification to both of our clients that the challenge has been declined
function notifyChallengeDeclineEvent(challenger, challenged) {
    clients.sendEventToUserName(
        { type: 'challengeDecline', challenger, challenged },
        challenged
    );
    clients.sendEventToUserName(
        { type: 'challengeDecline', challenger, challenged },
        challenger
    );
}

// send a notifications to both of our clients that the challenge has been accepted.
function notifyChallengeAcceptEvent(challenger, challenged) {
    clients.sendEventToUserName(
        { type: 'challengeAccept', challenger, challenged },
        challenged
    );
    clients.sendEventToUserName(
        { type: 'challengeAccept', challenger, challenged },
        challenger
    );
}

function notifyLobbyUpdate(allOnlineUsers){
    clients.sendEventAll(
        { type: 'lobbyUpdate', allOnlineUsers }
    );
}

// Get all online users 
async function getAllOnlineUsers(){
    const allOnlineUsers = [];
    const allOnlineClients = clients.getAllClients();
    const userPromises = [];

    allOnlineClients.forEach((client, username) => {
        const accountPromise = db.loadAccount(username);
        // only push as an online client if they are logged in. Do not count
        // accounts that have a client connection but no login yet.
        if (accountPromise) {
            userPromises.push(accountPromise);
        }
        
    });
    // Wait for all promises to resolve
    const allOnlineAccounts = await Promise.all(userPromises);
    // strip away all but the necessary data (exclude personal data)
    allOnlineAccounts.forEach(account => {
        try {
            allOnlineUsers.push({
                name: account.name,
                username: account.username,
                wins: account.wins,
                losses: account.losses,
            });
        } catch (error) {
            console.error("Invalid account found " + account);
        }
        
    });
    return allOnlineUsers;
}

// Add a handler to the clients model to notify all users when the lobby changes.
clients.setOnClientChange(() => {
    try {
        getAllOnlineUsers().then(function(allOnlineUsers) {notifyLobbyUpdate(allOnlineUsers)});
    } catch (error) {
        console.error("Error while notifying the players of the lobby state:", error);
        return;
    }
    
});

module.exports = router;