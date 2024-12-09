
// Store active SSE connections (important for updating other user's gamestate
// when a different player takes an action). In the future this should be able
// to differentiate which player requires an event (not all players need to know
// that Xx_player_xX made their move since they are not in that game).
const clientMap = new Map(); // Maps `username` to `response` (client connection)

// Really dumb implementation. Basically just notify all clients that a change
// occurred to fetch any necessary changes. Only some players should realistically
// be notified (literally one other player because this is tic-tac-toe)
function notifyAllClients() {
    sendEvent({
        type: 'gameEvent',
        message: 'An event occurred, request new status please.',
    });
}

// Function to send an event to all clients. This just spews data. The client
// currently only uses this event as a signal that there might be a new gamestate
// available.
function sendEventAll(event) {
    clientMap.forEach((client) => {
        client.write(`data: ${JSON.stringify(event)}\n\n`);
    });
    console.log(`Event written: ${JSON.stringify(event)}`);
}

function sendEventTo(event, client) {
    if (clientMap.find(client) == undefined) {
        console.log("Client does not exist. Cannot send event.");
    }
    client.write(`data: ${JSON.stringify(event)}\n\n`);
    console.log(`Event written: ${JSON.stringify(event)}\nTo client: ${client}`);
}

function sendEventToUserName(event, username) {
    let client = clientMap.get(username);
    if (client == undefined) {
        console.log("Client does not exist. Cannot send event.");
        return;
    }
    client.write(`data: ${JSON.stringify(event)}\n\n`);
    console.log(`Event written: ${JSON.stringify(event)}\nTo client: ${client}`);
}

// TODO
// if authentication will use passwords then these should be replaced with tokens
function setClient(username, client) {
    clientMap.set(username, client);
}

function removeClient(username) {
    clientMap.delete(username);
}

function getClient(username) {
    return clientMap.get(username);
}

module.exports = {
    notifyAllClients,
    sendEventAll,
    sendEventTo,
    sendEventToUserName,
    setClient,
    removeClient,
    getClient,
};