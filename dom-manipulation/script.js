// ... existing code ...

// Server simulation using JSONPlaceholder
const API_URL = 'https://jsonplaceholder.typicode.com/posts';
let autoSyncInterval;
let autoSyncEnabled = false;

// DOM elements for sync
const syncNowBtn = document.getElementById('syncNowBtn');
const toggleAutoSync = document.getElementById('toggleAutoSync');
const syncStatus = document.getElementById('syncStatus');
const conflictResolver = document.getElementById('conflictResolver');
const conflictContainer = document.getElementById('conflictContainer');
const notificationArea = document.getElementById('notificationArea');

// Initialize
loadQuotes();
updateSyncStatus();

// Show notification
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notificationArea.appendChild(notification);
  
  // Show
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 10);
  
  // Hide after delay
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Update sync status display
function updateSyncStatus() {
  const lastSync = localStorage.getItem('lastSync');
  syncStatus.textContent = lastSync 
    ? `Last sync: ${new Date(parseInt(lastSync)).toLocaleString()}` 
    : 'Last sync: Never';
}

// Toggle auto sync
function toggleAutoSyncHandler() {
  autoSyncEnabled = !autoSyncEnabled;
  
  if (autoSyncEnabled) {
    toggleAutoSync.textContent = 'Auto Sync: On (30s)';
    autoSyncInterval = setInterval(syncWithServer, 30000);
    showNotification('Auto sync enabled', 'success');
  } else {
    toggleAutoSync.textContent = 'Auto Sync: Off';
    clearInterval(autoSyncInterval);
    showNotification('Auto sync disabled', 'warning');
  }
  
  localStorage.setItem('autoSyncEnabled', autoSyncEnabled.toString());
}

// Sync with server
async function syncWithServer() {
  showNotification('Syncing with server...', 'warning');
  
  try {
    // Get current quotes
    const localQuotes = [...quotes];
    
    // Fetch quotes from server
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Server error');
    
    const serverData = await response.json();
    const serverQuotes = serverData
      .filter(item => item.title && item.body)
      .map(item => ({
        id: `server-${item.id}`,
        text: `${item.title}: ${item.body}`,
        category: 'Server',
        lastUpdated: Date.now()
      }));
    
    // Merge and detect conflicts
    const conflicts = [];
    const mergedQuotes = [];
    const quoteMap = new Map();
    
    // Add server quotes
    serverQuotes.forEach(quote => {
      quoteMap.set(quote.id, quote);
      mergedQuotes.push(quote);
    });
    
    // Add local quotes and detect conflicts
    localQuotes.forEach(quote => {
      // Check if server has a different version of the same quote
      if (quoteMap.has(quote.id)) {
        const serverQuote = quoteMap.get(quote.id);
        
        // Detect if content changed (conflict)
        if (serverQuote.text !== quote.text || serverQuote.category !== quote.category) {
          conflicts.push({
            id: quote.id,
            local: quote,
            server: serverQuote
          });
        }
        
        // Always use server version in merged list
        // Will be replaced by user choice later
      } else {
        // No conflict, add to merged list
        mergedQuotes.push(quote);
        quoteMap.set(quote.id, quote);
      }
    });
    
    // Handle conflicts
    if (conflicts.length > 0) {
      showNotification(`${conflicts.length} conflicts detected!`, 'error');
      showConflictResolver(conflicts);
    } else {
      // No conflicts, update quotes
      quotes = mergedQuotes;
      saveQuotesToLocalStorage();
      populateCategories();
      showNotification('Sync completed successfully', 'success');
    }
    
    // Update last sync time
    localStorage.setItem('lastSync', Date.now().toString());
    updateSyncStatus();
    
    return true;
  } catch (error) {
    console.error('Sync error:', error);
    showNotification(`Sync failed: ${error.message}`, 'error');
    return false;
  }
}

// Show conflict resolver UI
function showConflictResolver(conflicts) {
  conflictContainer.innerHTML = '';
  conflictResolver.style.display = 'block';
  
  conflicts.forEach(conflict => {
    const conflictElement = document.createElement('div');
    conflictElement.className = 'conflict-quote';
    conflictElement.innerHTML = `
      <h4>Quote ID: ${conflict.id}</h4>
      <div class="quote-option">
        <p><strong>Server Version:</strong> "${conflict.server.text}"</p>
        <p>Category: ${conflict.server.category}</p>
        <button class="resolve-btn server" data-id="${conflict.id}" data-version="server">Use Server Version</button>
      </div>
      <div class="quote-option">
        <p><strong>Local Version:</strong> "${conflict.local.text}"</p>
        <p>Category: ${conflict.local.category}</p>
        <button class="resolve-btn local" data-id="${conflict.id}" data-version="local">Use Local Version</button>
      </div>
    `;
    conflictContainer.appendChild(conflictElement);
  });
}

// Resolve conflict
function resolveConflict(id, version) {
  // Find the conflict in current quotes
  const conflictIndex = quotes.findIndex(q => q.id === id);
  
  if (conflictIndex !== -1) {
    if (version === 'server') {
      // Keep server version (already in merged list)
    } else {
      // Restore local version
      const localVersion = quotes.find(q => q.id === id);
      quotes[conflictIndex] = {...localVersion, lastUpdated: Date.now()};
    }
  }
  
  // Hide conflict resolver if all conflicts are resolved
  const remainingConflicts = document.querySelectorAll('.conflict-quote');
  if (remainingConflicts.length === 1) {
    conflictResolver.style.display = 'none';
    saveQuotesToLocalStorage();
    populateCategories();
    showRandomQuote();
    showNotification('Conflict resolved. Data saved.', 'success');
  }
}

// Event listeners
syncNowBtn.addEventListener('click', async () => {
  showNotification('Manual sync started...', 'warning');
  await syncWithServer();
});

toggleAutoSync.addEventListener('click', toggleAutoSyncHandler);

// Conflict resolution event delegation
conflictContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('resolve-btn')) {
    const id = e.target.dataset.id;
    const version = e.target.dataset.version;
    resolveConflict(id, version);
    e.target.closest('.conflict-quote').remove();
  }
});

// Load auto-sync preference
if (localStorage.getItem('autoSyncEnabled') === 'true') {
  toggleAutoSyncHandler();
}

// Initialize with a sync if auto-sync is enabled
if (autoSyncEnabled) {
  setTimeout(syncWithServer, 3000);
}
