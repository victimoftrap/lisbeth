import { APP_STATES } from './constants/appStates';
import { USER_EVENTS } from './constants/userEventTypes';
import { SAVE_EVENT_API_URL } from './urls';

import { currentDatetime } from './utils'

const logEventMessage = (message) => {
    console.log(message);
};

const sendEventMessageToServer = (message) => {
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message),
    };
    fetch(SAVE_EVENT_API_URL, request)
};

const onCreatedTab = (tab) => {
    const eventRequest = {
        contestId: YANDEX_CONTEST_ID,
        userId: YANDEX_USER_ID,
        userLogin: YANDEX_USER_LOGIN,
        createdAt: currentDatetime(),
        type: USER_EVENTS.TAB_EVENT,
        event: {
            url: tab.url,
            title: tab.title,
            active: tab.active,
            incognito: tab.incognito,
        }
    };
    logEventMessage(eventRequest);
    sendEventMessageToServer(eventRequest);
};

const onUpdatedTab = (tabId, info, tab) => {
    if (tab.status === 'complete') {
        onCreatedTab(tab);
    }
};

let YANDEX_CONTEST_ID = '';
let YANDEX_USER_ID = '';
let YANDEX_USER_LOGIN = '';

const onStartRecord = (initData) => {
    chrome.tabs.onCreated.addListener(onCreatedTab);
    chrome.tabs.onUpdated.addListener(onUpdatedTab);

    YANDEX_CONTEST_ID = initData.contestId;
    YANDEX_USER_ID = initData.userId;
    YANDEX_USER_LOGIN = initData.userLogin;
};

const onStopRecord = () => {
    chrome.tabs.onCreated.removeListener(onCreatedTab);
    chrome.tabs.onUpdated.removeListener(onUpdatedTab);
};

const handleMessage = (message) => {
    switch (message.type) {
        case APP_STATES.START_TRACKING:
            onStartRecord(message.init);
            break;
        case APP_STATES.STOP_TRACKING:
            onStopRecord();
            break;
        default:
            logEventMessage(message);
            sendEventMessageToServer(message);
            break;
    }
};

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'lisbeth') {
        port.onMessage.addListener(handleMessage);
    }
});
