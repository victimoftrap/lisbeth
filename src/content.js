document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("start-record")
        .addEventListener("click", event => {
            chrome.runtime.sendMessage(
                { action: "start" },
                () => {}
            )
        });

    document.getElementById("stop-record")
        .addEventListener("click", event => {
            chrome.runtime.sendMessage(
                { action: "stop" },
                () => {}
            )
        });
});
