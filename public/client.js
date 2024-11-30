
const board = document.getElementById('board');
const status = document.getElementById('status');
selectedGame = "Game1"
updateAvailableGames();

// Periodically poll server
// TODO this is only temporary. It's better to have the server somehow
// send an event to the client instead of periodically asking.
// setInterval(() => {
//     // Only poll it the board and status exist
//     if (board != null && status != null){
//         onGameStateUpdate();
//     }
// }, 1000);

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
        if (cell) div.classList.add('taken');
        div.textContent = cell || '';
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

async function onGameStateUpdate(){
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
        
    } else {
        console.log("No game selected.");
    }
}

if (board != null && status != null){
    fetchGameState();
}

// Just slap this on for now
// TODO integrate this properly
const eventSource = new EventSource('/game/events');

eventSource.onmessage = (event) => {
    console.log('Update received:', event.data);
    fetchGameState(); // Update the UI
};

eventSource.onerror = (error) => {
    console.error('SSE error:', error);
};