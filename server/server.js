const exp = require("constants");
const express = require("express");
const app  = express();
const port = process.env.PORT || 3000;
const host = "localhost";
// const host = "0.0.0.0"


app.get("/calculate/add/:num1/:num2", (req,res) => {
    console.log("ADD received");
    let num1 = Number(req.params.num1);
    let num2 = Number(req.params.num2);
    res.send(`${num1+num2}`)
});

app.get("/calculate/sub/:num1/:num2", (req,res) => {
    console.log("SUB received");
    let num1 = Number(req.params.num1);
    let num2 = Number(req.params.num2);
    res.send(`${num1-num2}`)
});

// app.get("/", (req,res) => {
//     res.send(`<html>
//     <body>

//         <p>This is an example website.
//         <p>Here is your randome number: ${Math.floor(Math.random()*100)}</p>

//         <p><b>A:</b> <input id=a oninput="update_answer();">
//         <p><b>B:</b> <input id=b oninput="update_answer();">

//         <p><b>A+B:</b> <span id=answer></span>

//     </body>
//     <script src="public/client.js"></script>
// </html>`)
// });

// app.use(express.static("public"));

app.use(express.static('public'))
app.use(express.json())

let gameState = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]            // diagonals
    ];
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            return gameState[a];
        }
    }
    return gameState.includes(null) ? null : 'Draw';
}

app.get('/state', (req, res) => {
    res.json({ gameState, currentPlayer, gameActive });
});

app.post('/move', (req, res) => {
    const { index } = req.body;

    if (!gameActive || gameState[index]) {
        return res.status(400).json({ error: 'Invalid move' });
    }

    gameState[index] = currentPlayer;
    const winner = checkWinner();

    if (winner) {
        gameActive = false;
        return res.json({ message: winner === 'Draw' ? 'It\'s a draw!' : `Player ${winner} wins!`, gameState });
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    res.json({gameState, currentPlayer, gameActive });
});

app.post('/reset', (req, res) => {
    gameState = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    res.json({ message: 'Game reset', gameState });
});

app.listen(port,host, () =>
 console.log(`Example app listening at http://${host}:${port}`))
