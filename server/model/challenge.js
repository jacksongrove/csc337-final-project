/**
 * Challenge class responsible for holding two usernames involved in a challenge.
 * Many static helper functions are included to compare and contrast matching or
 * differing challenges. When we want to create a challenge we should use:
 * ```
 * let myChallenge = new Challenge("i_challenge_others", "i_am_challenged");
 * ```
 * If we want to then use the challenge we would to, let's say, check if it matches
 * another challenge we use:
 * ```
 * return myChallenge.toString() == otherChallenge.toString();
 * ```
 * Finally, there is the case where we want to store the challenges globally
 * to remember them and compare them later in our server. Once such use would be
 * checking if the challenge already exists:
 * ```
 * Challenge.addChallenge(myChallenge);
 * Challenge.challengeExists(otherChallenge);
 * ```
 */
class Challenge {
    /**
     * Creates a new Challenge instance.
     * @param {string} challenger - The username of the challenger.
     * @param {string} challenged - The username of the challenged user.
     */
    constructor(challenger, challenged) {
        /** @type {string} The username of the challenger. */
        this.challenger = challenger;

        /** @type {string} The username of the challenged user. */
        this.challenged = challenged;

        /** @type {string} A unique key for the challenge based on the two usernames*/
        this.key = Challenge.toKey(challenger, challenged);
    }

    /**
     * Converts the Challenge to a string representation.
     * @returns {string} The unique key of the challenge.
     */
    toString() {
        return this.key; // Allows easy string comparison
    }

    /**
     * @type {Map<string, Challenge>} Tracks challenges in progress using their key.
     */
    static challengesInProgress = new Map();
    
    

    /**
     * Checks if a challenge exists between two users.
     * @param {string} challenger - The username of the challenger.
     * @param {string} challenged - The username of the challenged user.
     * @returns {boolean} True if challenge exists, false otherwise.
     */
    static challengeExists(challenger, challenged){
        return Challenge.challengesInProgress.has(Challenge.toKey(challenger, challenged));
    }
    
    /**
     * Adds a new challenge to the tracking map.
     * @param {string} challenger - The username of the challenger.
     * @param {string} challenged - The username of the challenged user.
     * @returns {boolean} Whether it was added successfully.
     */
    static addChallenge(challenger, challenged) {
        const newChallenge = new Challenge(challenger, challenged);
        return Challenge.challengesInProgress.set(newChallenge.key, newChallenge);
    }
    
    /**
     * Removes a challenge from the tracking map.
     * @param {string} challenger - The username of the challenger.
     * @param {string} challenged - The username of the challenged user.
     * @returns {boolean} Whether it was removed successfully.
     */
    static removeChallenge(challenger, challenged) {
        return Challenge.challengesInProgress.delete(Challenge.toKey(challenger, challenged));
    }

    /**
     * Gets all challengers for a given challenged username.
     * @param {string} challenged - The username of the challenged user.
     * @returns {string[]} An array of usernames of challengers.
     */
    static getChallengersOfChallenged(challenged) {
        /** @type {string[]} */
        let challengerUsernames = [];
        Challenge.challengesInProgress.forEach(challenge => {
            if (challenge.challenged == challenged)
                challengerUsernames.push(challenge.challenger);
        })
        return challengerUsernames;
    }

    /**
     * Convert the challenger and challenged usernames into a key for Challenge.
     * @param {string} challenger - The username of the challenger.
     * @param {string} challenged - The username of the challenged user.
     * @returns {string} The key generated by these names.
     */
    static toKey(challenger, challenged) {
        return `${challenger}-${challenged}`;
    }
}

module.exports = Challenge;