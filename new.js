// new.js

let legalData = []; // Array to hold JSON data
let searchHistory = [];

// Fetch data from JSON file
async function loadData() {
    try {
        const response = await fetch('structured_commercial_law_cases (2).json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        legalData = await response.json();
        console.log('Data loaded:', legalData); // For debugging
    } catch (error) {
        console.error('Error loading JSON data:', error);
        showNotification('Error loading data. Please try again later.', 'danger');
    }
}

// Display notification
function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    notification.className = `notification bg-${type}`;
    notification.textContent = message;
    notificationArea.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Display search results
function displayResults(results) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
        return;
    }

    results.forEach(item => {
        const card = `
            <div class="col-md-12 mb-3">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5>${item.Title}</h5>
                        <p>${item.Summary}</p>
                        <a href="${item.URL}" class="btn btn-primary" target="_blank">Read More</a>
                        <button class="btn btn-success btn-sm mt-2" onclick="saveToWorkFolder('${encodeURIComponent(JSON.stringify(item))}')">Save to Work Folder</button>
                    </div>
                </div>
            </div>
        `;
        resultsContainer.innerHTML += card;
    });
}

// Search Function with Filters
function searchData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    if (searchTerm === '') {
        displayResults([]);
        return;
    }

    // Save to history
    addToHistory(searchTerm);

    // Get advanced search filters
    const filterType = document.getElementById('filterType').value.toLowerCase();
    const filterYear = document.getElementById('filterYear').value;

    let filteredData = legalData.filter(item =>
        item.Title.toLowerCase().includes(searchTerm) ||
        item.Summary.toLowerCase().includes(searchTerm)
    );

    if (filterType) {
        filteredData = filteredData.filter(item => item.Type.toLowerCase() === filterType);
    }

    if (filterYear) {
        filteredData = filteredData.filter(item => item.Year === parseInt(filterYear));
    }

    displayResults(filteredData);
}

// Display definition result
function displayDefinition(definition, term) {
    const definitionResult = document.getElementById('definitionResult');
    definitionResult.innerHTML = `<p><strong>${term}:</strong> ${definition}</p>`;
}

// Search Definition Function
function searchDefinition() {
    const searchTerm = document.getElementById('definitionInput').value.toLowerCase().trim();
    if (searchTerm === '') {
        document.getElementById('definitionResult').innerHTML = '';
        return;
    }

    let found = false;

    // Search through all entities in all cases
    for (const item of legalData) {
        for (const [term, type] of Object.entries(item.Entities)) {
            if (term.toLowerCase().includes(searchTerm)) {
                displayDefinition(type, term);
                found = true;
                return; // Display first match
            }
        }
    }

    if (!found) {
        document.getElementById('definitionResult').innerHTML = '<p>No definition found.</p>';
    }
}

// Save to Work Folder Function
function saveToWorkFolder(encodedItem) {
    const item = JSON.parse(decodeURIComponent(encodedItem));
    const workFolder = document.getElementById('workFolder');

    // Check if already saved
    const existing = Array.from(workFolder.children).find(card => card.querySelector('h5').textContent === item.Title);
    if (existing) {
        showNotification('Item already in Work Folder.', 'warning');
        return;
    }

    const card = `
        <div class="col-md-12">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5>${item.Title}</h5>
                    <p>${item.Summary}</p>
                    <a href="${item.URL}" class="btn btn-primary" target="_blank">Read More</a>
                </div>
            </div>
        </div>
    `;

    workFolder.innerHTML += card;
    showNotification('Item saved to Work Folder!', 'success');
}

// Suggest Elements based on input
function suggestElements() {
    const input = document.getElementById('searchInput').value.toLowerCase().trim();
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';

    if (input.length < 2) {
        return;
    }

    const suggestions = legalData.filter(item =>
        item.Title.toLowerCase().includes(input) ||
        (item.Entities && Object.keys(item.Entities).some(term => term.toLowerCase().includes(input)))
    ).slice(0, 5); // Limit to 5 suggestions

    suggestions.forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action';
        li.textContent = item.Title;
        li.onclick = () => {
            document.getElementById('searchInput').value = item.Title;
            suggestionsList.innerHTML = '';
            searchData();
        };
        suggestionsList.appendChild(li);
    });
}

// Debounce function to limit the rate of suggestElements calls
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

// Event listener for suggestions with debounce
document.getElementById('searchInput').addEventListener('input', debounce(suggestElements, 300));

// Remember Filter by storing in localStorage
function applyAdvancedSearch() {
    // You can expand this function to store more advanced filters
    showNotification('Advanced filters applied.', 'info');
    searchData();
}

// Explore Content Functions
function exploreRandom() {
    if (legalData.length === 0) {
        showNotification('No data available to explore.', 'warning');
        return;
    }
    const randomItem = legalData[Math.floor(Math.random() * legalData.length)];
    displayResults([randomItem]);
    showNotification('Exploring a random case.', 'success');
}

function exploreTrending() {
    // Placeholder for trending logic. This can be replaced with actual trending data.
    const trendingData = legalData.slice(0, 5); // Assuming first 5 are trending
    displayResults(trendingData);
    showNotification('Exploring trending topics.', 'success');
}

// History Functions
function addToHistory(query) {
    if (searchHistory.includes(query)) return;
    searchHistory.unshift(query);
    if (searchHistory.length > 10) {
        searchHistory.pop();
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistory = history;
}

function toggleHistory() {
    loadHistory();
    const historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = '';

    if (searchHistory.length === 0) {
        historyContainer.innerHTML = '<p>No search history available.</p>';
    } else {
        searchHistory.forEach(query => {
            const div = document.createElement('div');
            div.className = 'history-item d-flex justify-content-between align-items-center';
            div.innerHTML = `
                <span>${query}</span>
                <button class="btn btn-sm btn-primary" onclick="searchFromHistory('${query}')">Search</button>
            `;
            historyContainer.appendChild(div);
        });
    }

    // Show modal
    const historyModal = new bootstrap.Modal(document.getElementById('historyModal'));
    historyModal.show();
}

function searchFromHistory(query) {
    document.getElementById('searchInput').value = query;
    document.getElementById('historyContainer').innerHTML = '';
    searchData();
    const historyModal = bootstrap.Modal.getInstance(document.getElementById('historyModal'));
    historyModal.hide();
}

function clearHistory() {
    searchHistory = [];
    localStorage.removeItem('searchHistory');
    document.getElementById('historyContainer').innerHTML = '<p>No search history available.</p>';
    showNotification('Search history cleared.', 'info');
}

// Toggle Advanced Search
function toggleAdvancedSearch() {
    const advSearch = document.getElementById('advancedSearch');
    if (advSearch.style.display === 'none' || advSearch.style.display === '') {
        advSearch.style.display = 'block';
    } else {
        advSearch.style.display = 'none';
    }
}

// Explore Content: Further enhancements can be made based on actual requirements

// Add event listeners for Enter key
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission if inside a form
        searchData();
        document.getElementById('suggestionsList').innerHTML = '';
    }
});

document.getElementById('definitionInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchDefinition();
    }
});

// Load data and history when the page is loaded
window.onload = function() {
    loadData();
    loadHistory();
};
