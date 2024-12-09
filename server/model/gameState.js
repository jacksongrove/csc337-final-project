
// GameState representing the game. All logic should be done here. This means that
// the server does not need to keep track of the game rules and logic, instead it
// should focus on serving requests. This class only simulates the game and contains
// the state data of the game (but not the users themselves).
class GameState {
    // Map Key:     <player: String>
    // Map Value:   <game: GameState>
    static runningGames = new Map();

    constructor(PlayerX, PlayerO, board = null, currentPlayer = null, gameActive = null, moves = null) {
        this.reset();
        // keep track of the players active in this game.
        // this can be used to prevent the wrong player from making a move.
        // This also lets us have an easier time storing statistics about players.
        this.PlayerX = PlayerX;
        this.PlayerO = PlayerO;

        
        if (GameState.runningGames.has(this.PlayerX)){
            // Game already exists, overwrite
        }
        if (GameState.runningGames.has(this.PlayerO)){
            // Game already exists, overwrite
        }
        GameState.runningGames.set(this.PlayerX, this);
        GameState.runningGames.set(this.PlayerO, this);

        if (board != null)
            this.board = board;
        if (currentPlayer != null)
            this.currentPlayer = currentPlayer;
        if (gameActive != null)
            // NOTE: a game can ONLY be inactive when it is finished and there
            // either a draw or a winner.
            this.gameActive = gameActive;
        if (moves != null)
            this.moves = moves;
    }
    // Reset the game state
    reset() {
        this.board = Array(9).fill(null); // Example: 9 cells for a Tic-Tac-Toe game
        // X must always go first
        this.currentPlayer = 'X'; // current player (either X or O)
        this.gameActive = true; // game no longer active when it's a win/loss/draw
        this.moves = [];
    }

    // Get the current state
    getState() {
        return {
            gameState: this.board,
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
            }
            if (this.currentPlayer == 'O' && this.PlayerO != asPlayer) {
                // error if the move O was not made by player O
                return { error: `${asPlayer} tried to move for ${this.PlayerO} who is (player O)!` };
            }
            if (this.currentPlayer != 'O' && this.currentPlayer != 'X') {
                // something has gone wrong, somehow neither an X or O value is set
                // it's so wrong that we should return an error
                console.error("GameState current player is neither X nor O!", error);
                throw error;
                // return { error: 'GameState current player is neither X nor O!' };
            }
        }
        // out of bounds
        if (index < 0 || index > 8) {
            return { error: 'Index is out of bounds.' };
        }
        // cannot place in a cell that is already occupied
        if (this.board[index]) {
            return { error: 'Cell already taken.' };
        }
        // place move
        this.board[index] = this.currentPlayer;
        // switch current player
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        // register move into history of moves
        this.moves.push(index);
        // check if there is a winner
        if (this.checkWinner()) {
            this.gameActive = false;
        }
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
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        return this.isDraw() ? 'Draw' : null;
    }

    getWinner() {
        const res = this.checkWinner();
        if (res == 'X')
            return this.PlayerX;
        if (res == 'O')
            return this.PlayerO;
        else
            return null;
    }

    isDraw() {
        return !this.board.includes(null);
    }

    removeGame() {
        if (!GameState.runningGames.has(this.PlayerX)) {
            console.error("this game is not currently a running game, cannot remove.");
        } else {
            GameState.runningGames.delete(this.PlayerX);
        }
        if (!GameState.runningGames.has(this.PlayerO)) {
            console.error("this game is not currently a running game, cannot remove.");
        } else {
            GameState.runningGames.delete(this.PlayerO);
        }
    };
}

module.exports = GameState;