const express = require('express');
const router = express.Router();
const clients = require('../model/clients');

// SSE endpoint. Still learning what this does. Seems to be a special type of
// connection that allows keeping a connection alive and sending data through.
// Probably not HTTP/1.0. Maybe an HTTP/1.1 feature.
router.get('/events', (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const usernameFromCookie = req.cookies.authToken;
        if (usernameFromCookie == null || usernameFromCookie == undefined) {
            // cannot add client to events because they are not logged in.
            return res.status(401).json({ message: 'Must be logged in to subscribe to events.' });
        }

        // TODO, if another connection is made then boot the original connection.
        // Such as sending the client a message that another user logged into the
        // same account.

        // Keep track of this client connection
        // clients.clientList.push(res);
        clients.setClient(usernameFromCookie, res);

        // Handle disconnection
        req.on('close', () => {
            // clients.clientList.splice(clients.clientList.indexOf(res), 1);
            clients.removeClient(usernameFromCookie);
        });
    } catch (error) {
        console.error('Error handling events subscribe request:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
    
});

module.exports = router;