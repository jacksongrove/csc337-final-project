const express = require("express");
const cookies = require("cookie-parser");
const favicon = require('serve-favicon');
const path = require("path");

// force the directory to be correct no matter where it is located
try {
    process.chdir(__dirname);
    process.chdir("..");
    console.log('Current working directory:', process.cwd());
} catch (error) {
    console.log('Could not change working directory');
}

const config = require('./config');
const app  = express();
const port = config.port;
const host = config.host;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookies());

// Import routes
const gameRoutes = require('./routes/game');
const authRoutes = require('./routes/auth');
const lobbyRoutes = require('./routes/lobby');
const eventRoutes = require('./routes/event');
const leaderboardRoutes = require('./routes/leaderboard');

const db = require('./db/db');

// Use routes
// Force everyone to be authenticated first, makes things easier for us.
app.use('/game', checkAuth, gameRoutes);
app.use('/auth', authRoutes);
app.use('/lobby', checkAuth, lobbyRoutes);
app.use('/event', checkAuth, eventRoutes);
app.use('/leaderboard', checkAuth, leaderboardRoutes);

// Route to serve login.html
app.get('/signup.html', skipLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'signup.html'));
});

// Route to serve signup.html
app.get('/login.html', skipLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Route to serve lobby.html
app.get('/lobby.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'lobby.html'));
});

// Route to serve game.html
app.get('/game.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'game.html'));
});

// Route to serve leaderboard.html
app.get('/leaderboard.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'leaderboard.html'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/img', 'favicon.ico'));
});

// Serve static files except protected HTML
app.use(express.static(path.join(__dirname, '../public')));



// Middleware to check authentication
function checkAuth(req, res, next) {
    try {
        const token = req.cookies.authToken; // Assuming authToken is username

        if (!token) {
            // Redirect to login if no token is found
            return res.redirect('/login.html');
        }
        const isValid = validateToken(token);
        if (!isValid) {
            return res.redirect('/login.html');
        }
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error checking token:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
}

// Middleware to skip login if authenticated
function skipLogin(req, res, next) {
    try {
        const token = req.cookies.authToken; // Assuming authToken is username

        if (!token) {
            next(); // Proceed to the next middleware or route handler
            return;
        }
        const isValid = validateToken(token);
        if (!isValid) {
            next(); // Proceed to the next middleware or route handler
            return;
        }
        // automatically go to lobby instead
        return res.redirect('/lobby.html');
    } catch (error) {
        console.error('Error checking token:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
}

// Check if token (username) is valid and they are who they claim they are.
// Well, we are taking their word for it.
function validateToken(token) {
    const username = token;
    return db.doesAccountExist(username);
}

app.listen(port,host, () => {
    let printURL = host == '0.0.0.0' ? 'localhost' : host;
    console.log(`Example app listening at http://${printURL}:${port}`)
});

db.connectToDb(config.mongoUrl);