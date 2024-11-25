const exp = require("constants");
const express = require("express");
const app  = express();
const port = process.env.PORT || 3000;
const host = "localhost";
// const host = "0.0.0.0"

app.use(express.static('public'))
app.use(express.json())

let runningGames = new Map()

generateHardcodedLobbies();

function generateHardcodedLobbies() {
    for (let i = 0; i < 5; i++) {
        let game = {
            gameState: Array(9).fill(null), // Represents the game board
            currentPlayer: 'X',        // Tracks the current player's turn
            gameActive: true               // Indicates if the game is active
        };
        runningGames.set("Game" + i, game);
    }
    
}

function checkWinner(game) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]            // diagonals
    ];
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (game.gameState[a] && game.gameState[a] === game.gameState[b] && game.gameState[a] === game.gameState[c]) {
            return game.gameState[a];
        }
    }
    return game.gameState.includes(null) ? null : 'Draw';
}

app.get('/game/runningGamesKeys', (req, res) => {
    let runningGamesKeys = [...runningGames.keys()];
    console.log(runningGamesKeys)
    console.log({runningGamesKeys})
    res.json({runningGamesKeys});
});

app.get('/state/*', (req, res) => {
    try {
        gameKey = req.url.split("/").pop()
        let game = runningGames.get(gameKey);
        res.json({
            gameState: game.gameState,
            currentPlayer: game.currentPlayer,
            gameActive: game.gameActive});
    } catch (error) {
        console.log(error)
        // do not respond
        return
    }
    
});

app.post('/move/*', (req, res) => {
    const { index } = req.body;

    let game = null
    try {
        gameKey = req.url.split("/").pop()
        game = runningGames.get(gameKey);
    } catch (error) {
        console.log(error)
        // do not respond
        return
    }

    if (!game.gameActive || game.gameState[index]) {
        return res.status(400).json({ error: 'Invalid move' });
    }

    game.gameState[index] = game.currentPlayer;
    const winner = checkWinner(game);

    if (winner) {
        game.gameActive = false;
        return res.json({ 
            message: winner === 'Draw' ? 'It\'s a draw!' : `Player ${winner} wins!`, 
            gameState: game.gameState });
    }

    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
    res.json({
        gameState: game.gameState,
        currentPlayer: game.currentPlayer,
        gameActive: game.gameActive});
});

app.post('/reset/*', (req, res) => {
    let game = null;
    try {
        gameKey = req.url.split("/").pop()
        game = runningGames.get(gameKey);
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
});

app.listen(port,host, () =>
 console.log(`Example app listening at http://${host}:${port}`))
