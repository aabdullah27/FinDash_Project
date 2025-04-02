/**
 * FinDash - Financial Dashboard
 * Created by Ahmad Irfan
 * Dashboard JavaScript file for the main dashboard functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard initializing...");
    
    // Check if user is logged in or initialize demo user
    const currentUser = StorageUtil.getCurrentUser();
    if (!currentUser) {
        console.log("No user found, initializing demo user...");
        initializeDemoUser();
    } else {
        console.log("User logged in:", currentUser.username);
    }
    
    // Initialize the UI
    initializeUI();
    
    // Initialize theme
    initializeTheme();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Load dashboard data
    loadDashboardData();
    
    // Setup real-time data updates
    setupRealTimeUpdates();
    
    // Show notification
    showNotification('Dashboard loaded successfully', 'success');
});

/**
 * Initialize a demo user if no user is logged in
 */
function initializeDemoUser() {
    // Create a demo user
    const demoUser = {
        id: 'demo-user',
        username: 'Demo User',
        email: 'demo@example.com',
        password: 'demo123',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=4A6FA5&color=fff',
        createdAt: new Date().toISOString()
    };
    
    // Set as current user
    StorageUtil.setCurrentUser(demoUser);
    
    // Initialize demo data
    StorageUtil.initializeDemoData(demoUser.id);
    
    console.log("Demo user initialized:", demoUser);
    
    // Show notification
    showNotification('Demo mode activated. Welcome to FinDash!', 'info');
}

/**
 * Initialize the UI elements and update user info
 */
