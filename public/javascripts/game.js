function clickTile(elRef, turn) {
    const availableTurns = ['X', 'O']
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
    })

    if (res.ok)
        updateGame(await (await res).text())
    else
        triggerToast(await (await res).text())
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
    let parser = new DOMParser();
    let xml = parser.parseFromString(text, "text/xml");

    // update the page
    updateStatus(c1, c2, t, xml)
    updateField(tiles, xml);

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

function updateStatus(counter1, counter2, statusturn, xml) {
    // get counters and turn from the response
    let xcount = xml.getElementsByTagName("xcount")[0].childNodes[0].nodeValue;
    let ocount = xml.getElementsByTagName("ocount")[0].childNodes[0].nodeValue;
    let turn = xml.getElementsByTagName("turn")[0].childNodes[0].nodeValue;

    // update the page elements
    counter1[0].innerHTML = xcount;
    counter2[0].innerHTML = ocount;
    statusturn[0].innerHTML = turn;
}

function updateField(tiles, xml) {
    // get the field from the response
    for (let i = 0; i < tiles.length; i++) {
        const [c, r] = tiles[i].id.toString().split(',');
        let field = xml.getElementsByTagName('field');

        for (let k = 0; k < field[0].children.length; k++) {
            // update the page elements
            if (field[0].children[k].getAttribute('row') === r
                && field[0].children[k].getAttribute('col') === c) {
                if (field[0].children[k].innerHTML.includes('X')) {
                    tiles[i].innerHTML = '🔷';
                } else if (field[0].children[k].innerHTML.includes('O')) {
                    tiles[i].innerHTML = '🔴';
                } else {
                    tiles[i].innerHTML = '';
                }
            }
        }
    }
}