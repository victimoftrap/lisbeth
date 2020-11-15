import { START_TRACKING, STOP_TRACKING, TRACKING_EVENT } from './actionTypes';

const location = window.location;

const startContestButtons = document.getElementsByClassName("button_theme_action")[0];
const endContestButtons = document.getElementsByClassName("button_role_end")[0];ы

let port = chrome.runtime.connect({ name: 'lisbeth' });

if (location.origin === "https://contest.yandex.ru") {
    startContestButtons.addEventListener("click", event => {
        port.postMessage({
            type: START_TRACKING 
        });
    });
    
    endContestButtons.addEventListener("click", event => {
        port.postMessage({
            type: STOP_TRACKING
        })
    });
}