function initializeUI() {
    console.log("Initializing UI...");
    const currentUser = StorageUtil.getCurrentUser();
    
    // Update user information in the UI
    if (currentUser) {
        // Update user name and email in sidebar
        document.getElementById('userName').textContent = currentUser.username;
        document.getElementById('userEmail').textContent = currentUser.email;
        
        // Update user avatar
        const avatarUrl = currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=4A6FA5&color=fff`;
        
        const userAvatarElements = document.querySelectorAll('#userAvatar, #headerUserAvatar');
        userAvatarElements.forEach(avatar => {
            avatar.src = avatarUrl;
        });
        
        // Update header user name
        document.getElementById('headerUserName').textContent = currentUser.username;
    }
    
    console.log("UI initialization completed");
}

/**
 * Set up all event listeners for the dashboard
 */
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            console.log("Sidebar toggle clicked");
            sidebar.classList.toggle('collapsed');
            
            // For mobile, handle the overlay as well
            if (window.innerWidth <= 768) {
                if (sidebar.classList.contains('collapsed')) {
                    sidebarOverlay.style.display = 'none';
                } else {
                    sidebarOverlay.style.display = 'block';
                }
            }
        });
    }
    
    // Sidebar overlay (for mobile)
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            console.log("Sidebar overlay clicked");
            sidebar.classList.add('collapsed');
            sidebarOverlay.style.display = 'none';
        });
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            console.log("Theme toggle clicked");
            toggleTheme();
        });
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the section id from the data attribute
            const sectionId = this.getAttribute('data-section');
            
            // Switch to the selected section
            switchSection(sectionId);
            
            // On mobile, close the sidebar after navigation
            if (window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
                if (sidebarOverlay) sidebarOverlay.style.display = 'none';
            }
            
            // Update active link
            navLinks.forEach(link => link.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
        });
    });
    
    // User menu toggle
    const userMenuBtn = document.querySelector('.user-menu-btn');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
            
            // Close notification dropdown if open
            const notificationDropdown = document.querySelector('.notification-dropdown');
            if (notificationDropdown && notificationDropdown.classList.contains('active')) {
                notificationDropdown.classList.remove('active');
            }
        });
    }
    
    // Notification toggle
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
            
            // Close user dropdown if open
            if (userDropdown && userDropdown.classList.contains('active')) {
                userDropdown.classList.remove('active');
            }
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (userDropdown && !userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
        
        if (notificationDropdown && !notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
            notificationDropdown.classList.remove('active');
        }
    });
    
    // Logout buttons
    const logoutButtons = document.querySelectorAll('#logoutBtn, #headerLogout');
    logoutButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log("Logout clicked");
            logout();
        });
    });
    
    // Period filter buttons
    const periodButtons = document.querySelectorAll('.btn-filter');
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            
            // Update active button
            periodButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Reload charts with new period
            loadChartsWithPeriod(period);
            
            // Show notification
            showNotification(`Data updated to show ${period} view`, 'info');
        });
    });
    
    // Add transaction button
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const transactionModal = document.getElementById('transactionModal');
    const cancelTransactionBtn = document.getElementById('cancelTransaction');
    
    if (addTransactionBtn && transactionModal) {
        addTransactionBtn.addEventListener('click', function() {
            transactionModal.style.display = 'block';
        });
    }
    
    if (cancelTransactionBtn && transactionModal) {
        cancelTransactionBtn.addEventListener('click', function() {
            transactionModal.style.display = 'none';
        });
    }
    
    // Transaction form submission
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(transactionForm);
            const transaction = {
                id: 'txn_' + Date.now(),
                type: formData.get('type'),
                category: formData.get('category'),
                amount: parseFloat(formData.get('amount')),
                date: formData.get('date'),
                description: formData.get('description'),
                createdAt: new Date().toISOString()
            };
            
            // Add transaction
            addTransaction(transaction);
            
            // Close modal
            transactionModal.style.display = 'none';
            
            // Reset form
            transactionForm.reset();
            
            // Show notification
            showNotification('Transaction added successfully', 'success');
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (transactionModal && e.target === transactionModal) {
            transactionModal.style.display = 'none';
        }
    });
    
    // Setup period buttons
    setupPeriodButtons();
    
    console.log("Event listeners setup completed");
}

/**
 * Switch between dashboard sections
 * @param {string} sectionId - ID of the section to switch to
 */
function switchSection(sectionId) {
    console.log(`Switching to section: ${sectionId}`);
    
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
}

/**
 * Initialize theme based on user preference
 */
function initializeTheme() {
    const savedTheme = StorageUtil.getItem('theme') || 'light';
    
    // Set theme on body
    document.body.setAttribute('data-theme', savedTheme);
    
    // Update theme toggle icon
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
            if (savedTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    }
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Update body attribute
    document.body.setAttribute('data-theme', newTheme);
    
    // Store theme preference
    StorageUtil.setItem('theme', newTheme);
    
    // Update theme toggle icon
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
            if (newTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    }
    
    // Show notification
    showNotification(`Switched to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} Mode`, 'success');
}

/**
 * Load dashboard data
 */
function loadDashboardData() {
    console.log("Loading dashboard data...");
    
    // Get user data
    const currentUser = StorageUtil.getCurrentUser();
    if (!currentUser) {
        console.error("No user found!");
        return;
    }
    
    // Get user transactions
    const transactions = StorageUtil.getTransactions(currentUser.id);
    
    // Get user budgets
    const budgets = StorageUtil.getBudgets(currentUser.id);
    
    // Set default period to month
    const defaultPeriod = 'month';
    
    // Update dashboard statistics
    updateDashboardStats(transactions, defaultPeriod);
    
    // Update charts
    loadChartsWithPeriod(defaultPeriod);
    
    // Setup period buttons
    setupPeriodButtons();
    
    // Show success notification
    showNotification('Dashboard data loaded successfully', 'success');
    
    // Add animation to dashboard sections
    animateDashboardSections();
}

function loadChartsWithPeriod(period) {
    console.log(`Loading charts with period: ${period}`);
    
    const currentUser = StorageUtil.getCurrentUser();
    if (!currentUser) return;
    
    const transactions = StorageUtil.getTransactions(currentUser.id);
    const budgets = StorageUtil.getBudgets(currentUser.id);
    
    // Update Income vs Expense chart
    updateIncomeExpenseChart(transactions, period);
    
    // Update Expense Breakdown chart
    updateExpenseBreakdownChart(transactions, period);
    
    // Update Budget Status chart
    updateBudgetChart(transactions, budgets, period);
    
    // Set active period button
    setActivePeriodButton(period);
}

function setupPeriodButtons() {
    const periodButtons = document.querySelectorAll('.period-selector button');
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            loadChartsWithPeriod(period);
        });
    });
}

function setActivePeriodButton(period) {
    // Remove active class from all period buttons
    const periodButtons = document.querySelectorAll('.period-selector button');
    periodButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-period') === period) {
            button.classList.add('active');
        }
    });
}

function updateIncomeExpenseChart(transactions, period) {
    console.log(`Updating Income vs Expense chart for period: ${period}`);
    
    // Get the canvas element
    const chartCanvas = document.getElementById('incomeExpenseChart');
    if (!chartCanvas) {
        console.error("Income vs Expense chart canvas not found");
        return;
    }
    
    // Get income and expense data for the period
    const chartData = getIncomeExpenseDataByPeriod(transactions, period);
    
    // Check if chart already exists and destroy it
    if (window.incomeExpenseChart instanceof Chart) {
        window.incomeExpenseChart.destroy();
    }
    
    // Create gradient for income
    const incomeGradient = chartCanvas.getContext('2d').createLinearGradient(0, 0, 0, 400);
    incomeGradient.addColorStop(0, 'rgba(46, 202, 106, 0.4)');
    incomeGradient.addColorStop(1, 'rgba(46, 202, 106, 0.1)');
    
    // Create gradient for expense
    const expenseGradient = chartCanvas.getContext('2d').createLinearGradient(0, 0, 0, 400);
    expenseGradient.addColorStop(0, 'rgba(255, 99, 132, 0.4)');
    expenseGradient.addColorStop(1, 'rgba(255, 99, 132, 0.1)');
    
    // Create the chart
    window.incomeExpenseChart = new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Income',
                    data: chartData.incomeData,
                    backgroundColor: 'rgba(46, 202, 106, 0.8)',
                    borderColor: 'rgba(46, 202, 106, 1)',
                    borderWidth: 2,
                    borderRadius: 5,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                },
                {
                    label: 'Expenses',
                    data: chartData.expenseData,
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    borderRadius: 5,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        borderDash: [4, 4]
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function updateExpenseBreakdownChart(transactions, period) {
    console.log(`Updating Expense Breakdown chart for period: ${period}`);
    
    // Get the canvas element
    const chartCanvas = document.getElementById('expenseBreakdownChart');
    if (!chartCanvas) {
        console.error("Expense Breakdown chart canvas not found");
        return;
    }
    
    // Get expense data by category
    const expenseData = getExpenseDataByCategory(transactions, period);
    
    // Check if chart already exists and destroy it
    if (window.expenseBreakdownChart instanceof Chart) {
        window.expenseBreakdownChart.destroy();
    }
    
    // Create the chart
    window.expenseBreakdownChart = new Chart(chartCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: expenseData.categories,
            datasets: [{
                data: expenseData.amounts,
                backgroundColor: expenseData.colors,
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 2,
                borderRadius: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
    
    // Update the expense breakdown UI list
    updateExpenseBreakdownUI(expenseData.categories, expenseData.amounts, expenseData.colors);
}

function updateBudgetChart(transactions, budgets, period) {
    console.log(`Updating Budget chart for period: ${period}`);
    
    // Get the canvas element
    const chartCanvas = document.getElementById('budgetChart');
    if (!chartCanvas) {
        console.error("Budget chart canvas not found");
        return;
    }
    
    // Get budget data
    const budgetData = getBudgetData(transactions, budgets, period);
    
    // Check if chart already exists and destroy it
    if (window.budgetChart instanceof Chart) {
        window.budgetChart.destroy();
    }
    
    // Create the chart
    window.budgetChart = new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: budgetData.categories,
            datasets: [
                {
                    label: 'Budget',
                    data: budgetData.budgetAmounts,
                    backgroundColor: 'rgba(104, 140, 255, 0.8)',
                    borderColor: 'rgba(104, 140, 255, 1)',
                    borderWidth: 2,
                    borderRadius: 5,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                },
                {
                    label: 'Spent',
                    data: budgetData.spentAmounts,
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    borderRadius: 5,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        borderDash: [4, 4]
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
    
    // Update the budget progress UI
    updateBudgetProgressUI(budgetData.categories, budgetData.budgetAmounts, budgetData.spentAmounts);
}

/**
 * Update dashboard statistics
 * @param {Array} transactions - List of transactions
 * @param {string} period - Time period (day, week, month, year)
 */
function updateDashboardStats(transactions, period) {
    console.log("Updating dashboard statistics...");
    
    if (!transactions || !transactions.length) {
        console.log("No transactions available for statistics");
        
        // Set default values if no transactions
        document.getElementById('totalIncome').textContent = '$0.00';
        document.getElementById('totalExpenses').textContent = '$0.00';
        document.getElementById('netSavings').textContent = '$0.00';
        document.getElementById('incomeChange').textContent = '0%';
        document.getElementById('expenseChange').textContent = '0%';
        document.getElementById('savingsChange').textContent = '0%';
        
        return;
    }
    
    // Define date range for current and previous period
    const { currentStart, currentEnd, previousStart, previousEnd } = getDateRangeForPeriod(period);
    
    // Filter transactions for current period
    const currentTransactions = transactions.filter(txn => {
        const txnDate = new Date(txn.date);
        return txnDate >= currentStart && txnDate <= currentEnd;
    });
    
    // Filter transactions for previous period
    const previousTransactions = transactions.filter(txn => {
        const txnDate = new Date(txn.date);
        return txnDate >= previousStart && txnDate <= previousEnd;
    });
    
    // Calculate current period stats
    const currentIncomeTotal = currentTransactions
        .filter(txn => txn.type === 'income')
        .reduce((sum, txn) => sum + txn.amount, 0);
    
    const currentExpenseTotal = currentTransactions
        .filter(txn => txn.type === 'expense')
        .reduce((sum, txn) => sum + txn.amount, 0);
    
    const currentNetSavings = currentIncomeTotal - currentExpenseTotal;
    
    // Calculate previous period stats
    const previousIncomeTotal = previousTransactions
        .filter(txn => txn.type === 'income')
        .reduce((sum, txn) => sum + txn.amount, 0);
    
    const previousExpenseTotal = previousTransactions
        .filter(txn => txn.type === 'expense')
        .reduce((sum, txn) => sum + txn.amount, 0);
    
    const previousNetSavings = previousIncomeTotal - previousExpenseTotal;
    
    // Calculate percentage changes
    const incomeChange = previousIncomeTotal === 0 
        ? 100 
        : ((currentIncomeTotal - previousIncomeTotal) / previousIncomeTotal) * 100;
    
    const expenseChange = previousExpenseTotal === 0 
        ? 100 
        : ((currentExpenseTotal - previousExpenseTotal) / previousExpenseTotal) * 100;
    
    const savingsChange = previousNetSavings === 0 
        ? 100 
        : ((currentNetSavings - previousNetSavings) / Math.abs(previousNetSavings)) * 100;
    
    // Update the DOM
    document.getElementById('totalIncome').textContent = formatCurrency(currentIncomeTotal);
    document.getElementById('totalExpenses').textContent = formatCurrency(currentExpenseTotal);
    document.getElementById('netSavings').textContent = formatCurrency(currentNetSavings);
    
    // Update change indicators
    updateChangeIndicator('incomeChange', incomeChange);
    updateChangeIndicator('expenseChange', -expenseChange); // Negative for expenses (lower is better)
    updateChangeIndicator('savingsChange', savingsChange);
    
    console.log("Dashboard statistics updated");
}

/**
 * Update change indicator with percentage and appropriate icon/color
 * @param {string} elementId - ID of the element to update
 * @param {number} percentChange - Percentage change value
 */
function updateChangeIndicator(elementId, percentChange) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Format percentage (fixed to 1 decimal place)
    const formattedPercentage = Math.abs(percentChange).toFixed(1) + '%';
    
    // Determine if change is positive (green) or negative (red)
    const isPositive = percentChange > 0;
    element.classList.remove('positive', 'negative', 'neutral');
    
    if (percentChange === 0) {
        element.classList.add('neutral');
        element.innerHTML = `<i class="fas fa-minus"></i> ${formattedPercentage}`;
    } else if (isPositive) {
        element.classList.add('positive');
        element.innerHTML = `<i class="fas fa-arrow-up"></i> ${formattedPercentage}`;
    } else {
        element.classList.add('negative');
        element.innerHTML = `<i class="fas fa-arrow-down"></i> ${formattedPercentage}`;
    }
}

/**
 * Get date range for the specified period
 * @param {string} period - Time period (day, week, month, year)
 * @returns {object} Object with current and previous period start/end dates
 */
function getDateRangeForPeriod(period) {
    const now = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;
    
    switch (period) {
        case 'day':
            // Current day
            currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            
            // Previous day
            previousStart = new Date(currentStart);
            previousStart.setDate(previousStart.getDate() - 1);
            previousEnd = new Date(previousStart);
            previousEnd.setHours(23, 59, 59);
            break;
            
        case 'week':
            // Current week (Sunday to Saturday)
            const dayOfWeek = now.getDay(); // 0 for Sunday, 6 for Saturday
            currentStart = new Date(now);
            currentStart.setDate(now.getDate() - dayOfWeek);
            currentStart.setHours(0, 0, 0, 0);
            
            currentEnd = new Date(currentStart);
            currentEnd.setDate(currentStart.getDate() + 6);
            currentEnd.setHours(23, 59, 59, 999);
            
            // Previous week
            previousStart = new Date(currentStart);
            previousStart.setDate(previousStart.getDate() - 7);
            
            previousEnd = new Date(currentEnd);
            previousEnd.setDate(previousEnd.getDate() - 7);
            break;
            
        case 'month':
            // Current month
            currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
            currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            
            // Previous month
            previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            break;
            
        case 'year':
            // Current year
            currentStart = new Date(now.getFullYear(), 0, 1);
            currentEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            
            // Previous year
            previousStart = new Date(now.getFullYear() - 1, 0, 1);
            previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
            break;
            
        default:
            // Default to month
            currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
            currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            
            previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    }
    
    return { currentStart, currentEnd, previousStart, previousEnd };
}

/**
 * Get income and expense data grouped by period
 * @param {Array} transactions - List of transactions
 * @param {string} period - Time period (day, week, month, year)
 * @returns {object} Object with labels and data for income and expenses
 */
function getIncomeExpenseDataByPeriod(transactions, period) {
    let labels = [];
    let incomeData = [];
    let expenseData = [];
    
    // Define date ranges
    const { currentStart, currentEnd } = getDateRangeForPeriod(period);
    
    switch (period) {
        case 'day':
            // Hours of the day
            labels = Array.from({ length: 24 }, (_, i) => i + ':00');
            
            // Initialize data arrays with zeros
            incomeData = Array(24).fill(0);
            expenseData = Array(24).fill(0);
            
            // Aggregate data by hour
            transactions.forEach(txn => {
                const txnDate = new Date(txn.date);
                
                // Check if transaction is within current day
                if (txnDate >= currentStart && txnDate <= currentEnd) {
                    const hour = txnDate.getHours();
                    
                    if (txn.type === 'income') {
                        incomeData[hour] += txn.amount;
                    } else if (txn.type === 'expense') {
                        expenseData[hour] += txn.amount;
                    }
                }
            });
            break;
            
        case 'week':
            // Days of the week
            labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            // Initialize data arrays with zeros
            incomeData = Array(7).fill(0);
            expenseData = Array(7).fill(0);
            
            // Aggregate data by day of week
            transactions.forEach(txn => {
                const txnDate = new Date(txn.date);
                
                // Check if transaction is within current week
                if (txnDate >= currentStart && txnDate <= currentEnd) {
                    const dayOfWeek = txnDate.getDay(); // 0 for Sunday, 6 for Saturday
                    
                    if (txn.type === 'income') {
                        incomeData[dayOfWeek] += txn.amount;
                    } else if (txn.type === 'expense') {
                        expenseData[dayOfWeek] += txn.amount;
                    }
                }
            });
            break;
            
        case 'month':
            // Days of the month
            const daysInMonth = new Date(currentEnd.getFullYear(), currentEnd.getMonth() + 1, 0).getDate();
            labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
            
            // Initialize data arrays with zeros
            incomeData = Array(daysInMonth).fill(0);
            expenseData = Array(daysInMonth).fill(0);
            
            // Aggregate data by day of month
            transactions.forEach(txn => {
                const txnDate = new Date(txn.date);
                
                // Check if transaction is within current month
                if (txnDate >= currentStart && txnDate <= currentEnd) {
                    const dayOfMonth = txnDate.getDate() - 1; // Adjust to 0-based index
                    
                    if (txn.type === 'income') {
                        incomeData[dayOfMonth] += txn.amount;
                    } else if (txn.type === 'expense') {
                        expenseData[dayOfMonth] += txn.amount;
                    }
                }
            });
            break;
            
        case 'year':
            // Months of the year
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            // Initialize data arrays with zeros
            incomeData = Array(12).fill(0);
            expenseData = Array(12).fill(0);
            
            // Aggregate data by month
            transactions.forEach(txn => {
                const txnDate = new Date(txn.date);
                
                // Check if transaction is within current year
                if (txnDate >= currentStart && txnDate <= currentEnd) {
                    const month = txnDate.getMonth();
                    
                    if (txn.type === 'income') {
                        incomeData[month] += txn.amount;
                    } else if (txn.type === 'expense') {
                        expenseData[month] += txn.amount;
                    }
                }
            });
            break;
    }
    
    return { labels, incomeData, expenseData };
}

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

/**
 * Add a fade-in animation to dashboard sections
 */
function animateDashboardSections() {
    const sections = document.querySelectorAll('.dashboard-card, .chart-container');
    
    sections.forEach((section, index) => {
        // Add animation class with delay based on index
        setTimeout(() => {
            section.classList.add('fade-in');
        }, index * 100);
    });
}

/**
 * Show a notification to the user
 * @param {string} message - The message to show
 * @param {string} type - The type of notification (success, error, warning, info)
 * @param {number} duration - How long to show the notification in ms
 */
function showNotification(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.notification-container');
    if (!container) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    // Set notification content
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after duration
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
    
    return notification;
}

/**
 * Update the income vs. expense chart
 * @param {Array} transactions - List of transactions
 * @param {string} period - Time period (day, week, month, year)
 */
function updateIncomeExpenseChart(transactions, period) {
    console.log("Updating income vs expense chart...");
    
    if (!transactions || !transactions.length) {
        console.log("No transactions available for income/expense chart");
        return;
    }
    
    // Get the canvas element
    const chartCanvas = document.getElementById('incomeExpenseChart');
    if (!chartCanvas) {
        console.error("Income/Expense chart canvas not found");
        return;
    }
    
    // Get data based on period
    const { labels, incomeData, expenseData } = getIncomeExpenseDataByPeriod(transactions, period);
    
    // Check if chart instance already exists and destroy it
    if (window.incomeExpenseChart) {
        window.incomeExpenseChart.destroy();
    }
    
    // Create new chart
    window.incomeExpenseChart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(200, 200, 200, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.raw.toFixed(2);
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
    
    console.log("Income vs expense chart updated");
}

/**
 * Get income and expense data grouped by period
 * @param {Array} transactions - List of transactions
 * @param {string} period - Time period (day, week, month, year)
 * @returns {object} Object with labels and data for income and expenses
 */
function getIncomeExpenseDataByPeriod(transactions, period) {
    let labels = [];
    let incomeData = [];
    let expenseData = [];
    
    // Define date ranges
    const { currentStart, currentEnd } = getDateRangeForPeriod(period);
    
    switch (period) {
        case 'day':
            // Hours of the day
            labels = Array.from({ length: 24 }, (_, i) => i + ':00');
            
            // Initialize data arrays with zeros
            incomeData = Array(24).fill(0);
            expenseData = Array(24).fill(0);
            
            // Aggregate data by hour
            transactions.forEach(txn => {
                const txnDate = new Date(txn.date);
                
                // Check if transaction is within current day
                if (txnDate >= currentStart && txnDate <= currentEnd) {
                    const hour = txnDate.getHours();
                    
                    if (txn.type === 'income') {
                        incomeData[hour] += txn.amount;
                    } else if (txn.type === 'expense') {
                        expenseData[hour] += txn.amount;
                    }
                }
            });
            break;
            
        case 'week':
            // Days of the week
            labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            // Initialize data arrays with zeros
            incomeData = Array(7).fill(0);
            expenseData = Array(7).fill(0);
            
            // Aggregate data by day of week
            transactions.forEach(txn => {
                const txnDate = new Date(txn.date);
                
                // Check if transaction is within current week
                if (txnDate >= currentStart && txnDate <= currentEnd) {
                    const dayOfWeek = txnDate.getDay(); // 0 for Sunday, 6 for Saturday
                    
                    if (txn.type === 'income') {
                        incomeData[dayOfWeek] += txn.amount;
                    } else if (txn.type === 'expense') {
                        expenseData[dayOfWeek] += txn.amount;
                    }
                }
            });
            break;
            
        case 'month':
            // Days of the month
            const daysInMonth = new Date(currentEnd.getFullYear(), currentEnd.getMonth() + 1, 0).getDate();
            labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
            
            // Initialize data arrays with zeros
            incomeData = Array(daysInMonth).fill(0);
            expenseData = Array(daysInMonth).fill(0);
            
            // Aggregate data by day of month
            transactions.forEach(txn => {
                const txnDate = new Date(txn.date);
                
                // Check if transaction is within current month
                if (txnDate >= currentStart && txnDate <= currentEnd) {
                    const dayOfMonth = txnDate.getDate() - 1; // Adjust to 0-based index
                    
                    if (txn.type === 'income') {
                        incomeData[dayOfMonth] += txn.amount;
                    } else if (txn.type === 'expense') {
                        expenseData[dayOfMonth] += txn.amount;
                    }
                }
            });
            break;
            
        case 'year':
            // Months of the year
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            // Initialize data arrays with zeros
            incomeData = Array(12).fill(0);
            expenseData = Array(12).fill(0);
            
            // Aggregate data by month
            transactions.forEach(txn => {
                const txnDate = new Date(txn.date);
                
                // Check if transaction is within current year
                if (txnDate >= currentStart && txnDate <= currentEnd) {
                    const month = txnDate.getMonth();
                    
                    if (txn.type === 'income') {
                        incomeData[month] += txn.amount;
                    } else if (txn.type === 'expense') {
                        expenseData[month] += txn.amount;
                    }
                }
            });
            break;
    }
    
    return { labels, incomeData, expenseData };
}

/**
 * Update the expense breakdown chart
 * @param {Array} transactions - List of transactions
 * @param {string} period - Time period (day, week, month, year)
 */
function updateExpenseBreakdownChart(transactions, period) {
    console.log("Updating expense breakdown chart...");
    
    if (!transactions || !transactions.length) {
        console.log("No transactions available for expense breakdown chart");
        return;
    }
    
    // Get the canvas element
    const chartCanvas = document.getElementById('expenseBreakdownChart');
    if (!chartCanvas) {
        console.error("Expense breakdown chart canvas not found");
        return;
    }
    
    // Get expense data grouped by category
    const { categories, amounts, colors } = getExpenseDataByCategory(transactions, period);
    
    // Check if chart instance already exists and destroy it
    if (window.expenseBreakdownChart) {
        window.expenseBreakdownChart.destroy();
    }
    
    // Create new chart
    window.expenseBreakdownChart = new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [
                {
                    label: 'Expenses',
                    data: amounts,
                    backgroundColor: colors,
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    borderWidth: 2,
                    borderRadius: 3,
                    hoverOffset: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
    
    // Update expense breakdown in the DOM
    updateExpenseBreakdownUI(categories, amounts, colors);
    
    console.log("Expense breakdown chart updated");
}

/**
 * Get expense data grouped by category
 * @param {Array} transactions - List of transactions
 * @param {string} period - Time period (day, week, month, year)
 * @returns {object} Object with categories, amounts, and colors
 */
function getExpenseDataByCategory(transactions, period) {
    // Define date ranges
    const { currentStart, currentEnd } = getDateRangeForPeriod(period);
    
    // Filter transactions for expenses in the current period
    const filteredTransactions = transactions.filter(txn => {
        const txnDate = new Date(txn.date);
        return txn.type === 'expense' && 
               txnDate >= currentStart && 
               txnDate <= currentEnd;
    });
    
    // Group expenses by category
    const expensesByCategory = {};
    
    filteredTransactions.forEach(txn => {
        if (!expensesByCategory[txn.category]) {
            expensesByCategory[txn.category] = 0;
        }
        expensesByCategory[txn.category] += txn.amount;
    });
    
    // Sort categories by amount (descending)
    const sortedCategories = Object.keys(expensesByCategory).sort(
        (a, b) => expensesByCategory[b] - expensesByCategory[a]
    );
    
    // Generate colors for each category
    const colorPalette = [
        'rgba(255, 99, 132, 0.8)',   // Red
        'rgba(54, 162, 235, 0.8)',   // Blue
        'rgba(255, 206, 86, 0.8)',   // Yellow
        'rgba(75, 192, 192, 0.8)',   // Green
        'rgba(153, 102, 255, 0.8)',  // Purple
        'rgba(255, 159, 64, 0.8)',   // Orange
        'rgba(45, 192, 135, 0.8)',   // Teal
        'rgba(238, 130, 238, 0.8)',  // Violet
        'rgba(106, 90, 205, 0.8)',   // Slate Blue
        'rgba(64, 224, 208, 0.8)'    // Turquoise
    ];
    
    // Map categories to arrays for the chart
    const categories = [];
    const amounts = [];
    const colors = [];
    
    sortedCategories.forEach((category, index) => {
        categories.push(category);
        amounts.push(expensesByCategory[category]);
        colors.push(colorPalette[index % colorPalette.length]);
    });
    
    return { categories, amounts, colors };
}

/**
 * Update expense breakdown in the UI
 * @param {Array} categories - Expense categories
 * @param {Array} amounts - Expense amounts
 * @param {Array} colors - Category colors
 */
function updateExpenseBreakdownUI(categories, amounts, colors) {
    const breakdownContainer = document.getElementById('expenseBreakdownList');
    if (!breakdownContainer) return;
    
    // Clear existing content
    breakdownContainer.innerHTML = '';
    
    // Calculate total
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    
    // Create items for each category
    categories.forEach((category, index) => {
        if (index >= 5) return; // Only show top 5 categories in the list
        
        const amount = amounts[index];
        const color = colors[index];
        const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
        
        const item = document.createElement('div');
        item.className = 'expense-category-item';
        item.innerHTML = `
            <div class="category-color" style="background-color: ${color}"></div>
            <div class="category-details">
                <div class="category-name">${category}</div>
                <div class="category-amount">$${amount.toFixed(2)}</div>
            </div>
            <div class="category-percentage">${percentage}%</div>
        `;
        
        breakdownContainer.appendChild(item);
    });
    
    // Add "Other" category if there are more than 5 categories
    if (categories.length > 5) {
        const otherAmount = amounts.slice(5).reduce((sum, amount) => sum + amount, 0);
        const otherPercentage = total > 0 ? Math.round((otherAmount / total) * 100) : 0;
        
        const otherItem = document.createElement('div');
        otherItem.className = 'expense-category-item';
        otherItem.innerHTML = `
            <div class="category-color" style="background-color: #999"></div>
            <div class="category-details">
                <div class="category-name">Other</div>
                <div class="category-amount">$${otherAmount.toFixed(2)}</div>
            </div>
            <div class="category-percentage">${otherPercentage}%</div>
        `;
        
        breakdownContainer.appendChild(otherItem);
    }
}

/**
 * Update budget chart
 * @param {Array} transactions - List of transactions
 * @param {Array} budgets - List of budgets
 * @param {string} period - Time period (day, week, month, year)
 */
function updateBudgetChart(transactions, budgets, period) {
    console.log("Updating budget chart...");
    
    if (!transactions || !transactions.length || !budgets || !budgets.length) {
        console.log("No transactions or budgets available for budget chart");
        return;
    }
    
    // Get the canvas element
    const chartCanvas = document.getElementById('budgetChart');
    if (!chartCanvas) {
        console.error("Budget chart canvas not found");
        return;
    }
    
    // Get budget data
    const { categories, budgetAmounts, spentAmounts } = getBudgetData(transactions, budgets, period);
    
    // Check if chart instance already exists and destroy it
    if (window.budgetChart) {
        window.budgetChart.destroy();
    }
    
    // Create new chart
    window.budgetChart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [
                {
                    label: 'Budget',
                    data: budgetAmounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Spent',
                    data: spentAmounts,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(200, 200, 200, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.raw.toFixed(2);
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
    
    // Update budget progress in the UI
    updateBudgetProgressUI(categories, budgetAmounts, spentAmounts);
    
    console.log("Budget chart updated");
}

/**
 * Get budget data
 * @param {Array} transactions - List of transactions
 * @param {Array} budgets - List of budgets
 * @param {string} period - Time period (day, week, month, year)
 * @returns {object} Object with categories, budget amounts, and spent amounts
 */
function getBudgetData(transactions, budgets, period) {
    // Define date ranges
    const { currentStart, currentEnd } = getDateRangeForPeriod(period);
    
    // Filter transactions for expenses in the current period
    const filteredTransactions = transactions.filter(txn => {
        const txnDate = new Date(txn.date);
        return txn.type === 'expense' && 
               txnDate >= currentStart && 
               txnDate <= currentEnd;
    });
    
    // Group expenses by category
    const expensesByCategory = {};
    
    filteredTransactions.forEach(txn => {
        if (!expensesByCategory[txn.category]) {
            expensesByCategory[txn.category] = 0;
        }
        expensesByCategory[txn.category] += txn.amount;
    });
    
    // Map budget categories to arrays for the chart
    const categories = [];
    const budgetAmounts = [];
    const spentAmounts = [];
    
    // Use budgets that have categories with transactions
    budgets.forEach(budget => {
        // Only include categories with a budget or transactions
        if (budget.amount > 0 || expensesByCategory[budget.category]) {
            categories.push(budget.category);
            budgetAmounts.push(budget.amount);
            spentAmounts.push(expensesByCategory[budget.category] || 0);
        }
    });
    
    return { categories, budgetAmounts, spentAmounts };
}

/**
 * Update budget progress in the UI
 * @param {Array} categories - Budget categories
 * @param {Array} budgetAmounts - Budget amounts
 * @param {Array} spentAmounts - Spent amounts
 */
function updateBudgetProgressUI(categories, budgetAmounts, spentAmounts) {
    const progressContainer = document.getElementById('budgetProgressList');
    if (!progressContainer) return;
    
    // Clear existing content
    progressContainer.innerHTML = '';
    
    // Calculate total
    const total = budgetAmounts.reduce((sum, amount) => sum + amount, 0);
    
    // Create progress bars for each category
    categories.forEach((category, index) => {
        const budgetAmount = budgetAmounts[index];
        const spentAmount = spentAmounts[index];
        const percentage = budgetAmount > 0 ? Math.min(100, Math.round((spentAmount / budgetAmount) * 100)) : 0;
        
        // Determine status class based on percentage
        let statusClass = 'good';
        if (percentage >= 90) {
            statusClass = 'danger';
        } else if (percentage >= 75) {
            statusClass = 'warning';
        }
        
        const progressItem = document.createElement('div');
        progressItem.className = 'budget-progress-item';
        progressItem.innerHTML = `
            <div class="budget-category">
                <div class="category-name">${category}</div>
                <div class="budget-amounts">
                    <span class="spent-amount">$${spentAmount.toFixed(2)}</span>
                    <span class="budget-amount"> / $${budgetAmount.toFixed(2)}</span>
                </div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar ${statusClass}" style="width: ${percentage}%"></div>
            </div>
            <div class="budget-percentage ${statusClass}">${percentage}%</div>
        `;
        
        progressContainer.appendChild(progressItem);
    });
    
    // Calculate and add total budget progress
    const totalSpent = spentAmounts.reduce((sum, amount) => sum + amount, 0);
    const totalPercentage = total > 0 ? Math.min(100, Math.round((totalSpent / total) * 100)) : 0;
    
    // Determine status class based on percentage
    let totalStatusClass = 'good';
    if (totalPercentage >= 90) {
        totalStatusClass = 'danger';
    } else if (totalPercentage >= 75) {
        totalStatusClass = 'warning';
    }
    
    const totalProgressItem = document.createElement('div');
    totalProgressItem.className = 'budget-progress-item total';
    totalProgressItem.innerHTML = `
        <div class="budget-category">
            <div class="category-name">Total Budget</div>
            <div class="budget-amounts">
                <span class="spent-amount">$${totalSpent.toFixed(2)}</span>
                <span class="budget-amount"> / $${total.toFixed(2)}</span>
            </div>
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar ${totalStatusClass}" style="width: ${totalPercentage}%"></div>
        </div>
        <div class="budget-percentage ${totalStatusClass}">${totalPercentage}%</div>
    `;
    
    progressContainer.appendChild(totalProgressItem);
}

/**
 * Setup event listeners for period buttons
 */
function setupPeriodButtons() {
    const periodButtons = document.querySelectorAll('.period-selector button');
    
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const period = this.dataset.period;
            loadChartsWithPeriod(period);
        });
    });
}

/**
 * Set active period button
 * @param {string} period - The time period (day, week, month, year)
 */
function setActivePeriodButton(period) {
    const periodButtons = document.querySelectorAll('.period-selector button');
    
    periodButtons.forEach(button => {
        if (button.dataset.period === period) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}
