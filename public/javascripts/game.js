const statusOptions = {
    0: 'GAME OVER',
    1: 'Player 1\'s turn',
    2: 'Player 2\'s turn',
}

$(document).ready(function () {
    initWebSocket();
});

let socket;

function initWebSocket() {
    socket = new WebSocket('ws://' + location.host + '/ws');

    socket.onopen = () => console.log('WebSocket connection established.');

    socket.onmessage = function (event) {
        console.log(JSON.parse(event.data));
        updateGame(event.data);
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
}

async function clickTile(elRef) {
    const availableTurns = ['X', 'O'];
    const [x, y] = elRef.id.toString().split(',');
    const turn = $('#status').text().match('[12]');
    const req = `/place/${x}/${y}/${availableTurns[turn ? turn - 1 : 0]}`;

    await doAction(req);
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

function triggerToast(msg) {
    $('#toast-msg').text(msg);

    const toast = new bootstrap.Toast($('#liveToast'));

    toast.show();
}

function updateGame(text) {
    // get all elements from the page
    const tiles = document.getElementsByClassName("hex");
    const counter1 = $('#c1');
    const counter2 = $('#c2');
    const status = $('#status');

    // parse the response
    const json = JSON.parse(text);
    const fieldRes = FieldResponse.from(json);

    // update the page
    updateCounter(counter1, counter2, fieldRes);
    setStatus(status, fieldRes.turn);
    updateField(tiles, fieldRes);

    const c1 = fieldRes.xcount;
    const c2 = fieldRes.ocount;

    // Game over or new game
    if (c1 + c2 === tiles.length) {
        gameOver(status, c1, c2);
        setStatus(status, 0);
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

function setStatus(status, turn) {
    status.text(statusOptions[turn]);
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