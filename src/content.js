import { START_TRACKING, STOP_TRACKING } from './trackingTypes';
import { USER_EVENTS } from './userEventTypes';

import getCookie from './cookie';
import { currentDatetime } from './utils'

const LISBETH_STATE = 'lisbeth-state';

const YANDEX_CONTEST_ID = parseInt(window.location.pathname.match(new RegExp('(contest\/)([0-9]+)'))[2]);
const YANDEX_USER_ID = parseInt(getCookie('yandexuid'));

const sendTrackingMessage = (type, event) => {
    port.postMessage({
        contestId: YANDEX_CONTEST_ID,
        userId: YANDEX_USER_ID,
        createdAt: currentDatetime(),
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

    const problemsTabsUl = document.getElementsByClassName('tabs-menu_role_problems')[0];
    const liTabsList = problemsTabsUl.getElementsByTagName('li');
    for (const problemTab of liTabsList) {
        problemTab.addEventListener('click', (event) => {
            const problemTitle = document.getElementsByClassName('title')[0];
            sendTrackingMessage(USER_EVENTS.PROBLEM_CHANGED_EVENT, {
                prevProblemTitle: problemTitle.innerText,
                prevProblemUrl: window.location.pathname,
            });
        });
    }

    const problemsNavBar = document.getElementsByClassName('problem__problems-nav')[0];
    const navBarLinksList = problemsNavBar.getElementsByTagName('a');
    for (const problemLink of navBarLinksList) {
        problemLink.addEventListener('click', (event) => {
            const problemTitle = document.getElementsByClassName('title')[0];
            sendTrackingMessage(USER_EVENTS.PROBLEM_CHANGED_EVENT, {
                prevProblemTitle: problemTitle.innerText,
                prevProblemUrl: window.location.pathname,
            });
        });
    }

    const sentProblemButton = document.getElementsByClassName('button_role_submit')[0];
    sentProblemButton.addEventListener('click', (event) => {
        const problemTitle = document.getElementsByClassName('title')[0];
        sendTrackingMessage(USER_EVENTS.PROBLEM_SENT_EVENT, {
            title: problemTitle.innerText,
        });
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

// button that submits new solution also has 'button_theme_action' class
if (startContestButtons !== undefined && !startContestButtons.classList.contains('button_role_submit')) {
    startContestButtons.addEventListener('click', event => {
        port.postMessage({
            type: START_TRACKING,
            init: {
                contestId: YANDEX_CONTEST_ID,
                userId: YANDEX_USER_ID,
            } 
        });
        localStorage.setItem(LISBETH_STATE, START_TRACKING);
    });
}

endContestButtons.addEventListener('click', event => {
    port.postMessage({
        type: STOP_TRACKING
    });
    localStorage.setItem(LISBETH_STATE, STOP_TRACKING);
});
