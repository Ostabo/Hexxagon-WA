async function clickTile(elRef, turn) {
    const availableTurns = ['X', 'O']
    const [x, y] = elRef.id.toString().split(',');
    const req = `/place/${x}/${y}/${availableTurns[turn-1]}`;

    await doAction(req);
}

async function doAction(action) {
    await fetch(action, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: "",
    })

    let response = await fetch('/field', {
        method: 'GET'
    })
    response.text().then(text => updateGame(text));
}

function updateGame(text) {
    // get all elements from the page
    const tiles = document.getElementsByClassName("hex");
    const c1 = document.getElementsByClassName('counter-value c1');
    const c2 = document.getElementsByClassName('counter-value c2');
    const t = document.getElementsByClassName('turn');

    // parse the response
    let parser = new DOMParser();
    let xml = parser.parseFromString(text, "text/xml");

    // update the page
    updateStatus(c1, c2, t, xml)
    updateField(tiles, xml);

    // check if the game is over
    if (parseInt(c1[0].innerHTML) + parseInt(c2[0].innerHTML) === 54) {
        console.log('game over');
        const card = document.getElementById('game-over');
        const content = document.getElementById('game-over-content');
        const counter1 = document.getElementsByClassName('counter c1')[0].innerText;
        const counter2 = document.getElementsByClassName('counter c2')[0].innerText;

        if (counter1 > counter2)
            content.innerHTML = 'Player 1 🔷 wins!';
        else if (counter2 > counter1)
            content.innerHTML = 'Player 2 🔶 wins!';
        else
            content.innerHTML = 'It\'s a draw! ⚪';

        card.style.display = 'block';
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