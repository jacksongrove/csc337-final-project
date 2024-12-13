/**
 * Represents an account with details about the user and their game statistics.
 */
class Account {
    /**
     * Creates a new Account instance.
     * 
     * @param {string} name - The name of the account holder.
     * @param {string} username - The unique username of the account holder.
     * @param {number} wins - The number of games won by the account holder.
     * @param {number} losses - The number of games lost by the account holder.
     */
    constructor(name, username, wins, losses) {
        /** @type {string} The name of the account holder. */
        this.name = name;

        /** @type {string} The unique username of the account holder. */
        this.username = username;

        /** @type {number} The number of games won by the account holder. */
        this.wins = wins;

        /** @type {number} The number of games lost by the account holder. */
        this.losses = losses;
    }
}
// export only account
exports.Account = Account;