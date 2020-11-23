import { START_TRACKING, STOP_TRACKING, TAB_EVENT } from './actionTypes';

const storeEventMessage = (message) => {
    console.log(message);
};

const onCreatedTab = (tab) => {
    storeEventMessage({
        type: TAB_EVENT,
        url: tab.url,
        title: tab.title,
        active: tab.active,
        incognito: tab.incognito,
    })
};

const onUpdatedTab = (tabId, info, tab) => {
    if (tab.status === 'complete') {
        storeEventMessage({
            type: TAB_EVENT,
            url: tab.url,
            title: tab.title,
            active: tab.active,
            incognito: tab.incognito,
        });
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
            break;
    }
};

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'lisbeth') {
        port.onMessage.addListener(handleMessage);
    }
});
