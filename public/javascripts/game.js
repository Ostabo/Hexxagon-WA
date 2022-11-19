function clickTile(elRef, turn) {
    const availableTurns = ['X', 'O'];
    const [x, y] = elRef.id.toString().split(',');
    const req = `/place/${x}/${y}/${availableTurns[turn - 1]}`;

    doAction(req);
}

async function doAction(action) {
    const res = await fetch(action, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: "",
    });

    if (res.ok)
        updateGame(await (await res).text());
    else
        triggerToast(await (await res).text());
}

function triggerToast(msg) {
    $('#toast-msg').text(msg);

    const toast = new bootstrap.Toast($('#liveToast'));

    toast.show();
}

function updateGame(text) {
    // get all elements from the page
    const tiles = document.getElementsByClassName("hex");
    const c1 = $('#c1');
    const c2 = $('#c2');
    const t = $('#turn');

    // parse the response
    let json = JSON.parse(text);

    // update the page
    updateStatus(c1, c2, t, json);
    updateField(tiles, json);

    const counter1 = c1.text();
    const counter2 = c2.text();
    const status = document.getElementById('status');
    if (parseInt(counter1) + parseInt(counter2) === tiles.length) {
        const content = $('#game-over-content');

        if (counter1 > counter2)
            content.text('Player 1 🔷 wins!');
        else if (counter2 > counter1)
            content.text('Player 2 🔴 wins!');
        else
            content.text('It\'s a draw! ⚪');

        $('#gameOverModal').modal('show');

        status.childNodes[0].nodeValue = 'GAME';
        status.childNodes[1].childNodes[0].nodeValue = ' ';
        status.childNodes[2].nodeValue = 'OVER';
    } else if (status.childNodes[0].nodeValue === 'GAME') {
        status.childNodes[0].nodeValue = 'Player ';
        status.childNodes[2].nodeValue = ' \'s turn';
    }
}

function updateStatus(counter1, counter2, statusturn, json) {
    // get counters and turn from the response
    let xcount = json.xcount;
    let ocount = json.ocount;
    let turn = json.turn;

    // update the page elements
    counter1[0].innerHTML = xcount;
    counter2[0].innerHTML = ocount;
    statusturn[0].innerHTML = turn;
}

function updateField(tiles, json) {
    // get the field from the response
    for (let i = 0; i < tiles.length; i++) {
        const [c, r] = tiles[i].id.toString().split(',');
        let field = json.field.field;
        let cells = field.cells;

        for (let k = 0; k < cells.length; k++) {
            // update the page elements
            if (cells[k].row === parseInt(r) && cells[k].col === parseInt(c)) {
                if (cells[k].cell === 'X')
                    tiles[i].innerHTML = '🔷';
                else if (cells[k].cell === 'O')
                    tiles[i].innerHTML = '🔴';
                else
                    tiles[i].innerHTML = '';
            }
        }
    }
}