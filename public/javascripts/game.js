$(document).ready(function () {
    initWebSocket();
});

let socket;
let playerNumber;
// get all elements from the page
const tiles = document.getElementsByClassName("hex");
const counter1 = $('#c1');
const counter2 = $('#c2');
const status = $('#status');
const statusText = [
    "GAME OVER",
    "Your turn",
    "Waiting for other player...",
    "Your are spectator"
];
const WS_PLAYER_REQUEST = 'Requesting player number';
const WS_PLAYER_RESPONSE = 'Player number: ';
const WS_KEEP_ALIVE_RESPONSE = 'Keep alive';
const WS_KEEP_ALIVE_REQUEST = 'ping';

function initWebSocket() {
    socket = new WebSocket('ws://' + location.host + '/ws');

    socket.onopen = function () {
        console.log('WebSocket connection established');
        socket.send(WS_PLAYER_REQUEST);
    };

    socket.onmessage = function (event) {
        let msg = event.data;

        if (msg.startsWith(WS_PLAYER_RESPONSE)) {
            playerNumber = msg.split(' ')[2];
            console.log(`${WS_PLAYER_RESPONSE} ${playerNumber}`);
            initStatus();
        } else if (msg === WS_KEEP_ALIVE_RESPONSE) {
            console.log('[ping] ' + msg);
        } else {
            const json = JSON.parse(msg);
            updateGame(FieldResponse.from(json));
        }
    };

    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            console.log('[close] Connection died');
        }
    };

    socket.onerror = function (error) {
        console.log(`[error] ${error.message}`);
    };

    setInterval(() => socket.send(WS_KEEP_ALIVE_REQUEST), 20000); // ping every 20 seconds
}

async function clickTile(element) {
    switch (playerNumber) {
        case '1':
        case '2':
            const availableTurns = ['X', 'O'];
            const [x, y] = element.id.toString().split(',');
            const req = `/place/${x}/${y}/${availableTurns[playerNumber - 1]}`;
            await doAction(req);
            break;
        default:
            triggerToast(statusText[3]);
    }
}

async function doAction(action) {
    const res = await fetch(action, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: '',
    });

    if (res.ok)
        socket.send(`Action done: ${action} -> Response: ${await res.text()}`);
    else
        triggerToast(await res.text());
}

function updateGame(fieldRes) {
    // update the page
    updateCounter(counter1, counter2, fieldRes);
    // only update status for playing users
    if (playerNumber === '1' || playerNumber === '2') {
        updateStatus(status, fieldRes.turn);
    }
    updateField(tiles, fieldRes);

    const c1 = fieldRes.xcount;
    const c2 = fieldRes.ocount;

    // Game over or new game
    if (c1 + c2 === tiles.length) {
        gameOver(status, c1, c2);
        updateStatus(status, 0);
    }

}

function gameOver(status, counter1, counter2) {
    const content = $('#game-over-content');

    if (counter1 > counter2)
        content.text('Player 1 🔷 wins!');
    else if (counter2 > counter1)
        content.text('Player 2 🔴 wins!');
    else
        content.text('It\'s a draw! ⚪');

    $('#gameOverModal').modal('show');
}

function initStatus() {
    switch (playerNumber) {
        case '1': // player 1 always starts
            status.text(statusText[1]);
            break;
        case '2': // player 2 has to wait
            status.text(statusText[2]);
            break;
        default: // not allowed to play
            status.text(statusText[3]);
            break;
    }
}

function updateStatus(status, turn) {
    switch (turn.toString()) {
        case '0': // game over
            status.text(statusText[0]);
            break;
        case playerNumber: // your turn
            status.text(statusText[1]);
            break;
        default: // other player's turn
            status.text(statusText[2]);
            break;
    }
}

function updateCounter(counter1, counter2, json) {
    // update the page elements
    counter1[0].innerHTML = json.xcount;
    counter2[0].innerHTML = json.ocount;
}

function updateField(tiles, json) {
    const cells = json.field.cells.map(cell => Cell.from(cell));

    // get the field from the response
    for (let i = 0; i < tiles.length; i++) {
        const [c, r] = tiles[i].id.toString().split(',');
        tiles[i].innerHTML = cells.find(cell => cell.row === parseInt(r) && cell.col === parseInt(c)).content;
    }
}

function triggerToast(msg) {
    $('#toast-msg').text(msg);
    const toast = new bootstrap.Toast($('#liveToast'));
    toast.show();
}