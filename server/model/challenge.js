class Challenge {
    constructor(challenger, challenged) {
        this.key = [challenger, challenged].join('-');
    }

    toString() {
        return this.key; // Allows easy string comparison
    }

    static challengesInProgress = new Set();

    static isDuplicateChallenge(challenger, challenged, res, errMsg) {
        if (Challenge.challengesInProgress.has(new Challenge(challenger, challenged))) {
            res.status(401).json({ message: errMsg });
            return true;
        }
        return false;
    }
    
    static challengeExists(challenger, challenged, res, errMsg){
        if (Challenge.challengesInProgress.has(new Challenge(challenger, challenged)) != undefined) {
            return true;
        }
        res.status(401).json({ message: errMsg });
        return false;
    }
    
    static addChallenge(challenger, challenged) {
        Challenge.challengesInProgress.add( new Challenge(challenger, challenged));
    }
    
    static removeChallenge(challenger, challenged) {
        Challenge.challengesInProgress.delete(new Challenge(challenger, challenged));
    }
}

module.exports = Challenge;