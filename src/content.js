import { START_TRACKING, STOP_TRACKING, TRACKING_EVENT } from './actionTypes';

const sendTrackingEvent = (event) => {
    port.postMessage({
        type: TRACKING_EVENT,
        event: event
    });
};

const initContentListeners = () => {
    let mainPage = document.getElementsByClassName('page__main')[0];

    mainPage.addEventListener('mouseleave', sendTrackingEvent);
    mainPage.addEventListener('mouseenter', sendTrackingEvent);

    console.log(mainPage);
};

const disableContentListeners = () => {
    let mainPage = document.getElementsByClassName('page__main')[0];

    mainPage.removeEventListener('mouseleave', sendTrackingEvent);
    mainPage.removeEventListener('mouseenter', sendTrackingEvent);

    console.log(mainPage);
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
