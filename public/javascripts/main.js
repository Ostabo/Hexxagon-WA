const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

function init() {
    const theme = localStorage.getItem("theme");
    if ((theme === "dark") || (theme === null && prefersDarkScheme.matches)) {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
        document.getElementById("toggle").checked = true;
        document.getElementById("toggle-container").title = "Dark";
    } else {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
        document.getElementById("toggle").checked = false;
        document.getElementById("toggle-container").title = "Light";
    }
}

function toggleTheme() {
    document.documentElement.classList.toggle('dark-theme');
    document.documentElement.classList.toggle('light-theme');
    if (document.documentElement.classList.contains('dark-theme')) {
        document.getElementById("toggle-container").title = "Dark";
        localStorage.setItem("theme", "dark");
    } else {
        document.getElementById("toggle-container").title = "Light";
        localStorage.setItem("theme", "light");
    }
}

const availableTurns = ['X', 'O']

function clickTile(elRef, turn) {
    const [x, y] = elRef.id.toString().split(',');

    const req = `/place/${x}/${y}/${availableTurns[turn]}`;

    fetch(req, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: "",
    }).then(() => location.reload());
}

function doAction(action) {
    fetch(action, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: "",
    }).then(() => location.reload());
}

function removeCard() {
    const card = document.getElementById('game-over');
    card.style.display = 'none';
}