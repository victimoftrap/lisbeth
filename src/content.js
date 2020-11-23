import { START_TRACKING, STOP_TRACKING, TRACKING_EVENT } from './actionTypes';

const sendTrackingMessage = (type, event) => {
    port.postMessage({
        type: type,
        event: event
    });
};

const initContentListeners = () => {
    let mainPage = document.getElementsByClassName('page__main')[0];

    mainPage.addEventListener('mouseleave', (event) => {
        sendTrackingMessage('MouseLeave', event);
    });
    mainPage.addEventListener('mouseenter', (event) => {
        sendTrackingMessage('MouseEnter', event);
    });
};

const disableContentListeners = () => {
    let mainPage = document.getElementsByClassName('page__main')[0];

    mainPage.removeEventListener('mouseleave', (event) => {
        sendTrackingMessage('MouseLeave', event);
    });
    mainPage.removeEventListener('mouseenter', (event) => {
        sendTrackingMessage('MouseEnter', event);
    });
};

const checkAppState = () => {
    let lisbethState = localStorage.getItem('lisbeth-state');
    if (lisbethState === START_TRACKING) {
        initContentListeners();
    } else {
        disableContentListeners();
    }
};
checkAppState();

let port = chrome.runtime.connect({ name: 'lisbeth' });
const startContestButtons = document.getElementsByClassName('button_theme_action')[0];
const endContestButtons = document.getElementsByClassName('button_role_end')[0];

startContestButtons.addEventListener('click', event => {
    port.postMessage({
        type: START_TRACKING 
    });
    localStorage.setItem('lisbeth-state', START_TRACKING);
});

endContestButtons.addEventListener('click', event => {
    port.postMessage({
        type: STOP_TRACKING
    });
    localStorage.setItem('lisbeth-state', STOP_TRACKING);
});
