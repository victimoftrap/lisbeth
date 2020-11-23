import { START_TRACKING, STOP_TRACKING } from './trackingTypes';
import { USER_EVENTS } from './userEventTypes';

const LISBETH_STATE = 'lisbeth-state';

const sendTrackingMessage = (type, event) => {
    port.postMessage({
        type: type,
        event: event
    });
};

const initContentListeners = () => {
    let mainPage = document.getElementsByClassName('b-page__body')[0];

    mainPage.addEventListener('mouseleave', (event) => {
        sendTrackingMessage(USER_EVENTS.MOUSE_LEAVE_EVENT, event);
    });
    mainPage.addEventListener('mouseenter', (event) => {
        sendTrackingMessage(USER_EVENTS.MOUSE_ENTER_EVENT, event);
    });
};

const disableContentListeners = () => {
    let mainPage = document.getElementsByClassName('b-page__body')[0];

    mainPage.removeEventListener('mouseleave', (event) => {
        sendTrackingMessage(USER_EVENTS.MOUSE_LEAVE_EVENT, event);
    });
    mainPage.removeEventListener('mouseenter', (event) => {
        sendTrackingMessage(USER_EVENTS.MOUSE_ENTER_EVENT, event);
    });
};

const checkAppState = () => {
    let lisbethState = localStorage.getItem(LISBETH_STATE);
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
    localStorage.setItem(LISBETH_STATE, START_TRACKING);
});

endContestButtons.addEventListener('click', event => {
    port.postMessage({
        type: STOP_TRACKING
    });
    localStorage.setItem(LISBETH_STATE, STOP_TRACKING);
});
