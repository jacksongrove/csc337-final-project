// GameState representing the game. All logic should be done here. This means that
// the server does not need to keep track of the game rules and logic, instead it
// should focus on serving requests. This class only simulates the game and contains
// the state data of the game (but not the users themselves).
class GameState {
    constructor(PlayerX, playerO) {
        this.reset();
        // keep track of the players active in this game.
        // this can be used to prevent the wrong player from making a move.
        // This also lets us have an easier time storing statistics about players.
        this.PlayerX = PlayerX;
        this.playerO = playerO;
    }
    // Reset the game state
    reset() {
        this.gameState = Array(9).fill(null); // Example: 9 cells for a Tic-Tac-Toe game
        // X must always go first
        this.currentPlayer = 'X'; // current player (either X or O)
        this.gameActive = true; // game no longer active when it's a win/loss/draw
        this.moves = [];
    }

    // Get the current state
    getState() {
        return {
            gameState: this.gameState,
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive,
        };
    }

    // Make a move
    makeMove(index, asPlayer) {
        if (!this.gameActive) {
            return { error: 'Game is over.' };
        }
        if (asPlayer != null) {
            
            if (this.currentPlayer == 'X' && this.PlayerX != asPlayer) {
                // error if the move X was not made by player X
                return { error: `${asPlayer} tried to move for ${this.PlayerX} who is player X!` };
            } else if (this.currentPlayer == 'O' && this.PlayerO != asPlayer) {
                // error if the move O was not made by player O
                return { error: `${asPlayer} tried to move for ${this.playerO} who is (player O)!` };
            } else {
                // something has gone wrong, somehow neither an X or O value is set
                return { error: 'GameState current player is neither X nor O!' };
            }
        }
        if (this.gameState[index]) {
            return { error: 'Cell already taken.' };
        }

        this.gameState[index] = this.currentPlayer;
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.moves.push(index);
        return { success: true };
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]            // diagonals
        ];
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.gameState[a] && this.gameState[a] === this.gameState[b] && this.gameState[a] === this.gameState[c]) {
                return this.gameState[a];
            }
        }
        return this.gameState.includes(null) ? null : 'Draw';
    }
}

module.exports = GameState;