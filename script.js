// --- Theme Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    themeToggleBtn.textContent = newTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    localStorage.setItem('theme', newTheme);
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    themeToggleBtn.textContent = savedTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
}

// --- NEW: Scratchpad Logic ---
const scratchpad = document.getElementById('scratchpad-input');
const saveStatus = document.getElementById('save-status');

// Load existing scratchpad data
scratchpad.value = localStorage.getItem('scratchpad_data') || '';

// Auto-save on type with slight delay to prevent lag
let timeoutId;
scratchpad.addEventListener('input', () => {
    saveStatus.textContent = 'Saving...';
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        localStorage.setItem('scratchpad_data', scratchpad.value);
        saveStatus.textContent = 'Saved';
    }, 500);
});

// --- NEW: Skill Tracker Logic ---
const checkboxes = document.querySelectorAll('.check-item input');
const trackerCount = document.getElementById('tracker-count');
const savedProgress = JSON.parse(localStorage.getItem('skill_progress')) || {};
let completedCount = 0;

checkboxes.forEach(cb => {
    if(savedProgress[cb.value]) {
        cb.checked = true;
        completedCount++;
    }
    
    cb.addEventListener('change', (e) => {
        savedProgress[e.target.value] = e.target.checked;
        localStorage.setItem('skill_progress', JSON.stringify(savedProgress));
        // Update the visual count
        trackerCount.textContent = document.querySelectorAll('.check-item input:checked').length;
    });
});
trackerCount.textContent = completedCount;


// --- App State & Snippet Logic ---
const form = document.getElementById('snippet-form');
const vaultGrid = document.getElementById('vault-grid');
let snippets = JSON.parse(localStorage.getItem('snippets')) || [];
let currentCategoryFilter = 'All';

function renderSnippets(searchText = '') {
    vaultGrid.innerHTML = '';
    
    // Update Stats
    document.getElementById('snippet-count').textContent = snippets.length;
    document.getElementById('storage-size').textContent = (JSON.stringify(snippets).length / 1024).toFixed(2);

    // Apply Filters
    const filteredSnippets = snippets.filter(snippet => {
        const matchesSearch = snippet.title.toLowerCase().includes(searchText.toLowerCase()) || 
                              snippet.code.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = currentCategoryFilter === 'All' || snippet.category === currentCategoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    if (filteredSnippets.length === 0) {
        vaultGrid.innerHTML = `<div class="empty-state"><h3>No Snippets Found</h3><p>Try adjusting your search or category filter.</p></div>`;
        return;
    }

    filteredSnippets.forEach((snippet) => {
        const trueIndex = snippets.indexOf(snippet);
        const displayCategory = snippet.category || 'Uncategorized'; 
        
        const card = document.createElement('div');
        card.className = 'snippet-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${snippet.title}</h3>
                <span class="badge">${displayCategory}</span>
            </div>
            <pre><code>${snippet.code}</code></pre>
            <div class="card-actions">
                <button class="btn-secondary" onclick="copyCode(${trueIndex})">Copy Code</button>
                <button class="btn-secondary" onclick="deleteSnippet(${trueIndex})" style="color: #e53e3e; border-color: #fc8181;">Delete</button>
            </div>
        `;
        vaultGrid.appendChild(card);
    });
}

// Event Listeners
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('snippet-title').value;
    const category = document.getElementById('snippet-category').value;
    const code = document.getElementById('snippet-code').value;
    
    snippets.push({ title, category, code });
    localStorage.setItem('snippets', JSON.stringify(snippets));
    
    form.reset();
    renderSnippets(document.getElementById('search-input').value);
});

document.getElementById('search-input').addEventListener('input', (e) => {
    renderSnippets(e.target.value);
});

document.getElementById('category-filters').addEventListener('click', (e) => {
    if(e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentCategoryFilter = e.target.getAttribute('data-filter');
        renderSnippets(document.getElementById('search-input').value);
    }
});

// Actions
window.copyCode = function(index) {
    const codeToCopy = snippets[index].code;
    navigator.clipboard.writeText(codeToCopy).then(() => {
        const buttons = document.querySelectorAll('.snippet-card button');
        const copyBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick') === `copyCode(${index})`);
        if(copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = 'var(--accent-color)';
            copyBtn.style.color = 'white';
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '';
                copyBtn.style.color = '';
            }, 2000);
        }
    });
};

window.deleteSnippet = function(index) {
    snippets.splice(index, 1);
    localStorage.setItem('snippets', JSON.stringify(snippets));
    renderSnippets(document.getElementById('search-input').value);
};

// Backup & Restore
document.getElementById('export-btn').addEventListener('click', () => {
    if(snippets.length === 0) return alert("Nothing to export yet!");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snippets));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "snippet_vault_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            if(Array.isArray(importedData)) {
                snippets = importedData;
                localStorage.setItem('snippets', JSON.stringify(snippets));
                renderSnippets();
                alert("Backup restored successfully!");
            }
        } catch (err) {
            alert("Error parsing backup file.");
        }
    };
    reader.readAsText(file);
});

renderSnippets();
