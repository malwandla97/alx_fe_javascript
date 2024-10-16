["fetchQuotesFromServer"]
["await", "async"]
["method", "POST", "headers", "Content-Type"]
["syncQuotes"]
["Quotes synced with server!"]
let quotes = [];

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        quotes = [
            { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
            { text: "Life is what happens when you're busy making other plans.", category: "Life" },
            { text: "The purpose of our lives is to be happy.", category: "Happiness" },
        ];
    }
    populateCategories();
}

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    const categories = [...new Set(quotes.map(quote => quote.category))];

    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset options
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory');
    if (lastSelectedCategory) {
        categoryFilter.value = lastSelectedCategory;
    }
}

function showRandomQuote() {
    const quoteDisplay = document.getElementById("quoteDisplay");
    const filteredQuotes = quotes.filter(quote => {
        const categoryFilter = document.getElementById("categoryFilter").value;
        return categoryFilter === "all" || quote.category === categoryFilter;
    });

    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available in this category.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    quoteDisplay.textContent = `"${randomQuote.text}" - ${randomQuote.category}`;
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

function addQuote() {
    const quoteText = document.getElementById("newQuoteText").value;
    const quoteCategory = document.getElementById("newQuoteCategory").value;

    if (quoteText && quoteCategory) {
        quotes.push({ text: quoteText, category: quoteCategory });
        saveQuotes();
        populateCategories();
        document.getElementById("newQuoteText").value = '';
        document.getElementById("newQuoteCategory").value = '';
        alert("Quote added!");
        syncWithServer();
    } else {
        alert("Please fill in both fields!");
    }
}

function exportQuotes() {
    const jsonStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
        syncWithServer();
    };
    fileReader.readAsText(event.target.files[0]);
}

function filterQuotes() {
    const categoryFilter = document.getElementById("categoryFilter").value;
    localStorage.setItem('lastSelectedCategory', categoryFilter);
    showRandomQuote();
}

function syncWithServer() {
    // Simulate server interaction
    fetch('https://jsonplaceholder.typicode.com/posts')
        .then(response => response.json())
        .then(serverQuotes => {
            handleServerData(serverQuotes);
        })
        .catch(error => {
            console.error('Error syncing with server:', error);
        });
}

function handleServerData(serverQuotes) {
    // Simple conflict resolution
    const existingQuotes = new Set(quotes.map(q => q.text));
    serverQuotes.forEach(serverQuote => {
        if (!existingQuotes.has(serverQuote.title)) {
            quotes.push({ text: serverQuote.title, category: "Imported" });
        }
    });
    saveQuotes();
    alert("Data synced with server!");
    populateCategories();
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportQuotes").addEventListener("click", exportQuotes);
loadQuotes();

// Sync with server every 30 seconds
setInterval(syncWithServer, 30000);
