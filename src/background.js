import { START_TRACKING, STOP_TRACKING } from './trackingTypes';
import { USER_EVENTS } from './userEventTypes';
import { EXTENSION_API_URL } from './urls';

const storeEventMessage = (message) => {
    console.log(message);
};

const sendMessageToServer = (message) => {
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

const onCreatedTab = (tab) => {
    const eventRequest = {
        type: USER_EVENTS.TAB_EVENT,
        url: tab.url,
        title: tab.title,
        active: tab.active,
        incognito: tab.incognito,
    };
    storeEventMessage(eventRequest);
    sendMessageToServer(eventRequest);
};

const onUpdatedTab = (tabId, info, tab) => {
    if (tab.status === 'complete') {
        const eventRequest = {
            type: USER_EVENTS.TAB_EVENT,
            url: tab.url,
            title: tab.title,
            active: tab.active,
            incognito: tab.incognito,
        };
        storeEventMessage(eventRequest);
        sendMessageToServer(eventRequest);
    }
};

const onStartRecord = () => {
    chrome.tabs.onCreated.addListener(onCreatedTab);
    chrome.tabs.onUpdated.addListener(onUpdatedTab);
};

const onStopRecord = () => {
    chrome.tabs.onCreated.removeListener(onCreatedTab);
    chrome.tabs.onUpdated.removeListener(onUpdatedTab);
};

const handleMessage = (message) => {
    switch (message.type) {
        case START_TRACKING:
            onStartRecord();
            break;
        case STOP_TRACKING:
            onStopRecord();
            break;
        default:
            storeEventMessage(message);
            sendMessageToServer(message);
            break;
    }
};

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'lisbeth') {
        port.onMessage.addListener(handleMessage);
    }
});
