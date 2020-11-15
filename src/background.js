import { START_TRACKING, STOP_TRACKING, TRACKING_EVENT } from './actionTypes';

const storeCompletedTabs = (tabId, info, tab) => {
    if (tab.status === "complete") {
        console.log(tab);
    }
}

const onStartRecord = () => {
    chrome.tabs.onCreated.addListener(console.log);
    chrome.tabs.onUpdated.addListener(storeCompletedTabs);
}

const onStopRecord = () => {
    chrome.tabs.onCreated.removeListener(console.log);
    chrome.tabs.onUpdated.removeListener(storeCompletedTabs);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === START_TRACKING) {
        alert(request.type);
        onStartRecord();
    }
    if (request.type === STOP_TRACKING) {
        alert(request.type);
        onStopRecord();
    }
});
