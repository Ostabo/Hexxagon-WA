let noerror = false;

$(document).ready(function () {
    initChat();
});

let previoustext = '';

function initChat() {
    $.ajax({
        type: 'get',
        url: '/chat',
        dataType: 'text',
        success: (response) => {
            if (response !== previoustext) {
                updateChat(response);
                previoustext = response;
            }
            noerror = true;
        },
        complete: () => {
            if (!self.noerror) {
                setTimeout(function () {
                    initChat();
                }, 5000);
            } else {
                initChat();
            }
            noerror = false;
        }
    });

}

async function sendChatMsg() {
    let msg = $('#chat-input').val();
    const res = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'text/plain'
        },
        body: msg,
    });
    const response = await res.text();
    if (response !== previoustext) {
        updateChat(response);
        previoustext = response;
    }
}

function updateChat(msg) {
    const timestamp = new Date().toLocaleTimeString();

    $('#chat-box').append(
        $('<div/>', {
            class: 'small p-2 border-top border-secondary d-inline-flex justify-content-between'
        }).append(
            $('<div/>', {
                class: 'text-left'
            }).text(msg)
        ).append(
            $('<div/>', {
                class: 'text-right text-muted'
            }).text(timestamp)
        )
    );
}