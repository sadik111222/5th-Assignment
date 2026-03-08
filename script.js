let currentTab = 'all';
let allIssues = [];
let filteredIssues = [];

// DOM elements
const loginPage = document.getElementById('loginPage');
const mainPage = document.getElementById('mainPage');
const loginForm = document.getElementById('loginForm');
const issuesGrid = document.getElementById('issuesGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const issueCount = document.getElementById('issueCount');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const issueModal = document.getElementById('issueModal');
const tabButtons = document.querySelectorAll('.tab-btn');

// Demo credentials
const DEMO_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// API endpoints
const API_ENDPOINTS = {
    allIssues: 'https://phi-lab-server.vercel.app/api/v1/lab/issues',
    singleIssue: (id) => `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`,
    searchIssues: (query) => `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${query}`
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Tab buttons
    tabButtons.forEach(btn => {
        btn.addEventListener('click', handleTabChange);
    });
    
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Modal close buttons
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    issueModal.addEventListener('click', (e) => {
        if (e.target === issueModal) {
            closeModal();
        }
    });
    
    // New Issue button (placeholder functionality)
    document.getElementById('newIssueBtn').addEventListener('click', () => {
        alert('New Issue functionality would be implemented here');
    });
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validate credentials
    if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
        // Successful login
        loginPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
        document.body.className = 'bg-gray-50 min-h-screen';
        
        // Load issues
        loadIssues();
    } else {
        // Failed login
        showError('Invalid credentials. Please use admin/admin123');
    }
}

// Show error message
function showError(message) {
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
    errorDiv.textContent = message;
    
    // Insert before form
    loginForm.parentNode.insertBefore(errorDiv, loginForm);
    
    // Remove after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Load issues from API
async function loadIssues() {
    showLoadingSpinner();
    
    try {
        const response = await fetch(API_ENDPOINTS.allIssues);
        if (!response.ok) {
            throw new Error('Failed to fetch issues');
        }
        
        const apiResponse = await response.json();
        allIssues = apiResponse.data; // Extract data array from API response
        
        // Demonstrate working with issues array
        demonstrateArrayOperations(allIssues);
        
        filterAndDisplayIssues();
    } catch (error) {
        console.error('Error loading issues:', error);
        showError('Failed to load issues. Please try again.');
    } finally {
        hideLoadingSpinner();
    }
}

// Demonstrate various array operations
function demonstrateArrayOperations(issues) {
    console.log('=== Issues Array Operations Demo ===');
    
    // 1. Total issues count
    console.log('Total issues:', issues.length);
    
    // 2. Count by status
    const openIssues = issues.filter(issue => issue.status === 'open');
    const closedIssues = issues.filter(issue => issue.status === 'closed');
    console.log('Open issues:', openIssues.length);
    console.log('Closed issues:', closedIssues.length);
    
    // 3. Count by priority
    const highPriority = issues.filter(issue => issue.priority === 'high');
    const mediumPriority = issues.filter(issue => issue.priority === 'medium');
    const lowPriority = issues.filter(issue => issue.priority === 'low');
    console.log('High priority:', highPriority.length);
    console.log('Medium priority:', mediumPriority.length);
    console.log('Low priority:', lowPriority.length);
    
    // 4. Get all unique labels
    const allLabels = issues.flatMap(issue => issue.labels || []);
    const uniqueLabels = [...new Set(allLabels)];
    console.log('All labels:', uniqueLabels);
    
    // 5. Find issues by author
    const issuesByJohn = issues.filter(issue => issue.author === 'john_doe');
    console.log('Issues by john_doe:', issuesByJohn.length);
    
    // 6. Sort by creation date (newest first)
    const sortedByDate = [...issues].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    console.log('Newest issue:', sortedByDate[0]?.title);
    
    // 7. Group by status
    const groupedByStatus = issues.reduce((acc, issue) => {
        if (!acc[issue.status]) acc[issue.status] = [];
        acc[issue.status].push(issue);
        return acc;
    }, {});
    console.log('Grouped by status:', Object.keys(groupedByStatus));
    
    // 8. Find high priority open issues
    const highPriorityOpen = issues.filter(issue => 
        issue.status === 'open' && issue.priority === 'high'
    );
    console.log('High priority open issues:', highPriorityOpen.length);
    
    // 9. Map to simple format
    const simpleFormat = issues.map(issue => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        priority: issue.priority
    }));
    console.log('Simple format (first 3):', simpleFormat.slice(0, 3));
    
    // 10. Search in titles and descriptions
    const searchResults = issues.filter(issue => 
        issue.title.toLowerCase().includes('bug') || 
        issue.description.toLowerCase().includes('bug')
    );
    console.log('Bug-related issues:', searchResults.length);
}

// Search issues
async function handleSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        filterAndDisplayIssues();
        return;
    }
    
    showLoadingSpinner();
    
    try {
        const response = await fetch(API_ENDPOINTS.searchIssues(query));
        if (!response.ok) {
            throw new Error('Failed to search issues');
        }
        
        const searchResponse = await response.json();
        allIssues = searchResponse.data || []; // Extract data array from search response
        filterAndDisplayIssues();
    } catch (error) {
        console.error('Error searching issues:', error);
        showError('Failed to search issues. Please try again.');
    } finally {
        hideLoadingSpinner();
    }
}

// Handle tab change
function handleTabChange(e) {
    const selectedTab = e.target.dataset.tab;
    currentTab = selectedTab;
    
    // Update tab styles
    tabButtons.forEach(btn => {
        if (btn.dataset.tab === selectedTab) {
            btn.classList.add('tab-active');
            btn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        } else {
            btn.classList.remove('tab-active');
            btn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        }
    });
    
    filterAndDisplayIssues();
}

// Filter and display issues based on current tab
function filterAndDisplayIssues() {
    // Filter issues based on current tab
    switch (currentTab) {
        case 'open':
            filteredIssues = allIssues.filter(issue => issue.status === 'open');
            break;
        case 'closed':
            filteredIssues = allIssues.filter(issue => issue.status === 'closed');
            break;
        default:
            filteredIssues = allIssues;
    }
    
    // Update issue count
    issueCount.textContent = filteredIssues.length;
    
    // Display issues
    displayIssues(filteredIssues);
}

// Display issues in grid
function displayIssues(issues) {
    issuesGrid.innerHTML = '';
    
    if (issues.length === 0) {
        issuesGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-inbox text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500">No issues found</p>
            </div>
        `;
        return;
    }
    
    issues.forEach(issue => {
        const issueCard = createIssueCard(issue);
        issuesGrid.appendChild(issueCard);
    });
}

// Create issue card element
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