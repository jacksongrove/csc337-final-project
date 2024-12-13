/// START OF FUNCTIONS

async function fetchGameState() {
    const response = await fetch('/game/state');
    const data = await response.json();
    updateUI(data);
}

async function updateOnlineUsers() {
    const response = await fetch('/lobby/onlineUsers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ index })
    });
    if (response.ok) {
        const data = await response.json();
        loadLobby(data.allOnlineUsers);
    } else {
        const data = await response.json();
        console.error(`Could not load online users: ${data.message}`);
    }
}

function updateUI({ gameState, currentPlayer, gameActive, playerX, playerO, winner }) {
    const tictactoeStatusText = document.getElementById('status');

    // if there is no board then we cannot draw
    // if there is no gamestate we cannot draw
    if (board == undefined || gameState == undefined) {
        return;
    }
    
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
    if (winner) {
        tictactoeStatusText.textContent = `${winner} has won!`;
    } else if (!gameActive) {
        tictactoeStatusText.textContent = `Draw!`;
    } else {
        tictactoeStatusText.textContent = `Player ${currentPlayer}'s turn`;
    }

    document.getElementById('playerXname').textContent = playerX.name;
    document.getElementById('playerXusername').textContent = playerX.username;
    document.getElementById('playerOname').textContent = playerO.name;
    document.getElementById('playerOusername').textContent = playerO.username;
    
}

async function makeMove(index) {
    const response = await fetch('/game/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index })
    });
    if (response.ok) {
        const data = await response.json();
        // updateUI(data);
        // The server will notify the player to update their board
        console.log(`Successfully moved: ${data.message}`);
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
    fetch('/lobby/challengeCancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengerUsername: challenger, challengedUsername: challenged })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to decline the challenge.');
        }
        return response.json();
    })
    .then(data => console.log('Challenge declined successfully:', data))
    .catch(err => console.error('Error declining challenge:', err));
}

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

function loadLobby(players){
    // Example list of players
    // const players = [
    //     { name: 'Alice', username: 'alice123' },
    //     { name: 'Bob', username: 'bob456' },
    // ];

    // Reference to the players div
    const playersDiv = document.getElementById('players');

    // if it doesn't exist then we can't draw to it
    if (playersDiv == undefined) {
        return;
    }

    // clear of any previous data.
    playersDiv.innerHTML = '';

    // Load players dynamically
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';
        playerDiv.innerHTML = `
            <div>
                <strong>${player.name}</strong><br>
                <small>${player.username}</small>
            </div>
            <button id="challengeButton" onclick="challengePlayer('${player.username}')">Challenge</button>
        `;
        playersDiv.appendChild(playerDiv);
    });

    // Simulate a challenge from another player after 2 seconds
    // setTimeout(() => showNotification('Charlie'), 2000);
}


function shouldListenEvents() {
    // Get the current path
    const currentPath = window.location.pathname;

    // Only attach EventSource for specific pages
    const allowedPages = ['/lobby.html', '/leaderboard.html', '/tictactoe.html'];

    return allowedPages.includes(currentPath);
}

function setupEvents() {
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
                fetchIncomingChallenges(); // TODO TEMP ask if there are others 
                break;
            case "gameState":
                // Update the GameState UI
                fetchGameState();
                break;
            case "lobbyUpdate":
                loadLobby(data.allOnlineUsers);
            default:
                break;
        }
    };
    
    eventSource.onerror = (error) => {
        console.error('SSE error:', error);
    };
}

function shouldShowUsername() {
    // Get the current path
    const currentPath = window.location.pathname;

    // Only attach EventSource for specific pages
    const allowedPages = ['/lobby.html', '/leaderboard.html', '/tictactoe.html'];

    return allowedPages.includes(currentPath);
}

function updateUsername() {
    // Fetch username from cookies
    const username = getCookie('authToken');
    const name = getCookie('name');

    // in the rare case this gets deleted we want to retrieve it again
    if (name == undefined) {
        // do it sometime in the future. It's fine if the user doesn't see it
        // right away. It's fine if we don't have it right away.
        fetchCookies(username).then( () => {
            // Update UI with username
            if (document.getElementById('username') != undefined) {
                document.getElementById('username').textContent = username;
            }
            if (document.getElementById('name') != undefined) {
                document.getElementById('name').textContent = name;
            }  
        }).catch(err => {
            console.error("Error while fetching cookies" + err);
        });
    } else {
        // Update UI with username
        if (document.getElementById('username') != undefined) {
            document.getElementById('username').textContent = username;
        }
        if (document.getElementById('name') != undefined) {
            document.getElementById('name').textContent = name;
        }  
    }
}

