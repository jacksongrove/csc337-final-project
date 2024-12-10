const express = require("express");
const cookies = require("cookie-parser");

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

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookies());

// Import routes
const gameRoutes = require('./routes/game');
const authRoutes = require('./routes/auth');
const lobbyRoutes = require('./routes/lobby');
const eventRoutes = require('./routes/event');

const db = require('./db/db');



// Use routes
app.use('/game', gameRoutes);
app.use('/auth', authRoutes);
app.use('/lobby', lobbyRoutes);
app.use('/event', eventRoutes);

app.listen(port,host, () => {
    let printURL = host == '0.0.0.0' ? 'localhost' : host;
    console.log(`Example app listening at http://${printURL}:${port}`)
});

db.connectToDb(config.mongoUrl);