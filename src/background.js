import { START_TRACKING, STOP_TRACKING, TRACKING_EVENT } from './actionTypes';

const storeCompletedTabs = (tabId, info, tab) => {
    if (tab.status === "complete") {
        console.log(tab);
    }
};

const onStartRecord = () => {
    chrome.tabs.onCreated.addListener(console.log);
    chrome.tabs.onUpdated.addListener(storeCompletedTabs);
};

const onStopRecord = () => {
    chrome.tabs.onCreated.removeListener(console.log);
    chrome.tabs.onUpdated.removeListener(storeCompletedTabs);
};

const handleMessage = (message) => {
    alert(message.type);
    switch (message.type) {
        case START_TRACKING:
            onStartRecord();
            break;
        case STOP_TRACKING:
            onStopRecord();
            break;
    }
};

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'lisbeth') {
        port.onMessage.addListener(handleMessage);
    }
});
