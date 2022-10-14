const availableTurns = ['X', 'O']

function clickTile(elRef, turn) {
    const [x, y] = elRef.id.toString().split(',');

    const req = `/place/${x}/${y}/${availableTurns[turn]}`;
    console.log(req);

    fetch(req, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: "",
    }).then(() => location.reload());
}