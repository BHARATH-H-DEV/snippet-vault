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

// --- App State ---
const form = document.getElementById('snippet-form');
const vaultGrid = document.getElementById('vault-grid');
let snippets = JSON.parse(localStorage.getItem('snippets')) || [];

// --- Render Logic ---
function renderSnippets(filterText = '') {
    vaultGrid.innerHTML = '';
    
    // Update Dashboard Stats
    document.getElementById('snippet-count').textContent = snippets.length;
    document.getElementById('storage-size').textContent = (JSON.stringify(snippets).length / 1024).toFixed(2);

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

    filteredSnippets.forEach((snippet) => {
        const trueIndex = snippets.indexOf(snippet);
        const card = document.createElement('div');
        card.className = 'snippet-card';
        card.innerHTML = `
            <h3>${snippet.title}</h3>
            <pre><code>${snippet.code}</code></pre>
            <div class="card-actions">
                <button class="btn-secondary" onclick="copyCode(${trueIndex})">Copy Code</button>
                <button class="btn-secondary" onclick="deleteSnippet(${trueIndex})" style="color: #e53e3e; border-color: #fc8181;">Delete</button>
            </div>
        `;
        vaultGrid.appendChild(card);
    });
}

// --- Event Listeners ---
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('snippet-title').value;
    const code = document.getElementById('snippet-code').value;
    
    snippets.push({ title, code });
    localStorage.setItem('snippets', JSON.stringify(snippets));
    
    form.reset();
    renderSnippets(document.getElementById('search-input').value);
});

document.getElementById('search-input').addEventListener('input', (e) => {
    renderSnippets(e.target.value);
});

// --- Actions ---
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

// --- NEW: Backup & Restore Data ---
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

// Initial load
renderSnippets();
