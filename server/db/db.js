// work in progress. Having a dependency on MongoDB makes development more complicated
// so it will likely need to be discussed/prepared for all IDEs in use to correctly
// be configured.
const config = require('../config');
const mongoose = require('mongoose');
const account = require('../model/account');
const gameState = require('../model/gameState');
const crypto = require('crypto'); // for hashing games easily

const AccountSchema = new mongoose.Schema({
    name: String,
    username: String,
    wins: Number,
    losses: Number,
});
const GameSchema = new mongoose.Schema({
    playerX: String,
    playerO: String,
    board: [String],
    currentPlayer: String,
    gameActive: Boolean,
    // Winner: String,
    // Time: String,
    moves: [Number], // maybe string? maybe array?
    hash: String, // A unique hash to identify this gameState
});

const AccountModelDB = mongoose.model("Account", AccountSchema);
const GameModelDB = mongoose.model("GameState", GameSchema);

// Function to connect to the database
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

// Async function to store an account
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

// Async function to load an account by username
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

// Async function to store game state
async function storeGameState(gameStateObj) {
    try {
        let gameStateMongoose = _gameStateObjectToMongoose(gameStateObj);
        // return a promise
        await gameStateMongoose.save();
        // TODO error handling
        return gameStateMongoose.hash;
    } catch (error) {
        console.error("Error in storeGameState function:", error);
        return null; // Return null if any unexpected error occurs
    }
    
}

// Async function to load a game state by hash
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

// Converts Mongoose GameState to a plain JavaScript object (GameState object)
// for loading.
function _gameStateMongooseToObject(gameStateMongoose) {
    try {
        return new gameState.GameState(gameStateMongoose.PlayerX, gameStateMongoose.PlayerO,
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

// Converts a GameState object into a Mongoose GameState
// for storing.
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

// Converts Mongoose Account to a plain JavaScript object (Account)
// for loading.
function _accountMongooseToObject(accountMongoose) {
    try {
        return new account.Account(accountMongoose.name, accountMongoose.username,
            accountMongoose.wins, accountMongoose.losses);
    } catch (error) {
        console.error("Error converting Account document to Account object:", error.message);
        throw error;
    }
};

// Converts an Account object back into a Mongoose Account document
// for storing.
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
function _generateGameStateHash(gameStateObj) {
    const serializedState = JSON.stringify(gameStateObj, Object.keys(gameStateObj).sort());
    const hash = crypto.createHash('sha256').update(serializedState).digest('hex');
    return hash;
};

// check if account exists by asking the database
async function doesAccountExist(username) {
    const account = await loadAccount(username);
    if (!account) {
        return false;
    }
    return true;
}

async function getAllAccounts() {
    const accountsMongoose = await AccountModelDB.find();
    const accountObj = [];
    accountsMongoose.forEach(accountMongoose => {
        accountObj.push(new account.Account(accountMongoose.name, accountMongoose.username,
            accountMongoose.wins, accountMongoose.losses));
    });
    return accountObj;
}

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

async function usernameToName(username) {
    const account = await AccountModelDB.findOne({ username });
    if (account) {
        return account.name;
    } else {
        console.error(`Account with username ${username} not found.`);
        return null;
    }
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
    usernameToName
};
