/**
 * StorageUtil - A utility class for handling local storage operations
 * This centralizes all storage operations for better management and consistency
 */
class StorageUtil {
    /**
     * Initialize the storage with default values if not already set
     * @param {Object} defaultData - Default data to initialize storage with
     */
    static initialize(defaultData = {}) {
        // For each key in defaultData, check if it exists in localStorage
        // If not, set it with the default value
        Object.keys(defaultData).forEach(key => {
            if (localStorage.getItem(key) === null) {
                const value = typeof defaultData[key] === 'object' 
                    ? JSON.stringify(defaultData[key]) 
                    : defaultData[key];
                localStorage.setItem(key, value);
            }
        });
    }

    /**
     * Get an item from localStorage
     * @param {string} key - The key to retrieve
     * @param {boolean} parseJSON - Whether to parse the value as JSON
     * @returns {any} - The retrieved value
     */
    static getItem(key, parseJSON = true) {
        const value = localStorage.getItem(key);
        if (value === null) return null;
        
        if (parseJSON) {
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        }
        
        return value;
    }

    /**
     * Set an item in localStorage
     * @param {string} key - The key to set
     * @param {any} value - The value to store
     */
    static setItem(key, value) {
        if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            localStorage.setItem(key, value);
        }
    }

    /**
     * Remove an item from localStorage
     * @param {string} key - The key to remove
     */
    static removeItem(key) {
        localStorage.removeItem(key);
    }

    /**
     * Clear all items from localStorage
     */
    static clear() {
        localStorage.clear();
    }

    /**
     * Get the current theme
     * @returns {string} - The current theme ('light' or 'dark')
     */
    static getTheme() {
        return this.getItem('theme', false) || 'light';
    }

    /**
     * Set the theme
     * @param {string} theme - The theme to set ('light' or 'dark')
     */
    static setTheme(theme) {
        this.setItem('theme', theme);
    }

    /**
     * Toggle the theme between 'light' and 'dark'
     * @returns {string} - The new theme
     */
    static toggleTheme() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    }

    /**
     * Get the current user
     * @returns {Object|null} - The current user object or null if not logged in
     */
    static getCurrentUser() {
        return this.getItem('currentUser');
    }

    /**
     * Set the current user
     * @param {Object} user - The user object to set
     */
    static setCurrentUser(user) {
        this.setItem('currentUser', user);
    }

    /**
     * Clear the current user (logout)
     */
    static clearCurrentUser() {
        this.removeItem('currentUser');
    }
    
    /**
     * Remove the current user (logout)
     */
    static removeCurrentUser() {
        this.removeItem('currentUser');
    }

    /**
     * Generate a demo user for testing
     * @returns {Object} - A demo user object
     */
    static generateDemoUser() {
        const demoUser = {
            id: 'demo-user-' + Date.now(),
            name: 'Demo User',
            email: 'demo@example.com',
            avatar: null,
            createdAt: new Date().toISOString()
        };
        
        // Create demo data
        this.initializeDemoData(demoUser.id);
        
        return demoUser;
    }

    /**
     * Get user data including transactions, budgets, and investments
     * @param {string} userId - The user ID to get data for
     * @returns {Object} - User data object with transactions, budgets, and investments
     */
    static getUserData(userId) {
        if (!userId) return null;
        
        return {
            transactions: this.getItem(`transactions_${userId}`) || [],
            budgets: this.getItem(`budget_${userId}`) || [],
            investments: this.getItem(`investments_${userId}`) || []
        };
    }

    /**
     * Initialize demo data for the current user
     * @param {string} userId - The user ID to create demo data for
     */
    static initializeDemoData(userId) {
        console.log("Initializing demo data for user:", userId);
        
        // Create demo data if it doesn't exist
        if (!this.getItem(`transactions_${userId}`)) {
            // Create demo transactions
            const transactions = this.generateDemoTransactions();
            this.setItem(`transactions_${userId}`, transactions);
        }
        
        if (!this.getItem(`budget_${userId}`)) {
            // Create demo budget
            const budget = this.generateDemoBudget();
            this.setItem(`budget_${userId}`, budget);
        }
        
        if (!this.getItem(`investments_${userId}`)) {
            // Create demo investments
            const investments = this.generateDemoInvestments();
            this.setItem(`investments_${userId}`, investments);
        }
        
        console.log("Demo data initialized successfully");
    }

    /**
     * Create demo data for a user
     * @param {string} userId - The user ID to create demo data for
     */
    static createDemoData(userId) {
        // Create demo transactions
        const transactions = this.generateDemoTransactions();
        this.setItem(`transactions_${userId}`, transactions);
        
        // Create demo budget
        const budget = this.generateDemoBudget();
        this.setItem(`budget_${userId}`, budget);
        
        // Create demo investments
        const investments = this.generateDemoInvestments();
        this.setItem(`investments_${userId}`, investments);
    }

    /**
     * Generate demo transactions
     * @returns {Array} - An array of demo transactions
     */
    static generateDemoTransactions() {
        const currentDate = new Date();
        const transactions = [];
        
        // Generate transactions for the last 6 months
        for (let i = 0; i < 6; i++) {
            const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            
            // Generate income transactions
            transactions.push({
                id: `income-salary-${i}`,
                type: 'income',
                category: 'Salary',
                amount: 4500 + Math.floor(Math.random() * 500),
                date: new Date(month.getFullYear(), month.getMonth(), 15).toISOString(),
                description: 'Monthly Salary'
            });
            
            if (Math.random() > 0.5) {
                transactions.push({
                    id: `income-freelance-${i}`,
                    type: 'income',
                    category: 'Freelance',
                    amount: 500 + Math.floor(Math.random() * 1000),
                    date: new Date(month.getFullYear(), month.getMonth(), 20).toISOString(),
                    description: 'Freelance Project'
                });
            }
            
            // Generate expense transactions
            const expenseCategories = ['Food', 'Housing', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping'];
            
            // Generate 10-15 expenses per month
            const numExpenses = 10 + Math.floor(Math.random() * 6);
            
            for (let j = 0; j < numExpenses; j++) {
                const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
                const day = 1 + Math.floor(Math.random() * 28);
                
                let amount;
                switch (category) {
                    case 'Food':
                        amount = 10 + Math.floor(Math.random() * 90);
                        break;
                    case 'Housing':
                        amount = 1000 + Math.floor(Math.random() * 500);
                        break;
                    case 'Transportation':
                        amount = 50 + Math.floor(Math.random() * 150);
                        break;
                    case 'Entertainment':
                        amount = 20 + Math.floor(Math.random() * 100);
                        break;
                    case 'Utilities':
                        amount = 100 + Math.floor(Math.random() * 200);
                        break;
                    case 'Healthcare':
                        amount = 50 + Math.floor(Math.random() * 300);
                        break;
                    case 'Shopping':
                        amount = 30 + Math.floor(Math.random() * 200);
                        break;
                    default:
                        amount = 50 + Math.floor(Math.random() * 100);
                }
                
                transactions.push({
                    id: `expense-${category.toLowerCase()}-${i}-${j}`,
                    type: 'expense',
                    category: category,
                    amount: amount,
                    date: new Date(month.getFullYear(), month.getMonth(), day).toISOString(),
                    description: `${category} Expense`
                });
            }
        }
        
        // Sort transactions by date (newest first)
        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * Generate demo budget
     * @returns {Array} - An array of budget items
     */
    static generateDemoBudget() {
        return [
            { id: 'budget-1', category: 'Food', amount: 800 },
            { id: 'budget-2', category: 'Housing', amount: 1500 },
            { id: 'budget-3', category: 'Transportation', amount: 400 },
            { id: 'budget-4', category: 'Entertainment', amount: 300 },
            { id: 'budget-5', category: 'Utilities', amount: 500 },
            { id: 'budget-6', category: 'Healthcare', amount: 200 },
            { id: 'budget-7', category: 'Shopping', amount: 300 }
        ];
    }

    /**
     * Generate demo investments
     * @returns {Array} - An array of demo investments
     */
    static generateDemoInvestments() {
        return [
            {
                id: 'inv-1',
                name: 'S&P 500 ETF',
                type: 'ETF',
                value: 15000,
                initialValue: 12000,
                purchaseDate: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString(),
                performance: [
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(), value: 13200 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString(), value: 13500 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 4)).toISOString(), value: 14000 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(), value: 13800 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(), value: 14200 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), value: 14700 },
                    { date: new Date().toISOString(), value: 15000 }
                ]
            },
            {
                id: 'inv-2',
                name: 'Tech Growth Fund',
                type: 'Mutual Fund',
                value: 8500,
                initialValue: 7000,
                purchaseDate: new Date(new Date().setMonth(new Date().getMonth() - 9)).toISOString(),
                performance: [
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(), value: 7200 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString(), value: 7500 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 4)).toISOString(), value: 7800 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(), value: 8100 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(), value: 8300 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), value: 8400 },
                    { date: new Date().toISOString(), value: 8500 }
                ]
            },
            {
                id: 'inv-3',
                name: 'Dividend Aristocrats',
                type: 'Stock',
                value: 5200,
                initialValue: 5000,
                purchaseDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(),
                performance: [
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(), value: 5000 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString(), value: 5100 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 4)).toISOString(), value: 5050 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(), value: 5150 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(), value: 5200 },
                    { date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), value: 5180 },
                    { date: new Date().toISOString(), value: 5200 }
                ]
            }
        ];
    }
}

// Initialize with default theme and demo user
StorageUtil.initialize({
    theme: 'light',
    sidebarCollapsed: false
});

// If there's no current user, create a demo user for testing
if (!StorageUtil.getCurrentUser()) {
    const demoUser = StorageUtil.generateDemoUser();
    StorageUtil.setCurrentUser(demoUser);
}

// Initialize storage or check for user when the script loads
(function() {
    // Check if a user is already logged in
    let currentUser = StorageUtil.getCurrentUser();
    
    if (!currentUser) {
        console.log("No logged-in user found in storage.js init. Consider creating a demo user.");
    } else {
        console.log("Existing user found in storage.js init:", currentUser.name);
    }
    
    // Optional: Initialize theme from storage
    const savedTheme = StorageUtil.getTheme();
    document.body.setAttribute('data-theme', savedTheme);
    // Update theme toggle icon if needed (logic might be better in dashboard.js)
    const themeToggleIcon = document.getElementById('themeToggle')?.querySelector('i');
    if (themeToggleIcon) {
        themeToggleIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
})();
