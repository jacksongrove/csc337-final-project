const express = require('express');
const router = express.Router();
const GameState = require('../model/gameState');
const clients = require('../model/clients');

// Map Key:     <gameId: String>
// Map Value:   <game: GameState>
let runningGames = new Map();

// temp (call function below)
generateHardcodedLobbies();

// temp, make a few games that can be joined. Later this should be upgraded
// to a matchmaking system. (Server-Sent Events can be used for that)
function generateHardcodedLobbies() {
    for (let i = 0; i < 5; i++) {
        const game = new GameState();
        runningGames.set("Game" + i, game);
    }
}

// Route for getting the state. A player will call this when it needs to get
// the current state of the game board. A player will give a gameID as a string
// and will receive JSON containing the state of the game.
// TODO this can likely be '/state/:gameID' rather than '/state/*' (this applies
// to all the other routes as well).
router.get('/state/*', (req, res) => {
    try {
        console.log('/state/* request');
        gameKey = req.url.split("/").pop()
        let game = runningGames.get(gameKey);
        res.json({
            gameState: game.board,
            currentPlayer: game.currentPlayer,
            gameActive: game.gameActive});
        console.log(`${req.url} resolved`);
        console.log(game.board, game.currentPlayer, game.gameActive);
    } catch (error) {
        console.log(error)
        // do not respond
        return
    }
    
});

// Route to make a move in a game. The user provides a gameID and some JSON
// data inside a POST to tell the server to apply the move to the board. There
// should be a lot of checks in place to make sure it is a valid move, that the
// player is allowed to make the move, and if they really are the player they
// claim to be.
router.post('/move/*', (req, res) => {
    const { index } = req.body;

    let game = null
    try {
        console.log('/move/* request');
        gameKey = req.url.split("/").pop();
        game = runningGames.get(gameKey);
        console.log(`${req.url} resolved`);
    } catch (error) {
        console.log(error)
        // do not respond
        return
    }

    if (!game.gameActive || game.board[index]) {
        console.log(`invalid move by ${game.currentPlayer}`);
        return res.status(400).json({ error: 'Invalid move' });
    }

    game.board[index] = game.currentPlayer;
    const winner = game.checkWinner(game);

    if (winner) {
        game.gameActive = false;
        console.log(`Game "${gameKey}" ended`);
        return res.json({ 
            message: winner === 'Draw' ? 'It\'s a draw!' : `Player ${winner} wins!`, 
            gameState: game.board });
    }

    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
    res.json({
        gameState: game.board,
        currentPlayer: game.currentPlayer,
        gameActive: game.gameActive});
        clients.notifyAllClients();
});

// Route for handling reset requests. This is made by a user when they want to
// reset a game. The user does a GET request with the game id. There should
// be a lot more checks in place such as making sure that it is a game the player
// is in, making sure they have permission to do so, and maybe making sure they
// are authenticated and really are that user.
router.post('/reset/*', (req, res) => {
    let game = null;
    try {
        console.log('/reset/* request');
        gameKey = req.url.split("/").pop()
        game = runningGames.get(gameKey);
        console.log(`${req.url} resolved`);
    } catch (error) {
        console.log(error)
        // do not respond
        return
    }
    
    game.board = Array(9).fill(null);
    game.currentPlayer = 'X';
    game.gameActive = true;
    let gameState = game.board
    res.json({ message: 'Game reset', gameState });
    clients.notifyAllClients();
});

// Route for getting the current game ids available. They are also keys. This
// is because the dropdown needs to know what the options are for the client
// HTML.
router.get('/runningGamesKeys', (req, res) => {
    let runningGamesKeys = [...runningGames.keys()];
    console.log('/runningGamesKeys request');
    console.log(runningGamesKeys);
    res.json({runningGamesKeys});
});

module.exports = router;