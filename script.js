const loginPage = document.getElementById('loginPage');
const loginForm = document.getElementById('loginForm');

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