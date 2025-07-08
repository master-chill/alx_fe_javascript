// Initial quotes data (will be loaded from storage)
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const clearStorageBtn = document.getElementById('clearStorageBtn');
const downloadAnchor = document.getElementById('downloadAnchor');
const addMessage = document.getElementById('addMessage');
const importMessage = document.getElementById('importMessage');
const storageMessage = document.getElementById('storageMessage');

// Load quotes from localStorage
function loadQuotes() {
  const savedQuotes = localStorage.getItem('quotes');
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  } else {
    // Default quotes if nothing in storage
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
      { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
      { text: "Your time is limited, so don't waste it living someone else's life.", category: "Life" }
    ];
    saveQuotesToLocalStorage();
  }
  
  // Load last viewed quote from sessionStorage
  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    displayQuote(JSON.parse(lastQuote));
  } else {
    showRandomQuote();
  }
}

// Save quotes to localStorage
function saveQuotesToLocalStorage() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Save last viewed quote to sessionStorage
function saveLastQuoteToSession(quote) {
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Display a specific quote
function displayQuote(quote) {
  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <div class="category-tag">${quote.category}</div>
  `;
}

// Display random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Add some quotes!</p>";
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  
  displayQuote(quote);
  saveLastQuoteToSession(quote);
}

// Add new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim() || 'General';
  
  if (!text) {
    showMessage(addMessage, 'Please enter a quote', 'error');
    return;
  }
  
  // Add new quote to array
  quotes.push({ text, category });
  
  // Save to localStorage
  saveQuotesToLocalStorage();
  
  // Clear form
  newQuoteText.value = '';
  newQuoteCategory.value = '';
  
  // Show success message
  showMessage(addMessage, 'Quote added successfully!', 'success');
}

// Export quotes to JSON file
function exportQuotes() {
  if (quotes.length === 0) {
    showMessage(storageMessage, 'No quotes to export', 'error');
    return;
  }
  
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  downloadAnchor.href = url;
  downloadAnchor.download = 'quotes-backup.json';
  downloadAnchor.click();
  
  URL.revokeObjectURL(url);
  showMessage(storageMessage, 'Quotes exported successfully!', 'success');
}

// Import quotes from JSON file
function importQuotes(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const fileReader = new FileReader();
  
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid format: Expected an array of quotes');
      }
      
      // Validate each quote
      for (const quote of importedQuotes) {
        if (!quote.text || typeof quote.text !== 'string') {
          throw new Error('Invalid quote format: Missing text property');
        }
      }
      
      // Add imported quotes
      quotes = [...quotes, ...importedQuotes];
      saveQuotesToLocalStorage();
      showRandomQuote();
      
      showMessage(importMessage, `Successfully imported ${importedQuotes.length} quotes!`, 'success');
    } catch (error) {
      showMessage(importMessage, `Import failed: ${error.message}`, 'error');
      console.error('Import error:', error);
    }
    
    // Reset file input
    importFile.value = '';
  };
  
  fileReader.onerror = function() {
    showMessage(importMessage, 'Error reading file', 'error');
    importFile.value = '';
  };
  
  fileReader.readAsText(file);
}

// Clear all stored data
function clearAllData() {
  if (confirm('Are you sure you want to delete ALL quotes and clear storage?')) {
    // Clear localStorage
    localStorage.removeItem('quotes');
    
    // Clear sessionStorage
    sessionStorage.removeItem('lastQuote');
    
    // Reset quotes array
    quotes = [];
    
    // Update UI
    quoteDisplay.innerHTML = "<p>No quotes available. Add some quotes!</p>";
    showMessage(storageMessage, 'All data has been cleared', 'success');
  }
}

// Helper function to show messages
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `message ${type}`;
  element.style.display = 'block';
  
  setTimeout(() => {
    element.style.display = 'none';
  }, 3000);
}

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
exportBtn.addEventListener('click', exportQuotes);
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', importQuotes);
clearStorageBtn.addEventListener('click', clearAllData);

// Initialize
loadQuotes();
