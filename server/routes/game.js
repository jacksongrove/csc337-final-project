const express = require('express');
const router = express.Router();
const GameState = require('../model/gameState');

// const game = new GameState(); // Create an instance of the game

// Map Key:     <gameId: String>
// Map Value:   <game: GameState>
let runningGames = new Map();


// Store active SSE connections
const clients = [];

generateHardcodedLobbies();

function generateHardcodedLobbies() {
    for (let i = 0; i < 5; i++) {
        const game = new GameState();
        runningGames.set("Game" + i, game);
    }
    
}

router.get('/state/*', (req, res) => {
    try {
        // console.log('/state/* request');
        gameKey = req.url.split("/").pop()
        let game = runningGames.get(gameKey);
        res.json({
            gameState: game.gameState,
            currentPlayer: game.currentPlayer,
            gameActive: game.gameActive});
        // console.log(`${req.url} resolved`);
        // console.log(game.gameState, game.currentPlayer, game.gameActive);
    } catch (error) {
        console.log(error)
        // do not respond
        return
    }
    
});


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

    if (!game.gameActive || game.gameState[index]) {
        console.log(`invalid move by ${game.currentPlayer}`);
        return res.status(400).json({ error: 'Invalid move' });
    }

    game.gameState[index] = game.currentPlayer;
    const winner = game.checkWinner(game);

    if (winner) {
        game.gameActive = false;
        console.log(`Game "${gameKey}" ended`);
        return res.json({ 
            message: winner === 'Draw' ? 'It\'s a draw!' : `Player ${winner} wins!`, 
            gameState: game.gameState });
    }

    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
    res.json({
        gameState: game.gameState,
        currentPlayer: game.currentPlayer,
        gameActive: game.gameActive});
    notifyAllClients();
});





// Really dumb implementation. Basically just notify all clients that a change
// occurred to fetch any necessary changes.
function notifyAllClients() {
    sendEvent({
        type: 'gameEvent',
        message: 'An event occurred, request new status please.',
    });
}

// Function to send an event to all clients
function sendEvent(event) {
    clients.forEach((client) => {
        client.write(`data: ${JSON.stringify(event)}\n\n`);
    });
}

router.get('/runningGamesKeys', (req, res) => {
    let runningGamesKeys = [...runningGames.keys()];
    console.log('/runningGamesKeys request');
    console.log(runningGamesKeys);
    res.json({runningGamesKeys});
});


// SSE endpoint
router.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Keep track of this client connection
    clients.push(res);

    // Handle disconnection
    req.on('close', () => {
        clients.splice(clients.indexOf(res), 1);
    });
});


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
    
    game.gameState = Array(9).fill(null);
    game.currentPlayer = 'X';
    game.gameActive = true;
    let gameState = game.gameState
    res.json({ message: 'Game reset', gameState });
    notifyAllClients();
});

module.exports = router;