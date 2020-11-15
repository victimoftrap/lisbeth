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
    if (request.action === "start") {
        alert(request.action);
        onStartRecord();
    }
    if (request.action === "stop") {
        alert(request.action);
        onStopRecord();
    }
});
