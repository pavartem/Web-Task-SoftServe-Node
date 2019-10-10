const title = document.getElementById('title');
const text = document.getElementById('text');


const checkTitle = () => {
    if (title.value.length < 6) {
        title.classList.add('is-invalid');
    } else {
        title.classList.remove('is-invalid');
    }
};

const checkText = () => {
    if (text.value.length < 10) {
        text.classList.add('is-invalid');
    } else {
        text.classList.remove('is-invalid');
    }
};
let output = document.getElementById('img');
const openFile = (event) => {
    let input = event.target;

    let reader = new FileReader();
    reader.onload = function () {
        let dataURL = reader.result;
        output.src = dataURL;
    };
    reader.readAsDataURL(input.files[0]);
};


const isOnline = () => {
    return window.navigator.onLine;
};


const error = () => {
    alert.innerHTML = 'Error';
    container.appendChild(alert);
};

const validateInput = () => {
    if (title.value.length > 6 && text.value.length > 10) {
        if (title.value.trim() !== '' && text.value.trim() !== '') {
            return true;
        }

    }
    return false;
};

let articles = JSON.parse(localStorage.getItem('articles')) || [];


//IndexedDB

const useLocalStorage = false;

function sleep(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
}

class DefaultStorage {
    isReady = false;

    constructor(name) {
        this.name = name;
    }

    async add() {
    };
}

class NewsDefaultStorage extends DefaultStorage {
    isReady = false;

    constructor(name) {
        super(name);

        const request = window.indexedDB.open('NEWS', 1);
        request.onupgradeneeded = (event) => {
            this.db = event.target.result;
            if (!this.db.objectStoreNames.contains(this.name)) {
                this.db.createObjectStore(this.name, {
                    keyPath: 'id',
                    autoIncrement: true
                });
            }
        };
        request.onerror = () => {
            console.warn('ERROR');
        };
        request.onsuccess = (event) => {
            this.isReady = true;
            this.db = event.target.result;
        };
    }

    async add(data) {
        while (!this.isReady) {
            await sleep(50);
        }

        const transaction = this.db.transaction([this.name], 'readwrite');
        transaction.objectStore(this.name).add(data);
    }

}

const news = new NewsDefaultStorage('news');


const success = () => {
    if (isOnline()) {
        fetch('http://localhost:8000/news/add', {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({image: output.src, title: title.value, text: text.value})
        }).then(res=>res.json())
            .then(res => console.log(res));
    } else {
        const article = {image: output.src, title: title.value, text: text.value};
        if (useLocalStorage) {

            articles.push(article);
            localStorage.setItem('articles', JSON.stringify(articles));
        } else {
            news.add(article);
        }
    }
    alert.innerHTML = 'Added';
    container.appendChild(alert);

};

const createArticle = () => {
    checkTitle();
    checkText();
    success();
};

const button = document.getElementById('submit');
const container = document.getElementById('container');
const alert = document.createElement('p');
button.onclick = () => createArticle();

const clear = document.getElementById('clear');
clear.onclick = () => localStorage.removeItem('articles');


const clearDB = document.getElementById('clearDB');
clearDB.onclick = () => {
    fetch('http://localhost:8000/news', {method: 'delete'})
        .then(res => res.json())
        .then(res => console.log(res));
};

