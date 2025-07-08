// ... existing code ...

// DOM elements for filtering
const categoryFilter = document.getElementById('categoryFilter');
const categoryButtons = document.getElementById('categoryButtons');

// Global variables
let quotes = [];
let currentFilter = 'all';

// Load quotes and filter from localStorage
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
  
  // Load last filter from localStorage
  const savedFilter = localStorage.getItem('quoteFilter');
  if (savedFilter) {
    currentFilter = savedFilter;
  }
  
  // Load last viewed quote from sessionStorage
  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    displayQuote(JSON.parse(lastQuote));
  } else {
    showRandomQuote();
  }
  
  // Populate categories
  populateCategories();
  applySavedFilter();
}

// Save filter to localStorage
function saveFilterToLocalStorage(filter) {
  localStorage.setItem('quoteFilter', filter);
}

// Populate categories in dropdown and buttons
function populateCategories() {
  // Clear existing options
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categoryButtons.innerHTML = '';
  
  // Get unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Add to dropdown
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Set current filter in dropdown
  categoryFilter.value = currentFilter;
  
  // Create category buttons
  categories.forEach(category => {
    const button = document.createElement('button');
    button.classList.add('category-btn');
    if (category === currentFilter) {
      button.classList.add('active');
    }
    button.textContent = category;
    button.dataset.category = category;
    button.addEventListener('click', () => filterQuotes(category));
    categoryButtons.appendChild(button);
  });
  
  // Add "All" button
  const allButton = document.createElement('button');
  allButton.classList.add('category-btn');
  if (currentFilter === 'all') {
    allButton.classList.add('active');
  }
  allButton.textContent = 'All';
  allButton.dataset.category = 'all';
  allButton.addEventListener('click', () => filterQuotes('all'));
  categoryButtons.prepend(allButton);
}

// Apply saved filter on page load
function applySavedFilter() {
  // Set dropdown to saved filter
  categoryFilter.value = currentFilter;
  
  // Highlight active button
  document.querySelectorAll('.category-btn').forEach(button => {
    button.classList.remove('active');
    if (button.dataset.category === currentFilter) {
      button.classList.add('active');
    }
  });
  
  // Apply styling to dropdown
  if (currentFilter === 'all') {
    categoryFilter.classList.remove('active-filter');
  } else {
    categoryFilter.classList.add('active-filter');
  }
}

// Filter quotes by category
function filterQuotes(category) {
  currentFilter = category;
  
  // Save to localStorage
  saveFilterToLocalStorage(category);
  
  // Update UI
  applySavedFilter();
  
  // Show a random quote from the filtered category
  showRandomQuote();
}

// Get filtered quotes array
function getFilteredQuotes() {
  if (currentFilter === 'all') {
    return quotes;
  }
  return quotes.filter(quote => quote.category === currentFilter);
}

// Display random quote (respecting current filter)
function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  
  if (filteredQuotes.length === 0) {
    let message = currentFilter === 'all' 
      ? 'No quotes available. Add some quotes!' 
      : `No quotes in "${currentFilter}" category. Add some or change filter.`;
      
    quoteDisplay.innerHTML = `<p>${message}</p>`;
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  
  displayQuote(quote);
  saveLastQuoteToSession(quote);
}

// Add new quote (enhanced to handle categories)
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
  
  // Refresh categories
  populateCategories();
  
  // Auto-select the new category
  filterQuotes(category);
  
  // Show success message
  showMessage(addMessage, 'Quote added successfully!', 'success');
}

// ... rest of the existing code ...

// Event listeners
categoryFilter.addEventListener('change', () => filterQuotes(categoryFilter.value));

// Initialize
loadQuotes();
