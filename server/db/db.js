/**
 * This module handles MongoDB operations for accounts and game states.
 * It provides schema definitions, database connection utilities, and functions
 * for storing, retrieving, and managing accounts and game states.
 */
const config = require('../config');
const mongoose = require('mongoose');
const account = require('../model/account');
const gameState = require('../model/gameState');
const crypto = require('crypto'); // for hashing games easily

/**
 * MongoDB schema for Account documents.
 * @type {mongoose.Schema}
 */
const AccountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
});

/**
 * MongoDB schema for GameState documents.
 * @type {mongoose.Schema}
 */
const GameSchema = new mongoose.Schema({
    playerX: { type: String, required: true },
    playerO: { type: String, required: true },
    board: { type: [String], default: () => Array(9).fill(null) },
    currentPlayer: { type: String, required: true, enum: ['X', 'O'] },
    gameActive: { type: Boolean, default: true },
    moves: { type: [Number], default: [] },
    hash: { type: String, unique: true },
});

/**
 * Account Model for interacting with the `accounts` collection.
 * @type {mongoose.Model}
 */
const AccountModelDB = mongoose.model("Account", AccountSchema);

/**
 * GameState Model for interacting with the `gameStates` collection.
 * @type {mongoose.Model}
 */
const GameModelDB = mongoose.model("GameState", GameSchema);

/**
 * Connects to the MongoDB database.
 * @param {string} mongoUrl - MongoDB connection URL.
 * @returns {Promise<void>}
 * @throws {Error} If the connection fails.
 */
async function connectToDb(mongoUrl) {
    try {
        console.log(`Connecting to MongoDB at "${config.mongoUrl}"`);
        await mongoose.connect(mongoUrl);
        console.log("Connected to the database!");
    } catch (error) {
        // This error is fairly critical. This class really doesn't want to
        // continue until this is handled. If we start the server and can't get
        // a connection then it's likely a common issue such as getting the wrong
        // URL, having a firewall block the connection, or forgetting to start the db.
        console.error("Error connecting to the database:", error.message);
        throw error;
    }
};

/**
 * Stores an account in the database.
 * @param {Object} accountObj - The account object to store.
 * @returns {Promise<Object|null>} The saved account or null on error.
 */
async function storeAccount(accountObj) {
    try {
        let accountMongoose = _accountObjectToMongoose(accountObj);

        // Await the save operation and handle errors properly
        const result = await accountMongoose.save();
        return result; // Return the result if success
    } catch (error) {
        console.error("Account could not be stored because:", error);
        // Handle specific mongoose errors or return null as a fallback
        return null;
    }
    
}

/**
 * Retrieves an account by username.
 * @param {string} username - The username of the account to retrieve.
 * @returns {Promise<Object|null>} The account object or null if not found.
 */
async function loadAccount(username) {
    try {
        let accountMongoose = await AccountModelDB.findOne({username})
        if (accountMongoose == null)
            return null; // db could not find name. Null loaded instead
        let accountObject = _accountMongooseToObject(accountMongoose);
        return accountObject;
    } catch (error) {
        console.error("Error in loadAccount function:", error);
        return null; // Return null if any unexpected error occurs
    }
    
}

/**
 * Stores a game state in the database.
 * @param {Object} gameStateObj - The game state object to store.
 * @returns {Promise<string|null>} The hash of the saved game state or null on error.
 */
async function storeGameState(gameStateObj) {
    try {
        let gameStateMongoose = _gameStateObjectToMongoose(gameStateObj);
        // return a promise
        await gameStateMongoose.save();
        return gameStateMongoose.hash;
    } catch (error) {
        console.error("Error in storeGameState function:", error);
        return null; // Return null if any unexpected error occurs
    }
    
}

/**
 * Retrieves a game state by hash.
 * @param {string} gameStateHash - The hash of the game state to retrieve.
 * @returns {Promise<Object|null>} The game state object or null if not found.
 */
async function loadGameState(gameStateHash) {
    try {
        // return a promise
        let gameStateDocument = await GameModelDB.findOne({gameStateHash});
        if (result == null)
            return null; // db could not find game. Null loaded instead
        let gameStateObj = _gameStateMongooseToObject(gameStateDocument);
        return gameStateObj;
    } catch (error) {
        console.error("Error in loadGameState function:", error);
        return null; // Return null if any unexpected error occurs
    }
    
}

/**
 * Converts a Mongoose GameState document to a GameState object.
 * @param {Object} gameStateMongoose - The GameState Mongoose document.
 * @returns {Object} The GameState object.
 * @throws {Error} On conversion failure.
 */
function _gameStateMongooseToObject(gameStateMongoose) {
    try {
        return new gameState.GameState(gameStateMongoose.PlayerX, gameStateMongoose.PlayerO,
            gameStateMongoose.playerX,
            gameStateMongoose.playerO,
            gameStateMongoose.board,
            gameStateMongoose.currentPlayer,
            gameStateMongoose.gameActive,
            gameStateMongoose.moves
        );
    } catch (error) {
        console.error("Error converting Game document to GameState:", error.message);
        throw error;
    }
};

/**
 * Converts a GameState object into a Mongoose GameState document for storing.
 * @param {Object} gameStateObj - The GameState object.
 * @returns {Object} The GameState Mongoose document.
 */
