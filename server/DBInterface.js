const mongoose = require('mongoose');

const URL = 'mongodb://127.0.0.1/test';

class DBInterface {
    #User;
    #GameState;

    constructor() {
        mongoose.connect(URL);
        console.log("INFO: Connected to MongoDB.");

        const usersSchema = new mongoose.Schema({
            name:    String,
            username: String,
            passwordHash: String,
            wins: Number,
            losses: Number
        });

        const GameSchema = new mongoose.Schema({
            PlayerX: String,
            PlayerO: String,
            Winner: String,
            Time: String,
            Moves: String, // maybe string? maybe array?
        });

        this.#User = mongoose.model('User', usersSchema);
        this.#GameState = mongoose.model('GameState',GameSchema);
        
        console.log("DB initialized");
    }

    async new_user(data) {
        const nUser = new this.#User(data)

        console.log(`${nUser.name}: ${nUser.username}.`);
        await nUser.save();
        console.log("saved!")
    }

    async get_user(uname) {
        let out = await this.#User.find({username: uname});
        console.log(out);
    }
}

module.exports = DBInterface;
