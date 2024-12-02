// work in progress. Having a dependency on MongoDB makes development more complicated
// so it will likely need to be discussed/prepared for all IDEs in use to correctly
// be configured.
const mongoose = require('mongoose');

// Connect to some server somewhere with the DB
const URL = "mongodb://127.0.0.1/my_db_name";

const AccountSchema = new mongoose.Schema({
    name: String,
    username: String,
    passwordHash: String,
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
const connectToDb = async () => {
    throw new Error("Not implemented");
};

// TEMPLATE FUNCTION
// Converts Mongoose Game document to a plain JavaScript object (GameState object)
const gameToGameState = (gameDocument) => {
    throw new Error("Not implemented");
    // returns GameState object
};

// TEMPLATE FUNCTION
// Converts a GameState object back into a Mongoose Game document
const gameStateToGameDocument = (gameState) => {
    throw new Error("Not implemented");
    // returns an object that can be stored in the database
};

// TEMPLATE FUNCTION
// Converts Mongoose Account document to a plain JavaScript object (Account)
const accountToAccountObject = (accountDocument) => {
    throw new Error("Not implemented");
    // return an account object (assuming we have one to begin with)
};

// TEMPLATE FUNCTION
// Converts an Account object back into a Mongoose Account document
const accountObjectToAccountDocument = (accountObject) => {
    throw new Error("Not implemented");
    // returns an object that can be stored in the database
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