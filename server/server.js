const exp = require("constants");
const express = require("express");
const https = require('https');
const fs = require('fs');
const app  = express();
const port = process.env.PORT || 3000;
const host = "localhost";
// const host = "0.0.0.0"

// Load the self-signed certificate and private key
const sslOptions = {
    key: fs.readFileSync('server/server.key'),
    cert: fs.readFileSync('server/server.cert')
};

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Import routes
const gameRoutes = require('./routes/game');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/game', gameRoutes);
app.use('/auth', authRoutes);

https.createServer(sslOptions, app).listen(port, host, () => {
    console.log(`Example app listening at https://${host}:${port}`);
});

// app.listen(port,host, () =>
//  console.log(`Example app listening at http://${host}:${port}`))
