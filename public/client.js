
async function fetchGameState() {
    const response = await fetch('/game/state');
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
    const response = await fetch('/game/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index })
    });
    if (response.ok) {
        const data = await response.json();
        updateUI(data);
        if (data.message) alert(data.message);
    } else {
        const data = await response.json();
        alert(`Invalid move: ${data.message}`);
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

// TODO
function challengePlayerCancelled(challenger, challenged){
    console.error("not implemented");
}

// Simulate receiving a challenge
function showNotification(challenger, challenged) {
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

        console.log(`Challenge accepted between ${challenger} and ${challenged}`);
        // Make a POST request to send a challenge
        fetch('/lobby/challengeAccept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ challengerUsername: challenger, challengedUsername: challenged })
        }).then(response => response.json())
        .then(data => console.log(data))
        .catch(err => console.error(err));

    };

    declineBtn.onclick = () => {
        console.log('Challenge declined!');
        notification.style.display = 'none';
        // TODO tell the server the game is cancelled, do nothing further.
        // the server will handle telling the other player that it was declined.
        console.log(`Challenge declined between ${challenger} and ${challenged}`);
        // Make a POST request to send a challenge
        fetch('/lobby/challengeDecline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ challengerUsername: challenger, challengedUsername: challenged })
        }).then(response => response.json())
        .then(data => console.log(data))
        .catch(err => console.error(err));
    };
}

// TODO
function closeNotification(){
    console.error("not implemented");
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

if (board != null && status != null){
    fetchGameState();
}

// Just slap this on for now
// TODO integrate this properly
let eventSource = null;

// make sure we open the even source when we enter any page
document.addEventListener('DOMContentLoaded', function() {
    eventSource = new EventSource('/event/events');
    eventSource.onmessage = (event) => {
        console.log('Update received:', event.data);
        let data = JSON.parse(event.data);
        // check the event type
        switch (data.type) {
            case "challenge":
                // Give notification that user was challenged
                showNotification(data.challenger, data.challenged);
                break;
            case "challengeAccept":
                // go to the game screen
                window.location.href = "tictactoe.html";
                closeNotification();
                break;
            case "challengeDeclined":
                challengePlayerCancelled(data.challenger, data.challenged);
                closeNotification();
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
}, false);

// make sure we close the event source when we leave the page
window.addEventListener("beforeunload", (event) => {
    if (eventSource != null) {
        eventSource.close();
    }
});