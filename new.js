// app.js

let legalData = []; // Array to hold JSON data

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
    }
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
                <div class="card">
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

// Search Function
function searchData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    if (searchTerm === '') {
        displayResults([]);
        return;
    }

    const filteredData = legalData.filter(item =>
        item.Title.toLowerCase().includes(searchTerm) ||
        item.Summary.toLowerCase().includes(searchTerm)
    );

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

    const card = `
        <div class="col-md-12">
            <div class="card">
                <div class="card-body">
                    <h5>${item.Title}</h5>
                    <p>${item.Summary}</p>
                    <a href="${item.URL}" class="btn btn-primary" target="_blank">Read More</a>
                </div>
            </div>
        </div>
    `;

    workFolder.innerHTML += card;
}

// Add event listeners for Enter key
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchData();
    }
});

document.getElementById('definitionInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchDefinition();
    }
});

// Load data when the page is loaded
window.onload = function() {
    loadData();
};
