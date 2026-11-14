// Theme Toggle Logic
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    themeToggleBtn.textContent = newTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    localStorage.setItem('theme', newTheme);
});

// Load saved theme on startup
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    themeToggleBtn.textContent = savedTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
}

// Snippet Logic
const form = document.getElementById('snippet-form');
const vaultGrid = document.getElementById('vault-grid');
let snippets = JSON.parse(localStorage.getItem('snippets')) || [];

function renderSnippets(filterText = '') {
    vaultGrid.innerHTML = '';
    
    // Calculate and update stats
    const countSpan = document.getElementById('snippet-count');
    const sizeSpan = document.getElementById('storage-size');
    
    countSpan.textContent = snippets.length;
    // Calculate rough KB size of the saved strings
    const kbSize = (JSON.stringify(snippets).length / 1024).toFixed(2);
    sizeSpan.textContent = kbSize;

    // Filter logic for search
    const filteredSnippets = snippets.filter(snippet => 
        snippet.title.toLowerCase().includes(filterText.toLowerCase()) || 
        snippet.code.toLowerCase().includes(filterText.toLowerCase())
    );
    
    if (filteredSnippets.length === 0) {
        vaultGrid.innerHTML = `
            <div class="empty-state">
                <h3>No Snippets Found</h3>
                <p>${snippets.length === 0 ? 'Start by saving your first piece of code above.' : 'Try a different search term.'}</p>
            </div>
        `;
        return;
    }

    filteredSnippets.forEach((snippet, originalIndex) => {
        // Find true index in the main array so deletion/copying works during search
        const trueIndex = snippets.indexOf(snippet);
        
        const card = document.createElement('div');
        card.className = 'snippet-card';
        card.innerHTML = `
            <h3>${snippet.title}</h3>
            <pre><code>${snippet.code}</code></pre>
            <div class="card-actions">
                <button onclick="copyCode(${trueIndex})">Copy Code</button>
                <button onclick="deleteSnippet(${trueIndex})" style="color: #dc3545; border-color: #dc3545;">Delete</button>
            </div>
        `;
        vaultGrid.appendChild(card);
    });
}

// Live Search Listener
document.getElementById('search-input').addEventListener('input', (e) => {
    renderSnippets(e.target.value);
});



form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('snippet-title').value;
    const code = document.getElementById('snippet-code').value;
    
    snippets.push({ title, code });
    localStorage.setItem('snippets', JSON.stringify(snippets));
    
    form.reset();
    renderSnippets();
});

window.copyCode = function(index) {
    const codeToCopy = snippets[index].code;
    navigator.clipboard.writeText(codeToCopy).then(() => {
        // Find the button that was clicked and temporarily change its text
        const buttons = document.querySelectorAll('.snippet-card button');
        const copyBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick') === `copyCode(${index})`);
        if(copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = originalText, 2000);
        }
    });
};

window.deleteSnippet = function(index) {
    snippets.splice(index, 1);
    localStorage.setItem('snippets', JSON.stringify(snippets));
    renderSnippets();
};

// Initial render
renderSnippets();
