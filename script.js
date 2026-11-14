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

function renderSnippets() {
    vaultGrid.innerHTML = '';
    snippets.forEach((snippet, index) => {
        const card = document.createElement('div');
        card.className = 'snippet-card';
        card.innerHTML = `
            <h3>${snippet.title}</h3>
            <pre><code>${snippet.code}</code></pre>
            <div class="card-actions">
                <button onclick="copyCode(${index})">Copy Code</button>
                <button onclick="deleteSnippet(${index})" style="color: #dc3545; border-color: #dc3545;">Delete</button>
            </div>
        `;
        vaultGrid.appendChild(card);
    });
}

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