function _gameStateObjectToMongoose(gameStateObj) {
    try {
        return new GameModelDB({
            PlayerX: gameStateObj.PlayerX,
            PlayerO: gameStateObj.PlayerO,
            Board: gameStateObj.board,
            CurrentPlayer: gameStateObj.currentPlayer,
            GameActive: gameStateObj.gameActive,
            // Winner: gameStateObj.Winner,
            // Time: gameStateObj.Time,
            Moves: gameStateObj.moves,
            Hash: _generateGameStateHash(gameStateObj)
        });
    } catch (error) {
        console.error("Error converting GameState to Game document:", error.message);
        throw error;
    }
};

/**
 * Converts a Mongoose Account document to a plain JavaScript object.
 * This is used when loading data from the database for application use.
 * 
 * @param {Object} accountMongoose - The Mongoose Account document.
 * @returns {Object} The plain JavaScript account object.
 * @throws {Error} If the conversion fails.
 */
function _accountMongooseToObject(accountMongoose) {
    try {
        return new account.Account(accountMongoose.name, accountMongoose.username,
            accountMongoose.wins, accountMongoose.losses);
    } catch (error) {
        console.error("Error converting Account document to Account object:", error.message);
        throw error;
    }
};

/**
 * Converts a plain JavaScript Account object to a Mongoose Account document.
 * This is used when storing account data into the database.
 * 
 * @param {Object} accountObj - The plain JavaScript account object.
 * @returns {Object} The Mongoose Account document.
 * @throws {Error} If the conversion fails.
 */
function _accountObjectToMongoose(accountObj) {
    try {
        return new AccountModelDB({
            name: accountObj.name,
            username: accountObj.username,
            wins: accountObj.wins,
            losses: accountObj.losses,
        });
    } catch (error) {
        console.error("Error converting Account object to Account document:", error.message);
        throw error;
    }
};

// Generate a gamestate hash to be used for identifying games uniquely.
// Currently not used but likely useful because games are currently identified
// by what players are in the game (maybe the same two players have multiple
// games and we want to keep track of that)
/**
 * Generates a hash to uniquely identify a game state.
 * This is useful for identifying and differentiating multiple games involving the same players.
 * 
 * @param {Object} gameStateObj - The game state object to hash.
 * @returns {string} The unique hash for the game state.
 */
function _generateGameStateHash(gameStateObj) {
    const serializedState = JSON.stringify(gameStateObj, Object.keys(gameStateObj).sort());
    const hash = crypto.createHash('sha256').update(serializedState).digest('hex');
    return hash;
};

/**
 * Checks if an account exists in the database by username.
 * 
 * @param {string} username - The username to check.
 * @returns {Promise<boolean>} True if the account exists, false otherwise.
 */
async function doesAccountExist(username) {
    const account = await loadAccount(username);
    if (!account) {
        return false;
    }
    return true;
}

/**
 * Retrieves all accounts from the database.
 * 
 * @returns {Promise<Object[]>} An array of account objects.
 */
async function getAllAccounts() {
    const accountsMongoose = await AccountModelDB.find();
    const accountObj = [];
    accountsMongoose.forEach(accountMongoose => {
        accountObj.push(new account.Account(accountMongoose.name, accountMongoose.username,
            accountMongoose.wins, accountMongoose.losses));
    });
    return accountObj;
}

/**
 * Increments the win count for a specific account by username.
 * 
 * @param {string} username - The username of the account to update.
 * @returns {Promise<Object|null>} The updated account object or null if not found.
 */
async function incrementWin(username) {
    const account = await AccountModelDB.findOne({ username });
    if (account) {
        account.wins += 1; // Increment the wins counter
        await account.save(); // Save the updated account back to the database
        return account;
    } else {
        console.error(`Account with username ${username} not found.`);
        return null;
    }
}

/**
 * Increments the loss count for a specific account by username.
 * 
 * @param {string} username - The username of the account to update.
 * @returns {Promise<Object|null>} The updated account object or null if not found.
 */
async function incrementLoss(username) {
    const account = await AccountModelDB.findOne({ username });
    if (account) {
        account.losses += 1; // Increment the losses counter
        await account.save(); // Save the updated account back to the database
        return account;
    } else {
        console.error(`Account with username ${username} not found.`);
        return null;
    }
}

/**
 * Retrieves the name associated with a specific username.
 * 
 * @param {string} username - The username to look up.
 * @returns {Promise<string|null>} The name associated with the username or null if not found.
 */
async function usernameToName(username) {
    const account = await AccountModelDB.findOne({ username });
    if (account) {
        return account.name;
    } else {
        console.error(`Account with username ${username} not found.`);
        return null;
    }
}

/**
 * Converts an account object to a public view representation.
 * This excludes sensitive or internal details of the account.
 * 
 * @param {Object} account - The account object to convert.
 * @returns {Object} The public view representation of the account.
 */
function convertToPublicAccountView(account) {
    return {
        name: account.name,
        username: account.username,
        wins: account.wins,
        losses: account.losses,
    };
}


// Exported methods
module.exports = {
    connectToDb,
    AccountModelDB,
    GameModelDB,
    storeAccount,
    loadAccount,
    storeGameState,
    loadGameState,
    doesAccountExist,
    getAllAccounts,
    incrementWin,
    incrementLoss,
    usernameToName,
    convertToPublicAccountView
};
