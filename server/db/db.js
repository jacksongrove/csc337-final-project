// work in progress. Having a dependency on MongoDB makes development more complicated
// so it will likely need to be discussed/prepared for all IDEs in use to correctly
// be configured.
const mongoose = require('mongoose');

// Connect to some server somewhere with the DB
// "sudo service mongod start" if the server has MongoDB
const URL = "mongodb://127.0.0.1:27017/my_db_name";

const AccountSchema = new mongoose.Schema({
    name: String,
    username: String,
    wins: Number,
    losses: Number,
});
const GameSchema = new mongoose.Schema({
    PlayerX: String,
    PlayerO: String,
    Winner: String,
    Time: String,
    Moves: String, // maybe string? maybe array?
});

const AccountModelDB = mongoose.model("Account", AccountSchema);
const GameModelDB = mongoose.model("Game", GameSchema);

// mongoose.connect(URL);

// let my_account = new Account({
//     name: "test",
//     username: "test",
//     passwordHash: "abc",
//     wins: 0,
//     losses: 0,
// });

// let my_game = new Game({
//     PlayerX: "test",
//     PlayerO: "test1",
//     Winner: "test",
//     Time: "9/2",
//     Moves: "zxcvbnmas",
// });

// await my_account.save();

// TEMPLATE FUNCTION
// Function to connect to the database
async function connectToDb() {
    try {
        await mongoose.connect(URL);
        console.log("Connected to the database!");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    }
};

// async optional
async function storeAccount(accountDocument) {

}

// async recommended
async function loadAccount() {

}

// async optional
async function storeGameState(gameDocument) {

}

// async recommended
async function loadGameState() {

}

// TEMPLATE FUNCTION
// Converts Mongoose Game document to a plain JavaScript object (GameState object)
function gameToGameState(gameDocument) {
    try {
        return {
            PlayerX: gameDocument.PlayerX,
            PlayerO: gameDocument.PlayerO,
            Winner: gameDocument.Winner,
            Time: gameDocument.Time,
            Moves: gameDocument.Moves.split(','), // Convert moves string to an array
        };
    } catch (error) {
        console.error("Error converting Game document to GameState:", error);
        throw error;
    }
};

// TEMPLATE FUNCTION
// Converts a GameState object back into a Mongoose Game document
function gameStateToGameDocument(gameState) {
    try {
        return new GameModelDB({
            PlayerX: gameState.PlayerX,
            PlayerO: gameState.PlayerO,
            Winner: gameState.Winner,
            Time: gameState.Time,
            Moves: gameState.Moves.join(','), // Convert moves array to a string
        });
    } catch (error) {
        console.error("Error converting GameState to Game document:", error);
        throw error;
    }
};

// TEMPLATE FUNCTION
// Converts Mongoose Account document to a plain JavaScript object (Account)
function accountToAccountObject(accountDocument) {
    try {
        return new GameModelDB({
            PlayerX: gameState.PlayerX,
            PlayerO: gameState.PlayerO,
            Winner: gameState.Winner,
            Time: gameState.Time,
            Moves: gameState.Moves.join(','), // Convert moves array to a string
        });
    } catch (error) {
        console.error("Error converting GameState to Game document:", error);
        throw error;
    }
};

// TEMPLATE FUNCTION
// Converts an Account object back into a Mongoose Account document
function accountObjectToAccountDocument(accountObject) {
    try {
        return new AccountModelDB({
            name: accountObject.name,
            username: accountObject.username,
            wins: accountObject.wins,
            losses: accountObject.losses,
        });
    } catch (error) {
        console.error("Error converting Account object to Account document:", error);
        throw error;
    }
};



// Exported methods
module.exports = {
    connectToDb,
    AccountModelDB,
    GameModelDB,
    gameToGameState,
    gameStateToGameDocument,
    accountToAccountObject,
    accountObjectToAccountDocument,
};
