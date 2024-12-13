/**
 * This module manages active SSE (Server-Sent Event) client connections
 * and provides utilities to send events to connected clients. It is used
 * to notify clients about game state changes or other events.
 * 
 * The `clientMap` keeps track of active client connections, mapping
 * usernames to their respective response objects.
 * 
 * Example usage:
 * ```
 * const { setClient, notifyAllClients } = require('./clients');
 * setClient('username', clientResponse);
 * notifyAllClients();
 * ```
 */

/**
 * Store active SSE connections (important for updating other user's gamestate
 * when a different player takes an action). In the future this should be able
 * to differentiate which player requires an event (not all players need to know
 * that Xx_player_xX made their move since they are not in that game).
 * 
 * Key: `string` - Username of the client.
 * 
 * Value: `Response<any, Record<string, any>, number>` - Client's response object.
 * 
 * @type {Map<string, Response<any, Record<string, any>, number>>}
 */
const clientMap = new Map(); // Maps `username` to `response` (client connection)

/**
 * Handler function called when the client map changes.
 * Default: No operation.
 * @type {Function}
 */
let clientChangeHandler = () => {};

/**
 * Notifies all connected clients of a change. Sends a generic game event asking
 * them to fetch any necessary updates.
 * 
 * Example event sent:
 * ```
 * {
 *   type: 'gameEvent',
 *   message: 'An event occurred, request new status please.',
 * }
 * ```
 */
function notifyAllClients() {
    sendEventAll({
        type: 'gameEvent',
        message: 'An event occurred, request new status please.',
    });
}

/**
 * Sends an event to all connected clients.
 * 
 * @param {Object} event - The event to send to all clients.
 * @property {string} event.type - The type of the event.
 * @property {string} event.message - The message accompanying the event.
 */
function sendEventAll(event) {
    clientMap.forEach((client) => {
        client.write(`data: ${JSON.stringify(event)}\n\n`);
    });
    console.log(`Event written: ${JSON.stringify(event)}`);
}

/**
 * Sends an event to a specific client.
 * 
 * @param {Object} event - The event to send.
 * @param {Object} client - The client connection to send the event to.
 */
function sendEventTo(event, client) {
    if (clientMap.find(client) == undefined) {
        console.log("Client does not exist. Cannot send event.");
    }
    client.write(`data: ${JSON.stringify(event)}\n\n`);
    console.log(`Event written: ${JSON.stringify(event)}\nTo client: ${client}`);
}

/**
 * Sends an event to a specific client by their username.
 * 
 * @param {Object} event - The event to send.
 * @param {string} username - The username of the client to send the event to.
 */
function sendEventToUserName(event, username) {
    let client = clientMap.get(username);
    if (client == undefined) {
        console.log("Client does not exist. Cannot send event.");
        return;
    }
    client.write(`data: ${JSON.stringify(event)}\n\n`);
    console.log(`Event written: ${JSON.stringify(event)}\nTo client: ${client}`);
}

/**
 * Associates a client connection with a username.
 * 
 * @param {string} username - The username of the client.
 * @param {Object} client - The response object of the client.
 */
function setClient(username, client) {
    clientMap.set(username, client);
    clientChangeHandler();
}

/**
 * Removes a client connection from the map by their username.
 * 
 * @param {string} username - The username of the client to remove.
 * @returns {boolean} True if the client was removed, false if there was nothing to remove.
 */
function removeClient(username) {
    let resBool = clientMap.delete(username);
    clientChangeHandler();
    return resBool;
}


/**
 * Retrieves a client connection by their username.
 * 
 * @param {string} username - The username of the client to retrieve.
 * @returns {Object|undefined} The client connection if found, otherwise undefined.
 */
function getClient(username) {
    return clientMap.get(username);
}

/**
 * Retrieves all connected clients.
 * 
 * @returns {Map<string, Object>} The map of all active clients.
 */
function getAllClients() {
    return clientMap;
}

/**
 * Sets a handler function to be called whenever the client map changes.
 * 
 * @param {Function} handler - The function to call on client changes.
 */
function setOnClientChange(handler) {
    clientChangeHandler = handler;
}

/**
 * Removes the handler for client map changes, resetting it to the default no-op function.
 */
function removeOnClientChange() {
    clientChangeHandler = () => {};
}

module.exports = {
    notifyAllClients,
    sendEventAll,
    sendEventTo,
    sendEventToUserName,
    setClient,
    removeClient,
    getClient,
    getAllClients,
    setOnClientChange,
    removeOnClientChange
};