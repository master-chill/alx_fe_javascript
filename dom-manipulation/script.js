// Initial quotes data
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
  { text: "Your time is limited, so don't waste it living someone else's life.", category: "Life" },
  { text: "Stay hungry, stay foolish.", category: "Motivation" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Perseverance" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// Display random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Add some quotes!</p>";
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  
  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <div class="category-tag">${quote.category}</div>
  `;
}

// Add new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim() || 'General';
  
  if (!text) {
    alert('Please enter a quote');
    return;
  }
  
  // Add new quote to array
  quotes.push({ text, category });
  
  // Clear form
  newQuoteText.value = '';
  newQuoteCategory.value = '';
  
  // Show success message
  const successMsg = document.createElement('p');
  successMsg.textContent = 'Quote added successfully!';
  successMsg.style.color = 'green';
  document.getElementById('addQuoteSection').appendChild(successMsg);
  
  // Remove message after 2 seconds
  setTimeout(() => {
    successMsg.remove();
  }, 2000);
}

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);

// Initialize
showRandomQuote();
