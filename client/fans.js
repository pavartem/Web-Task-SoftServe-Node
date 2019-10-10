const createAppealBlock = () => {
    const appealBlock = document.createElement('div');
    appealBlock.classList.add('comment', 'py-4', 'border-bottom');
    return appealBlock;
};

const createAppealText = (text) => {
    const childText = document.createElement('p');
    childText.innerHTML = text;
    return childText;
};

const createAppealDate = (date) => {
    const appealDate = document.createElement('span');
    appealDate.innerText = date;
    return appealDate;
};

const createAppealUser = (user) => {
    const appealAuthor = document.createElement('b');
    appealAuthor.innerText = user;
    appealAuthor.classList.add('float-right');
    return appealAuthor;

};

const combineAppealData = (appealBlock, text, date, user) => {
    appealBlock.appendChild(text);
    appealBlock.appendChild(date);
    appealBlock.appendChild(user);
    appeals.appendChild(appealBlock);
};

const getDate = () => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    today = dd + '.' + mm + '.' + yyyy;
    return today;
};


let useLocalStorage = false;

const isOnline = function () {
    return window.navigator.onLine;
};


let appealsStorage = JSON.parse(localStorage.getItem('appeals')) || [];

const button = document.getElementById('submit-btn');
const appeals = document.getElementById('appeals');
const textarea = document.getElementById('textarea');
const username = document.getElementById('username');
const alert = document.getElementById('alert');

const createAppealData = () => {
    if (isOnline()) {
        console.log('Call to server');
    } else {
        const appeal = {text: textarea.value, date: getDate(), user: username.value};
        appealsStorage.push(appeal);
        localStorage.setItem('appeals', JSON.stringify(appealsStorage));
    }
    if (validate()) {
        clearInputs();
    }
};

const createAppeal = (item) => {
    const appealBlock = createAppealBlock();
    const text = createAppealText(item.text);
    const date = createAppealDate(item.date);
    const user = createAppealUser(item.user);
    combineAppealData(appealBlock, text, date, user);
};

// new indexedDB

function sleep(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
}

class DefaultStorage {
    isReady = false;

    constructor(name) {
        this.name = name;
    }

    async getAll() {
    };

    async add() {
    };

    async clear() {
    };
}

//IndexedDB
class FansDefaultStorage extends DefaultStorage {
    isReady = false;

    constructor(name) {
        super(name)

        const request = window.indexedDB.open('FANS', 1);
        request.onupgradeneeded = (event) => {
            this.db = event.target.result;
            if (!this.db.objectStoreNames.contains(this.name)) {
                this.db.createObjectStore(this.name, {
                    keyPath: 'id',
                    autoIncrement: true
                });
            }
        }
        request.onerror = () => {
            console.warn('ERROR');
        };
        request.onsuccess = (event) => {
            this.isReady = true;
            this.db = event.target.result;
        };
    }

    async getAll() {
        while (!this.isReady) {
            await sleep(50);
        }
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([this.name], 'readwrite');
            let getData = transaction.objectStore(this.name).getAll();
            getData.onsuccess = (event) => {
                let data = getData.result;
                resolve(data);
            };
            getData.onerror = reject;
        });
    }

    async add(data) {
        while (!this.isReady) {
            await sleep(50);
        }

        const transaction = this.db.transaction([this.name], 'readwrite');
        transaction.objectStore(this.name).add(data);
    }

    async clear() {
        while (!this.isReady) {
            await sleep(50);
        }
        const transaction = this.db.transaction([this.name], 'readwrite');
        transaction.objectStore(this.name).clear();
    }
}

const fans = new FansDefaultStorage('fans');

// end new index db


button.onclick = () => {
    if (isOnline()) {
        fetch('http://localhost:8000/appeals/add', {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: username.value, text: textarea.value, date: getDate()})
        }).then(res => res.json())
            .then(res => createAppeal(res));

    } else {

        if (useLocalStorage) {
            createAppealData();
        } else {
            fans.add({user: username.value, text: textarea.value, date: getDate()});
        }
    }
};
const appealsData = JSON.parse(localStorage.getItem('appeals')) || [];

if (isOnline()) {
    fetch('http://localhost:8000/appeals')
        .then(res => res.json())
        .then(res => res.map((item) => createAppeal(item)));
    if (useLocalStorage) {
        appealsData.map((item) => createAppeal(item));
    } else {
        window.onload = async function () {
            let fansList = await fans.getAll();

            fansList.map((item) => createAppeal(item));
        }
    }
}


const clear = document.getElementById('clear');
clear.onclick = () => localStorage.removeItem('appeals');

const clearIndexed = document.getElementById('clearIndexed');
clearIndexed.onclick = () => fans.clear();

const clearDB = document.getElementById('clearDB');
clearDB.onclick = () => {
    fetch('http://localhost:8000/appeals', {method: 'delete'})
        .then(res => res.json())
        .then(res => console.log(res));
};