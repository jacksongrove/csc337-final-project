const express = require('express');
const router = express.Router();
const GameState = require('../model/gameState');
const clients = require('../model/clients');
const db = require('../db/db');

// get the username cookie from the client
function getChallengerUsername(req) {
    if (!req.headers.cookie) return null;
    return req.cookies.authToken || null;
}

// make sure the username exists
function validateUsername(username, res) {
    if (!username) {
        res.status(400).json({ message: 'Username is required.' });
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

        const winner = game.getWinner();

        const playerXAccountPublic = db.convertToPublicAccountView(await db.loadAccount(game.PlayerX));
        const playerOAccountPublic = db.convertToPublicAccountView(await db.loadAccount(game.PlayerO));
        
        res.status(200).json({
            gameState: game.board,
            currentPlayer: game.currentPlayer,
            gameActive: game.gameActive,
            playerX: playerXAccountPublic,
            playerO: playerOAccountPublic,
            winner: winner,
        });
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

        if (game.getWinner()) {
            // retrieve win/lose usernames
            const winnerUsername = winner;
            const loserUsername = winner == game.PlayerX ? game.PlayerO : game.PlayerX;

            if (winnerUsername != loserUsername){
                // update wins and losses
                db.incrementWin(winnerUsername);
                db.incrementLoss(loserUsername);
            }

            // store to db
            await db.storeGameState(game);
        }
        
        if (game.getWinner() || game.isDraw()) {
            console.log(`Game "${game.PlayerX}-${game.PlayerO}" ended`);
            return res.status(200).json({ 
                message: game.getWinner() != null ? `Player ${winner} wins!` : 'It\'s a draw!', 
                gameState: game.board });
        }
        res.status(200).json({ message: 'Move made successfully.' });
    } catch (error) {
        console.error('Error handling move request:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

module.exports = router;