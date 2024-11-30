const exp = require("constants");
const express = require("express");
const app  = express();
const port = process.env.PORT || 3000;
const host = "localhost";
// const host = "0.0.0.0"

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Import routes
const gameRoutes = require('./routes/game');
// const authRoutes = require('./routes/auth');

// Use routes
app.use('/game', gameRoutes);
// app.use('/auth', authRoutes);

let users = new Set()

// POST /signup
app.post('/signup', (req, res) => {
    const { username } = req.body;

    // Validate input
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }

    // Check if user already exists
    if (users.has(username)) {
        return res.status(409).json({ message: 'User already exists.' });
    }

    // Add the user
    users.add(username);
    res.status(201).json({ message: 'User created successfully.' });
});

// POST /login
app.post('/login', (req, res) => {
    const { username, auth } = req.body;

    // Validate input
    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }

    // Check if user exists
    if (!users.has(username)) {
        return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Login successful.' });
});

app.listen(port,host, () =>
 console.log(`Example app listening at http://${host}:${port}`))
