import events from "./pubsub.js";

function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

function updateLocalStorage(name, data) {
    if (storageAvailable('localStorage')) {
        localStorage.setItem(name, JSON.stringify(data));
    }
}

function getLocalStorage(data) {
    if (storageAvailable('localStorage')) {
        if (localStorage.getItem(data)) {
            return JSON.parse(localStorage.getItem(data));
        }
    }
    return false;
}

events.subscribe('updateLocalStorage', (data) => { updateLocalStorage(data[0], data[1]) });

export default getLocalStorage;