
class GameState {
    constructor() {
        this.reset();
    }
    // Reset the game state
    reset() {
        this.gameState = Array(9).fill(null); // Example: 9 cells for a Tic-Tac-Toe game
        this.currentPlayer = 'X'; // current player (either X or O)
        this.gameActive = true; // game no longer active when it's a win/loss/draw
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
    makeMove(index) {
        if (!this.gameActive) {
            return { error: 'Game is over.' };
        }
        if (this.gameState[index]) {
            return { error: 'Cell already taken.' };
        }

        this.gameState[index] = this.currentPlayer;
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
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