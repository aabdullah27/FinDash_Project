/**
 * FinDash - Financial Dashboard
 * Created by Ahmad Irfan
 * Authentication JavaScript file for login and registration functionality
 */

// Global variable to store data from JSON file
let appData = {};

document.addEventListener('DOMContentLoaded', function() {
    // Load data from JSON file
    fetch('js/data.json')
        .then(response => response.json())
        .then(data => {
            appData = data;
            
            // Initialize storage with data from JSON
            initializeStorage();
            
            // Check if user is already logged in
            checkLoginStatus();
            
            // Add event listeners
            setupEventListeners();
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });
});

/**
 * Initialize storage with data from JSON
 */
function initializeStorage() {
    // Initialize categories if not already set
    if (!StorageUtil.getCategories() || Object.keys(StorageUtil.getCategories()).length === 0) {
        StorageUtil.setItem('categories', appData.categories);
    }
    
    // Initialize demo user if not already set
    const users = StorageUtil.getItem('users') || [];
    
    if (!users.some(user => user.email === 'demo@example.com')) {
        // Add demo user to users array
        users.push(appData.demoUser);
        StorageUtil.setItem('users', users);
        
        // Initialize demo transactions
        StorageUtil.setItem(`transactions_${appData.demoUser.id}`, appData.demoTransactions);
        
        // Initialize demo budget
        StorageUtil.setItem(`budget_${appData.demoUser.id}`, appData.demoBudget);
        
        // Initialize demo investments
        StorageUtil.setItem(`investments_${appData.demoUser.id}`, appData.demoInvestments);
    }
}

/**
 * Check if user is already logged in
 */
function checkLoginStatus() {
    const currentUser = StorageUtil.getCurrentUser();
    
    // If on login page and user is logged in, redirect to dashboard
    if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/')) {
        if (currentUser) {
            window.location.href = 'dashboard.html';
        }
    }
    
    // If on dashboard page and user is not logged in, redirect to login
    if (window.location.pathname.includes('dashboard.html')) {
        if (!currentUser) {
            window.location.href = 'login.html';
        }
    }
}

/**
 * Setup event listeners for authentication forms
 */
function setupEventListeners() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and content
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Clear error messages
            document.querySelectorAll('.error-message').forEach(error => {
                error.textContent = '';
            });
            
            document.querySelectorAll('.auth-error').forEach(error => {
                error.textContent = '';
            });
        });
    });
    
    // Toggle password visibility
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                btn.classList.remove('fa-eye');
                btn.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                btn.classList.remove('fa-eye-slash');
                btn.classList.add('fa-eye');
            }
        });
    });
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Demo login button
    const demoLoginBtn = document.getElementById('demoLoginBtn');
    if (demoLoginBtn) {
        demoLoginBtn.addEventListener('click', handleDemoLogin);
    }
    
    // Logout button (for pages other than dashboard)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
function handleLogin(e) {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate form
    if (!email || !password) {
        showError('loginError', 'Please enter both email and password');
        return;
    }
    
    // Get users from storage
    const users = StorageUtil.getItem('users') || [];
    
    // Find user with matching email
    const user = users.find(u => u.email === email);
    
    // Check if user exists and password matches
    if (!user) {
        showError('loginError', 'User not found');
        return;
    }
    
    if (user.password !== password) {
        showError('loginError', 'Incorrect password');
        return;
    }
    
    // Set remember me flag
    user.rememberMe = rememberMe;
    
    // Update user in storage
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    StorageUtil.setItem('users', updatedUsers);
    
    // Set current user
    StorageUtil.setCurrentUser(user);
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

/**
 * Handle register form submission
 * @param {Event} e - Form submit event
 */
function handleRegister(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate form
    if (!name || !email || !password || !confirmPassword) {
        showError('registerError', 'Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('registerError', 'Passwords do not match');
        return;
    }
    
    // Get users from storage
    const users = StorageUtil.getItem('users') || [];
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showError('registerError', 'Email already registered');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        rememberMe: false,
        isDemo: false
    };
    
    // Add user to storage
    users.push(newUser);
    StorageUtil.setItem('users', users);
    
    // Initialize user data
    initializeUserData(newUser.id);
    
    // Set current user
    StorageUtil.setCurrentUser(newUser);
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

/**
 * Handle demo login
 */
function handleDemoLogin() {
    // Get users from storage
    const users = StorageUtil.getItem('users') || [];
    
    // Find demo user
    const demoUser = users.find(u => u.email === 'demo@example.com');
    
    if (!demoUser) {
        showError('loginError', 'Demo account not found');
        return;
    }
    
    // Set current user
    StorageUtil.setCurrentUser(demoUser);
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

/**
 * Handle logout
 */
function handleLogout() {
    // Remove current user from storage
    StorageUtil.removeCurrentUser();
    
    // Redirect to login page
    window.location.href = 'login.html';
}

/**
 * Initialize data for a new user
 * @param {string} userId - User ID
 */
function initializeUserData(userId) {
    // Initialize transactions
    StorageUtil.setItem(`transactions_${userId}`, []);
    
    // Initialize budget
    StorageUtil.setItem(`budget_${userId}`, {
        total: 0,
        categories: {}
    });
    
    // Initialize investments
    StorageUtil.setItem(`investments_${userId}`, []);
    
    // Initialize categories (use default categories)
    StorageUtil.setItem(`categories_${userId}`, appData.categories);
}

/**
 * Show error message
 * @param {string} elementId - ID of error element
 * @param {string} message - Error message
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide error after 3 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }
}
