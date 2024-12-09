// const exp = require("constants");
const express = require("express");
// const fs = require('fs');
const app  = express();
const port = process.env.PORT || 3000;
const host = "localhost";
// const host = "0.0.0.0"

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Import routes
const gameRoutes = require('./routes/game');
const authRoutes = require('./routes/auth');
const db = require('./db/db');


// Use routes
app.use('/game', gameRoutes);
app.use('/auth', authRoutes);

app.listen(port,host, () =>
    console.log(`Example app listening at http://${host}:${port}`))

db.connectToDb();