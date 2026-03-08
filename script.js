let currentTab = 'all';
let allIssues = [];
let filteredIssues = [];


const loginPage = document.getElementById('loginPage');
const loginForm = document.getElementById('loginForm');
const mainPage = document.getElementById('mainPage');
const issuesGrid = document.getElementById('issuesGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const issueCount = document.getElementById('issueCount');


const API_ENDPOINTS = {
    allIssues: 'https://phi-lab-server.vercel.app/api/v1/lab/issues',
    singleIssue: (id) => `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`,
    searchIssues: (query) => `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${query}`
};

const DEMO_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    
    if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
       
        loginPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
        document.body.className = 'bg-gray-50 min-h-screen';
        
        
        loadIssues();
    } else {
        
        showError('Invalid credentials. Please use admin/admin123');
    }
}


function createIssueCard(issue) {
    const card = document.createElement('div');
    card.className = 'issue-card bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer overflow-hidden';
    
    // Add top border based on status
    const borderTopColor = issue.status === 'open' ? 'border-green-500' : 'border-purple-500';
    card.classList.add('border-t-4', borderTopColor);
    
    // Format date
    const createdDate = new Date(issue.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    // Create labels HTML
    const labelsHTML = issue.labels ? issue.labels.map(label => 
        `<span class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">${label}</span>`
    ).join(' ') : '';
    
    // Priority color
    const priorityColor = getPriorityColor(issue.priority);
    
    card.innerHTML = `
        <div class="p-4">
            <div class="mb-3">
                <h3 class="font-semibold text-gray-800 mb-1 line-clamp-2">${issue.title}</h3>
                <p class="text-sm text-gray-600 line-clamp-3">${issue.description || 'No description available'}</p>
            </div>
            
            <div class="flex items-center justify-between mb-3">
                <span class="inline-block px-2 py-1 text-xs font-medium rounded-full ${priorityColor}">
                    ${issue.priority || 'MEDIUM'}
                </span>
                <span class="text-xs text-gray-500">#${issue.id}</span>
            </div>
            
            <div class="mb-3">
                <div class="flex flex-wrap gap-1">
                    ${labelsHTML}
                </div>
            </div>
            
            <div class="flex items-center justify-between text-xs text-gray-500">
                <div class="flex items-center">
                    <i class="fas fa-user-circle mr-1"></i>
                    <span>${issue.author || 'Unknown'}</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-calendar mr-1"></i>
                    <span>${createdDate}</span>
                </div>
            </div>
        </div>
    `;
    
    // Add click event to open modal
    card.addEventListener('click', () => openIssueModal(issue));
    
    return card;
}