const location = window.location;

const startContestButtons = document.getElementsByClassName("button_theme_action");
const endContestButtons = document.getElementsByClassName("button_role_end");

if (location.origin === "https://contest.yandex.ru") {
    Array.from(startContestButtons).forEach(button => {
        button.addEventListener("click", event => {
            chrome.runtime.sendMessage(
                { action: "start" },
                response => {}
            )
        });
    });
    
    Array.from(endContestButtons).forEach(button => {
        button.addEventListener("click", event => {
            chrome.runtime.sendMessage(
                { action: "stop" },
                response => {}
            )
        });
    });
}

