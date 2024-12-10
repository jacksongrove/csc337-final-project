// work in progress. Having a dependency on MongoDB makes development more complicated
// so it will likely need to be discussed/prepared for all IDEs in use to correctly
// be configured.
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
        await mongoose.connect(mongoUrl);
        console.log("Connected to the database!");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    }
};

// async optional
async function storeAccount(accountObj) {
    let accountMongoose = _accountObjectToMongoose(accountObj);
    // return a promise
    return accountMongoose.save().then(result => {
        // TODO error handling
        return;
    });
}

// async recommended
async function loadAccount(username) {
    // return a promise
    return AccountModelDB.findOne({username}).then(result => {
        let accountMongoose = result;
        if (result == null)
            return null; // db could not find name. Null loaded instead
        let accountObject = _accountMongooseToObject(accountMongoose);
        return accountObject;
    });
}

// async optional
async function storeGameState(gameStateObj) {
    let gameStateMongoose = _gameStateObjectToMongoose(gameStateObj);
    // return a promise
    return gameStateMongoose.save().then(result => {
        // TODO error handling
        return gameStateMongoose.hash;
    });
}

// async recommended
async function loadGameState(gameStateHash) {
    // return a promise
    return GameModelDB.findOne({username}).then(result => {
        let gameStateMongoose = result;
        if (result == null)
            return null; // db could not find game. Null loaded instead
        let gameStateObj = _gameStateMongooseToObject(gameStateMongoose);
        return gameStateObj;
    });
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
        console.error("Error converting Game document to GameState:", error);
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
        console.error("Error converting GameState to Game document:", error);
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
        console.error("Error converting Account document to Account object:", error);
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
        console.error("Error converting Account object to Account document:", error);
        throw error;
    }
};

function _generateGameStateHash(gameStateObj) {
    const serializedState = JSON.stringify(gameStateObj, Object.keys(gameStateObj).sort());
    const hash = crypto.createHash('sha256').update(serializedState).digest('hex');
    return hash;
};



// Exported methods
module.exports = {
    connectToDb,
    AccountModelDB,
    GameModelDB,
    storeAccount,
    loadAccount,
    storeGameState,
    loadGameState,
};
