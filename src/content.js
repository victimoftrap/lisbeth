import { START_TRACKING, STOP_TRACKING, TRACKING_EVENT } from './actionTypes';

const location = window.location;

const startContestButtons = document.getElementsByClassName("button_theme_action");
const endContestButtons = document.getElementsByClassName("button_role_end");

if (location.origin === "https://contest.yandex.ru") {
    Array.from(startContestButtons).forEach(button => {
        button.addEventListener("click", event => {
            chrome.runtime.sendMessage(
                { type: START_TRACKING },
                response => {}
            )
        });
    });
    
    Array.from(endContestButtons).forEach(button => {
        button.addEventListener("click", event => {
            chrome.runtime.sendMessage(
                { type: STOP_TRACKING },
                response => {}
            )
        });
    });
}
