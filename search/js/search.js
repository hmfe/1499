
const historyObj = {
    items: new Map(),
    add: function(item) { this.items.set(this.items.size, { title: item, dateTime: new Date()}); makeHistoryUl(this.items.entries()); },
    delete: function(id) {this.items.delete(id - 1); makeHistoryUl(this.items.entries()); console.log('deleting id : ' + id);},
    get: function() { return this.items.entries() },
    show: function () { console.log(this.items);},
    clear: function () { this.items = new Map(); makeHistoryUl(this.items.entries());}
};

const historyList = Object.create(historyObj);
const historyListUl = document.getElementById('history-list-ul');
let searchString = '';
let timeOutId = 0;

// Hide the drop down list if a free area is click on the page
document.addEventListener('click', e => {
    e.preventDefault();
    const dd = document.getElementById('dd-list');

    if (e.target.matches('.dd-list-item')) {
        const ddHeaderTitle = document.getElementById('dd-header-title');
        ddHeaderTitle.value = e.target.innerHTML;
        historyList.add(e.target.innerHTML);
        dd.style.display = 'none';
    } else if (e.target.id === 'dd-header-title') {
        dd.style.display = 'block';
    } else {
        dd.style.display = 'none';
    }
});

// Clear the search input box
const clearSearchInput = document.getElementById('clearSearchInput');
clearSearchInput.addEventListener('click', () => {
    const ddHeaderTitle = document.getElementById('dd-header-title');
    ddHeaderTitle.value = '';
});


// Search the api end point as you time with some delay to avoid extra calls to server
const ddHeaderTitle = document.getElementById('dd-header-title');
ddHeaderTitle.addEventListener('keyup', e => {
    // IF ENTER
    if (e.keyCode === 13) {
        console.log('You pressed enter');
        const dd = document.getElementById('dd-list');
        dd.style.display = 'none';
        historyList.add(e.target.value);
    } else {
        searchString = e.target.value;
        if (searchString.length > 2) {
            clearTimeout(timeOutId);
            timeOutId = setTimeout(() => {
                search(searchString);
            }, 600);
        }
    }
    console.log(searchString);
});

// The search function that makes the ajax call
function search(searchString) {
    const ajaxRequest = new XMLHttpRequest();
    let url = "https://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + searchString + "&api-key=7yAzoPV0e7uQVtuKXJdFw6Jcth8AmGjh";
        url = "https://restcountries.eu/rest/v2/name/" + searchString;
    let abstracts = [];

    ajaxRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const results = JSON.parse(this.responseText);
            if (results) {
                console.log('OK', results);
                results.forEach( country => {
                    abstracts.push(country.name);
                });
            }

            makeAutoComplete(abstracts.slice(0, 5));
        }
    };
    ajaxRequest.open("GET", url, true);
    ajaxRequest.send();
}

// Dynamically create li list for drop down - autocomplete
function makeAutoComplete(abstracts) {
    const ul = document.getElementById('dd-list');
    ul.innerHTML = '';
    abstracts.forEach(abstract => {
        const li = document.createElement('li');
        li.innerText = abstract;
        li.className = 'dd-list-item';
        console.log(li);
        ul.append(li);
    });
}

function makeHistoryUl(historyData) {
    historyListUl.innerHTML= '';
    for( let [index, item] of historyData)  {
        const li = document.createElement('li');
        li.innerText = item.title;
        const span = document.createElement('span');
        span.className='date-time';
        span.innerText= moment(item.dateTime).format('YYYY-MM-DD h:mm a');
        const i = document.createElement('i');
        i.className = "fas fa-times delete";
        i.id = index + 1;
        i.onclick = function() { historyList.delete(i.id)}
        span.append(i);
        li.append(span);
        historyListUl.append(li);
    }
}




