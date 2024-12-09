const express = require('express');
const router = express.Router();
const GameState = require('../model/gameState');
const clients = require('../model/clients');
const db = require('../db/db');

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

// Route for getting the state. A player will call this when it needs to get
// the current state of the game board. A player will give a gameID as a string
// and will receive JSON containing the state of the game.
// TODO this can likely be '/state/:gameID' rather than '/state/*' (this applies
// to all the other routes as well).
router.get('/state', async (req, res) => {
    try {
        // Check cookies and auth
        const username = getChallengerUsername(req);
        if (!username) {
            return res.status(401).json({ message: 'Cannot join game without an auth cookie.' });
        }

        // Validate input
        if (!validateUsername(username, res)) return;

        // Check if the account exists
        const account = await db.loadAccount(username);
        if (!account) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // get the game the player is in.
        // check if the game exists
        const game = GameState.runningGames.get(username);
        if (game == undefined) {
            return res.status(401).json({ message: 'Tried playing game when none exist.' });
        }
        res.status(200).json({
            gameState: game.board,
            currentPlayer: game.currentPlayer,
            gameActive: game.gameActive});
        console.log(`${req.url} resolved`);
        console.log(game.board, game.currentPlayer, game.gameActive);
    } catch (error) {
        console.error('Error handling challenge request:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
    
});

// Route to make a move in a game. The user provides a gameID and some JSON
// data inside a POST to tell the server to apply the move to the board. There
// should be a lot of checks in place to make sure it is a valid move, that the
// player is allowed to make the move, and if they really are the player they
// claim to be.
router.post('/move', async (req, res) => {
    try {
        const { index } = req.body;

        // Check cookies and auth
        const username = getChallengerUsername(req);
        if (!username) {
            return res.status(401).json({ message: 'Cannot join game without an auth cookie.' });
        }
    
        // Validate input
        if (!validateUsername(username, res)) return;
    
        // Check if the account exists
        const account = await db.loadAccount(username);
        if (!account) {
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log('/move request');
        // gameKey = req.url.split("/").pop();
        // check if the game exists
        const game = GameState.runningGames.get(username);
        if (game == undefined) {
            return res.status(401).json({ message: 'Tried playing game when none exist.' });
        }
        // make the move and check if the gamestate correctly did it.
        const result = game.makeMove(index, username);
        if (result.error != null) {
            return res.status(400).json({ message: result.error });
        }
        const winner = game.getWinner();

        // notify the clients. Likely notify them that the game is over.
        // clients.notifyAllClients();
        clients.sendEventToUserName({type: "gameState"}, game.PlayerX);
        clients.sendEventToUserName({type: "gameState"}, game.PlayerO);

        // TODO possibly remove
        if (game.getWinner() || game.isDraw()) {
            console.log(`Game "${game.PlayerX}-${game.PlayerO}" ended`);
            return res.status(200).json({ 
                message: game.getWinner() != null ? `Player ${winner} wins!` : 'It\'s a draw!', 
                gameState: game.board });
        }
    } catch (error) {
        console.error('Error handling move request:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

// Route for handling reset requests. This is made by a user when they want to
// reset a game. The user does a GET request with the game id. There should
// be a lot more checks in place such as making sure that it is a game the player
// is in, making sure they have permission to do so, and maybe making sure they
// are authenticated and really are that user.
// router.post('/reset/*', async (req, res) => {
//     try {
//         const { index } = req.body;

//         // Check cookies and auth
//         const username = getChallengerUsername(req);
//         if (!username) {
//             return res.status(401).json({ message: 'Cannot reset game without an auth cookie.' });
//         }
    
//         // Validate input
//         if (!validateUsername(challengedUsername, res)) return;
    
//         // Check if the account exists
//         const account = await db.loadAccount(username);
//         if (!account) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         console.log('/reset/* request');
//         // check if the game exists
//         const game = GameState.runningGames.get(username);
//         if (game == undefined) {
//             return res.status(401).json({ message: 'Tried resetting game when none exist.' });
//         }
//         // make the move and check if the gamestate correctly did it.
//         const res = game.reset(index, username);
//         if (res.error != null) {
//             return res.status(400).json({ message: res.error });
//         }
//         const winner = game.getWinner();

//         if (game.getWinner() || game.isDraw()) {
//             console.log(`Game "${game.PlayerX}-${game.PlayerO}" ended`);
//             return res.json({ 
//                 message: game.getWinner() != null ? `Player ${winner} wins!` : 'It\'s a draw!', 
//                 gameState: game.board });
//         }

//         res.json({
//             gameState: game.board,
//             currentPlayer: game.currentPlayer,
//             gameActive: game.gameActive});
//         clients.notifyAllClients();

//         res.status(200).json({ message: 'Move completed successfully.' });
//     } catch (error) {
//         console.error('Error handling move request:', error);
//         res.status(500).json({ message: 'An error occurred.' });
//     }

//     let game = null;
//     try {
//         console.log('/reset/* request');
//         gameKey = req.url.split("/").pop()
//         game = runningGames.get(gameKey);
//         console.log(`${req.url} resolved`);
//     } catch (error) {
//         console.log(error)
//         // do not respond
//         return
//     }
    
//     game.board = Array(9).fill(null);
//     game.currentPlayer = 'X';
//     game.gameActive = true;
//     let gameState = game.board
//     res.json({ message: 'Game reset', gameState });
//     clients.notifyAllClients();
// });

// Route for getting the current game ids available. They are also keys. This
// is because the dropdown needs to know what the options are for the client
// HTML.
// router.get('/runningGamesKeys', (req, res) => {
//     let runningGamesKeys = [...runningGames.keys()];
//     console.log('/runningGamesKeys request');
//     console.log(runningGamesKeys);
//     res.json({runningGamesKeys});
// });

module.exports = router;