class Account {
    constructor(name, username, wins, losses) {
        this.name = name;
        this.username = username;
        this.wins = wins;
        this.losses = losses;
    }
}
// export only account
exports.Account = Account;