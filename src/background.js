import { START_TRACKING, STOP_TRACKING } from './trackingTypes';
import { USER_EVENTS } from './userEventTypes';
import { EXTENSION_API_URL } from './urls';

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

    fetch(EXTENSION_API_URL, request)
    .then(response => response.json())
    .then(jsonResponse => console.log(JSON.stringify(jsonResponse)))
};

const tabMessageBuilder = (tab) => {
    return {
        url: tab.url,
        title: tab.title,
        active: tab.active,
        incognito: tab.incognito,
    };
};

const onCreatedTab = (tab) => {
    const eventRequest = {
        contestId: YANDEX_CONTEST_ID,
        userId: YANDEX_USER_ID,
        createdAt: currentDatetime(),
        type: USER_EVENTS.TAB_EVENT,
        event: tabMessageBuilder(tab),
    };
    logEventMessage(eventRequest);
    sendEventMessageToServer(eventRequest);
};

const onUpdatedTab = (tabId, info, tab) => {
    if (tab.status === 'complete') {
        const eventRequest = {
            contestId: YANDEX_CONTEST_ID,
            userId: YANDEX_USER_ID,
            createdAt: currentDatetime(),
            type: USER_EVENTS.TAB_EVENT,
            event: tabMessageBuilder(tab),
        };
        logEventMessage(eventRequest);
        sendEventMessageToServer(eventRequest);
    }
};

let YANDEX_CONTEST_ID = '';
let YANDEX_USER_ID = '';

const onStartRecord = (initData) => {
    chrome.tabs.onCreated.addListener(onCreatedTab);
    chrome.tabs.onUpdated.addListener(onUpdatedTab);

    YANDEX_CONTEST_ID = initData.contestId;
    YANDEX_USER_ID = initData.userId;
};

const onStopRecord = () => {
    chrome.tabs.onCreated.removeListener(onCreatedTab);
    chrome.tabs.onUpdated.removeListener(onUpdatedTab);
};

const handleMessage = (message) => {
    switch (message.type) {
        case START_TRACKING:
            onStartRecord(message.init);
            break;
        case STOP_TRACKING:
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
