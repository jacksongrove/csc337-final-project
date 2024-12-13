/**
 * GameState class simulates and manages the state of a game.
 * 
 * This class is responsible for holding the game's state, managing game logic, 
 * and handling the interaction between players. It allows the server to focus on
 * serving requests rather than implementing game rules. GameState instances represent
 * individual games and include functionality for creating, resetting, and managing
 * games in progress.
 * 
 * There can be many instances of GameState so use it as an instance and not
 * in a static or function way. Except for runningGames which keeps a list
 * of all active games:
 * ```
 * const allGames = GameState.runningGames;
 * ```
 */
class GameState {
    /**
     * A map that tracks all running games by player usernames.
     * @type {Map<String, GameState>}
     */
    static runningGames = new Map();

    /**
     * Constructs a new GameState instance.
     * 
     * @param {string} PlayerX - The username of Player X.
     * @param {string} PlayerO - The username of Player O.
     * @param {Array|null} [board=null] - The initial state of the game board.
     * @param {string|null} [currentPlayer=null] - The player who starts the game.
     * @param {boolean|null} [gameActive=null] - Whether the game is active.
     * @param {Array|null} [moves=null] - The history of moves made in the game.
     */
    constructor(PlayerX, PlayerO, board = null, currentPlayer = null, gameActive = null, moves = null) {
        // create new board state
        this.reset();

        /** @type {string} The username of Player X. */
        this.PlayerX = PlayerX;
        /** @type {string} The username of Player O. */
        this.PlayerO = PlayerO;

        

        if (board != null) this.board = board;
        if (currentPlayer != null) this.currentPlayer = currentPlayer;
        // NOTE: a game can ONLY be inactive when it is finished and there
        // either a draw or a winner.
        if (gameActive != null) this.gameActive = gameActive;
        if (moves != null) this.moves = moves;

        GameState.runningGames.set(this.PlayerX, this);
        GameState.runningGames.set(this.PlayerO, this);
    }

    /**
     * Resets the game state to its initial configuration.
     */
    reset() {
        /** @type {string[]} 9 cells for a Tic-Tac-Toe game. Each element either X or O. */
        this.board = Array(9).fill(null);
        /** @type {string} X must always go first. (O is the other value it can have) */
        this.currentPlayer = 'X';
        /**
         * @type {boolean} Game is active by default. a game can ONLY be inactive
         * when it is finished and there either a draw or a winner.
         */
        this.gameActive = true; // game no longer active when it's a win/loss/draw
        /** @type {number[]} Largely unused. Meant to represent each move as an index */
        this.moves = [];
    }

    /**
     * Retrieves the current state of the game.
     * 
     * @returns {Object} The current game state, including board, current player, and activity status.
     */
    getState() {
        return {
            gameState: this.board,
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive,
        };
    }

    /**
     * Handles a player's move.
     * 
     * @param {number} index - The board index where the move is made (0-8).
     * @param {string} asPlayer - The username of the player making the move.
     * @returns {Object} The result of the move, indicating success or an error.
     */
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

    /**
     * Checks for a winner in the game.
     * 
     * @returns {string|null} The winner ('X', 'O', 'Draw') or null if no winner yet.
     */
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

    /**
     * Determines if the game is a draw.
     * 
     * @returns {boolean} True if the game is a draw, false otherwise.
     */
    getWinner() {
        const res = this.checkWinner();
        if (res == 'X')
            return this.PlayerX;
        if (res == 'O')
            return this.PlayerO;
        else
            return null;
    }

    /**
     * Determines if the game is a draw.
     * 
     * @returns {boolean} True if the game is a draw, false otherwise.
     */
    isDraw() {
        return !this.board.includes(null);
    }

    /**
     * Removes this game from the running games map.
     */
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