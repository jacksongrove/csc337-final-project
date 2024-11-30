const exp = require("constants");
const express = require("express");
const https = require('https');
const fs = require('fs');
const app  = express();
const port = process.env.PORT || 3000;
const host = "localhost";
// const host = "0.0.0.0"

// Load the self-signed certificate and private key
// Cannot load without certificate since passwords require https which then
// requires a certificate.
const sslOptions = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
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

// Use HTTPS instead. This will require a certificate. For now we can just make
// one up using:
// $ openssl req -nodes -new -x509 -keyout server.key -out server.cert
https.createServer(sslOptions, app).listen(port, host, () => {
    console.log(`Example app listening at https://${host}:${port}`);
});

// app.listen(port,host, () =>
//  console.log(`Example app listening at http://${host}:${port}`))
