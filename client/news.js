

const news = JSON.parse(localStorage.getItem('articles')) || [];
console.log(news);

const checkOnline = () => {
    if (window.navigator.onLine) {
        return true;
    }
    return false;
}

const createArticle = (item) => {
    const posts = document.getElementById('posts');
    const post = `<div class="col-md-3 mt-3">
                    <div class="card">
                        <img src="${item.image}" class="card-img-top img-fluid" alt="...">
                        <div class="card-body">
                            <h5 class="card-title text-center">${item.title}</h5>
                            <p class="card-text">${item.text}</p>
                        </div>
                    </div>
                </div>`;
    posts.insertAdjacentHTML('beforeEnd', post);
}

const useLocalStorage = false;

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
}

//IndexedDB
class NewsDefaultStorage extends DefaultStorage {
    isReady = false;

    constructor(name) {
        super(name)

        const request = window.indexedDB.open('NEWS', 1);
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
}

const newsIndex = new NewsDefaultStorage('news');


if (checkOnline()) {
    fetch('http://localhost:8000/news')
        .then(res=> res.json())
        .then(res => res.map((item) => createArticle(item)));
    if (useLocalStorage) {
        news.map((item) => createArticle(item));
    } else {
        window.onload = async function () {
            let newsList = await newsIndex.getAll();

            newsList.map((item) => createArticle(item));
        }
    }
}
