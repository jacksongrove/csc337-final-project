// Periodically poll server
// TODO this is only temporary. It's better to have the server somehow
// send an event to the client instead of periodically asking.
// setInterval(() => {
//     // Only poll it the board and status exist
//     if (board != null && status != null){
//         onGameStateUpdate();
//     }
// }, 1000);

// const { getCookies } = require("undici-types");
// import { getCookies } from './undici-types';

async function fetchGameState() {
    const response = await fetch('/game/state/' + selectedGame);
    const data = await response.json();
    updateUI(data);
}

function updateUI({ gameState, currentPlayer, gameActive }) {
    board.innerHTML = '';
    gameState.forEach((cell, index) => {
        const div = document.createElement('div');
        div.classList.add('cell');
        if (cell) {
            div.style.color = cell === 'X' ? 'red' : 'blue';
            div.classList.add('taken');
            div.textContent = cell || '';
        }
        div.addEventListener('click', () => makeMove(index));
        board.appendChild(div);
    });
    status.textContent = gameActive ? `Player ${currentPlayer}'s turn` : `Game over`;
}

async function makeMove(index) {
    const response = await fetch('/game/move/' + selectedGame, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index })
    });
    if (response.ok) {
        const data = await response.json();
        updateUI(data);
        if (data.message) alert(data.message);
    } else {
        alert('Invalid move');
    }
}

async function resetGame() {
    await fetch('/game/reset/' + selectedGame, { method: 'POST' });
    fetchGameState();
}

// This only runs once, though it should run whenever there is a change. Or
// maybe it gets scrapped entirely.
async function getAvailableGames(){
    const response = await fetch('/game/runningGamesKeys');
    const data = await response.json();
    return data
}

async function updateAvailableGames(){
    dropdown = document.getElementById("gameSelectDropdown");
    response = await getAvailableGames();
    // Clear existing options in the dropdown
    dropdown.innerHTML = '';

    // Add a default "select game" option
    const defaultOption = document.createElement('option');
    defaultOption.text = "Select a game";
    defaultOption.value = "";

    dropdown.add(defaultOption);
    for (let index = 0; index < response.runningGamesKeys.length; index++) {
        const gameKey = response.runningGamesKeys[index];
        const option = document.createElement('option');
        option.text = gameKey; // Display the game key
        option.value = gameKey; // Use the game key as the value
        dropdown.add(option); // Add the option to the dropdown
    }

    // Add change event listener to the dropdown
    dropdown.addEventListener('change', handleGameSelection);
}

function handleGameSelection() {
    const dropdown = document.getElementById("gameSelectDropdown");
    const selectedGameKey = dropdown.value;

    if (selectedGameKey) {
        console.log(`User selected game: ${selectedGameKey}`);
        // Perform further actions, e.g., join the game or fetch game details
        selectedGame = selectedGameKey
        fetchGameState();
    } else {
        console.log("No game selected.");
    }
}

// Simulate challengePlayer function
function challengePlayer(username) {
    console.log(`Challenged ${username}`);
    // Make a POST request to send a challenge
    fetch('/lobby/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengedUsername: username })
    }).then(response => response.json())
      .then(data => console.log(data))
      .catch(err => console.error(err));
}

// Simulate receiving a challenge
function showNotification(challenger) {
    const notification = document.getElementById('notification');
    const challengeMessage = document.getElementById('challengeMessage');
    const acceptBtn = document.getElementById('acceptBtn');
    const declineBtn = document.getElementById('declineBtn');

    challengeMessage.textContent = `${challenger} has challenged you!`;
    notification.style.display = 'block';

    acceptBtn.onclick = () => {
        console.log('Challenge accepted!');
        notification.style.display = 'none';
        // TODO begin game by asking the server for a game id to join
        // once we have the game id we can enter the game
        // the server will handle telling the other player to connect to the
        // same gameid
    };

    declineBtn.onclick = () => {
        console.log('Challenge declined!');
        notification.style.display = 'none';
        // TODO tell the server the game is cancelled, do nothing further.
        // the server will handle telling the other player that it was declined.
    };
}

function loadLobbyExample(){
    // Example list of players
    const players = [
        { name: 'Alice', username: 'alice123' },
        { name: 'Bob', username: 'bob456' },
    ];

    // Reference to the players div
    const playersDiv = document.getElementById('players');

    // Load players dynamically
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';
        playerDiv.innerHTML = `
            <div>
                <strong>${player.name}</strong><br>
                <small>${player.username}</small>
            </div>
            <button onclick="challengePlayer('${player.username}')">Challenge</button>
        `;
        playersDiv.appendChild(playerDiv);
    });

    // Simulate a challenge from another player after 2 seconds
    // setTimeout(() => showNotification('Charlie'), 2000);
}



const board = document.getElementById('board');
const status = document.getElementById('status');
selectedGame = "Game1"
updateAvailableGames();

if (board != null && status != null){
    fetchGameState();
}

// Just slap this on for now
// TODO integrate this properly
const eventSource = new EventSource('/event/events');

// make sure we close the event source when we leave the page
window.onbeforeunload = function () {
    eventSource.close();
};

eventSource.onmessage = (event) => {
    console.log('Update received:', event.data);
    let data = JSON.parse(event.data);
    // check the event type
    switch (data.type) {
        case "challenge":
            // Give notification that user was challenged
            showNotification(data.challenged);
            break;
        case "gameState":
            // Update the GameState UI
            fetchGameState();
            break;
        default:
            break;
    }
    
};

eventSource.onerror = (error) => {
    console.error('SSE error:', error);
};