async function fetchCookies(username){
    return fetch('/auth/refreshCookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    }).then(response => response.json())
    .then(data => {
        console.log(data);
        return data;
    })
    .catch(err => {
        throw err;
    });
} 


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Function to fetch leaderboard data and populate the table
async function loadLeaderboard() {
    try {
        const response = await fetch('/leaderboard'); // Make GET request
        if (!response.ok) throw new Error('Failed to load leaderboard');
        
        const data = await response.json(); // Parse the response as JSON
        const accounts = data.accounts
        const table = document.getElementById('lb');
        
        accounts.forEach(player => {
            // Create a new row for each player
            const row = document.createElement('tr');
            
            // Create columns for player's name and win:loss record
            const nameCell = document.createElement('th');
            nameCell.scope = 'row';
            nameCell.textContent = player.name; // Player name
            
            const winLossCell = document.createElement('td');
            winLossCell.textContent = `${player.wins}:${player.losses}`; // Win:loss

            // Append the cells to the row
            row.appendChild(nameCell);
            row.appendChild(winLossCell);
            
            // Append the row to the table
            table.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

function fetchIncomingChallenges() {
    // Ask the server if we have any challenges waiting for us
    fetch('lobby/hasChallenge', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch challenges.');
        }
        return response.json();
    })
    .then(data => {
        const challengersOfChallenged = data.challengersOfChallenged || [];
        
        // Handle the challengers here
        if (challengersOfChallenged.length > 0) {
            console.log('Challenges waiting:', challengersOfChallenged);

            // Example: Notify user of challenges
            challengersOfChallenged.forEach(challenger => {
                showNotification(challenger);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching challenges:', error);
    });
}

/// START OF STATEMENTS

const board = document.getElementById('board');
const status = document.getElementById('status');

if (board != null && status != null){
    fetchGameState();
}

// Just slap this on for now
// TODO integrate this properly
let eventSource = null;

// make sure we open the even source when we enter any where we are signed in
document.addEventListener('DOMContentLoaded', function() {
    if (shouldListenEvents())
        setupEvents();
    if (shouldShowUsername)
        updateUsername();
    fetchIncomingChallenges();
    
}, false);


// handle a log out event
if (document.getElementById('logoutButton') != undefined) {
    document.getElementById('logoutButton').addEventListener('click', async () => {
        try {
            const response = await fetch('/auth/logout', { method: 'POST' });
            if (response.ok) {
                // Redirect to the login page after successful logout (the server
                // should ask for the same thing)
                window.location.href = '/login.html';
            } else {
                console.error('Failed to log out:', await response.json());
            }
        } catch (error) {
            console.error('An error occurred while logging out:', error);
        }
    });
}

if (document.getElementById('loginForm') != undefined) {
    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from reloading the page
        // if there is a login form then there is a username input
        const username = document.getElementById('usernameInput').value;
    
        try {
            // We will manually do what <form> does
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
    
            if (response.ok) {
                // If login successful, redirect to lobby
                window.location.href = '/lobby.html';
            } else {
                // If login fails, show the error message
                const data = await response.json();
                // we assume an error message box text exists
                document.getElementById('errorMessage').textContent = `Error: ${data.message}`;
                document.getElementById('errorMessage').style.display = 'block';
            }
        } catch (error) {
            console.error('Error during login:', error);
            document.getElementById('errorMessage').textContent = 'An error occurred. Please try again later.';
            document.getElementById('errorMessage').style.display = 'block';
        }
    });
}

if (document.getElementById('signinForm') != undefined) {
    document.getElementById('signinForm').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from reloading the page
        // if there is a signin form then there is a username input
        const name = document.getElementById('nameInput').value;
        const username = document.getElementById('usernameInput').value;
    
        try {
            // We will manually do what <form> does
            const response = await fetch('/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username })
            });
    
            if (response.ok) {
                // If login successful, redirect to lobby
                window.location.href = '/lobby.html';
            } else {
                // If login fails, show the error message
                const data = await response.json();
                // we assume an error message box text exists
                document.getElementById('errorMessage').textContent = `Error: ${data.message}`;
                document.getElementById('errorMessage').style.display = 'block';
            }
        } catch (error) {
            console.error('Error during signup:', error);
            document.getElementById('errorMessage').textContent = 'An error occurred. Please try again later.';
            document.getElementById('errorMessage').style.display = 'block';
        }
    });
}

// make sure we close the event source when we leave the page
window.addEventListener("beforeunload", (event) => {
    if (eventSource != null) {
        eventSource.close();
    }
});