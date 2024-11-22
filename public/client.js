function update_answer() {
    const a = document.getElementById("a").value;
    const b = document.getElementById("b").value;

    const req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState != XMLHttpRequest.DONE)
            return;
        if (req.status != 200) {
            window.alert("ERROR: check the console");
            console.log(req);
            return;
        }

        // if I get here, all is OK

        let ans = document.getElementById("answer");
        ans.textContent = req.responseText;
    };

    let url = `/calculate/add/${a}/${b}`;
    req.open("GET", url);
    req.send();
}

const board = document.getElementById('board');
const status = document.getElementById('status');

async function fetchGameState() {
    const response = await fetch('/state');
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
    const response = await fetch('/move', {
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
    await fetch('/reset', { method: 'POST' });
    fetchGameState();
}

fetchGameState();