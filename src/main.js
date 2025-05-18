const book = [];
const RENDER_EVENT = 'render-event';
const SAVED_BOOK = 'saved-book';
const BOOK_KEY = 'book-shelf';

function cekStorage() {
    if (typeof (Storage) === undefined) {
        alert('Browser tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadData() {
    const bookData = localStorage.getItem(BOOK_KEY);
    let data = JSON.parse(bookData);

    if (data !== null) {
        for (const list of data) {
            list.year = Number(list.year); // Pastikan year tetap sebagai number
            book.push(list);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}


function saveData() {
    if (cekStorage()) {
        const convertData = JSON.stringify(book);
        localStorage.setItem(BOOK_KEY, convertData);
        document.dispatchEvent(new Event(SAVED_BOOK));
    }
}

document.addEventListener(SAVED_BOOK, () => {
    console.log(localStorage.getItem(BOOK_KEY));
});

function bookPush (id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year: Number(year),
        isComplete
    }
}

function uniqueId() {
    return +new Date();
}

function addBook() {
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = parseInt(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const id = uniqueId();
    const bookObject = bookPush(id, title, author, year, isComplete);
    book.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener(RENDER_EVENT, () => {
    const unCompleted = document.getElementById('incompleteBookList');
    unCompleted.innerHTML = '';

    const completed = document.getElementById('completeBookList');
    completed.innerHTML = '';

    for (const bookSpesification of book) {
        const bookElement = makeList(bookSpesification);
        if (!bookSpesification.isComplete) {
            unCompleted.append(bookElement);
        } else {
            completed.append(bookElement);
        }
    }
});

function makeList(spesification) {
    const bookItem = document.createElement('div');
    bookItem.setAttribute('data-bookid', spesification.id);
    bookItem.setAttribute('data-testid', 'bookItem');
    bookItem.setAttribute("class", "listBook")

    bookItem.innerHTML = `
        <h3 data-testid="bookItemTitle" class="out-judul">${spesification.title}</h3>
          <p data-testid="bookItemAuthor" class="out-author">Penulis: ${spesification.author}</p>
          <p data-testid="bookItemYear" class="out-year">Tahun: ${spesification.year}</p>
          <div class="button">
              <button data-testid="bookItemIsCompleteButton" class="buttonIsComplete">
                  ${spesification.isComplete ? "Belum selesai dibaca" : "Selesai dibaca"}
              </button>
              <button data-testid="bookItemDeleteButton" class="buttonRemove">Hapus Buku</button>
              <button data-testid="bookItemEditButton" class="buttonEdit">Edit Buku</button>
              </div>
              `
              
              if (spesification.isComplete) {
        bookItem.querySelector("[data-testid='bookItemIsCompleteButton']").addEventListener('click', () => {
            addListToUncomplete(spesification.id);
        });
    } else {
        bookItem.querySelector("[data-testid='bookItemIsCompleteButton']").addEventListener('click', () => {
            addListToComplete(spesification.id);
        });
    }

    bookItem.querySelector("[data-testid='bookItemDeleteButton']").addEventListener("click", () => {
        removeList(spesification.id);
    });

    bookItem.querySelector("[data-testid='bookItemEditButton']").addEventListener("click", () => {
        editBook(spesification.id);
    });

    return bookItem;
}

function findList(id) {
    for (const element of book) {
        if (element.id === id) {
            return element;
        }
    } 
    return null;
}


function findIndexList(id) {
    for (const index in book) {
        if (book[index].id === id) {
            return index;
        }
    } 
    return -1;
}

function searchBook() {
    const searchInput = document.getElementById("searchBookTitle").value.toLowerCase();

    const unCompleted = document.getElementById('incompleteBookList');
    const completed = document.getElementById('completeBookList');

    unCompleted.innerHTML = '';
    completed.innerHTML = '';

    const searchResults = book.filter(bookItem =>
        bookItem.title.toLowerCase().includes(searchInput)
    );
    
    if (searchResults.length === 0) {
        const noResult = document.createElement('h2');
        noResult.innerText = "Buku tidak ditemukan!";
        noResult.style.textAlign = "center";
        noResult.style.fontWeight = "bold";
        unCompleted.append(noResult);
        completed.append(noResult);
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
    if (searchResults.length === 0) {
        const noResult = document.createElement('h2');
        noResult.innerText = "Buku tidak ditemukan!";
        noResult.style.textAlign = "center";
        noResult.style.fontWeight = "bold";
        unCompleted.append(noResult);
    }

    for (const bookSpesification of searchResults) {
        const bookElement = makeList(bookSpesification);
        if (!bookSpesification.isComplete) {
            unCompleted.append(bookElement);
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            completed.append(bookElement);
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    }
}

function editBook(id) {
    const bookTarget = findList(id);
    if (!bookTarget) return;

    document.getElementById("bookFormTitle").value = bookTarget.title;
    document.getElementById("bookFormAuthor").value = bookTarget.author;
    document.getElementById("bookFormYear").value = bookTarget.year;
    document.getElementById("bookFormIsComplete").checked = bookTarget.isComplete;

    const titleForm = document.getElementById('title-form').innerText = 'Mode Edit Buku';

    const submitButton = document.getElementById("bookFormSubmit");
    submitButton.innerText = "Update";

    const newForm = document.getElementById("bookForm");
    newForm.replaceWith(newForm.cloneNode(true));

    document.getElementById("bookForm").addEventListener("submit", (event) => {
        event.preventDefault();
        updateBook(id);
    });
}

function updateBook(id) {
    const bookTarget = findList(id);
    if (!bookTarget) return;

    bookTarget.title = document.getElementById("bookFormTitle").value;
    bookTarget.author = document.getElementById("bookFormAuthor").value;
    bookTarget.year = document.getElementById("bookFormYear").value;
    bookTarget.isComplete = document.getElementById("bookFormIsComplete").checked;
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    location.reload();
}

function addListToComplete(id) {
    const target = findList(id);

    if (target == null) {
        return;
    }

    target.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addListToUncomplete(id) {
    const target = findList(id);

    if (target == null) {
        return;
    }

    target.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeList(id) {
    const target = findIndexList(id);

    if (target === -1) {
        return;
    }

    book.splice(target, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.getElementById("searchSubmit").addEventListener("click", (e) => {
    e.preventDefault()
    searchBook();
});


document.addEventListener('DOMContentLoaded', () => {
    const submit = document.getElementById('bookForm');
    submit.addEventListener('submit', () => {
        addBook();
    });
    if (cekStorage()) {
        loadData();
    }
});


