// const exp = require("constants");
const config = require('./config');
const express = require("express");
const cookies = require("cookie-parser");


// const fs = require('fs');
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

console.log(`Connecting to MongoDB at "${config.mongoUrl}"`);
db.connectToDb(config.mongoUrl);