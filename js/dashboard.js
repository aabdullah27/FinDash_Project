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
    console.log("Initializing demo user...");
    
    // Create a demo user
    const demoUser = {
        id: 'demo-user-' + Date.now(),
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
        // Update user name and avatar in user menu button
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = currentUser.username;
        }
        
        // Update sidebar user info
        const sidebarUserName = document.getElementById('userName');
        const sidebarUserEmail = document.getElementById('userEmail');
        
        if (sidebarUserName) {
            sidebarUserName.textContent = currentUser.username;
        }
        
        if (sidebarUserEmail) {
            sidebarUserEmail.textContent = currentUser.email;
        }
        
        // Update user avatar
        const avatarUrl = currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=4A6FA5&color=fff`;
        
        const userAvatarElements = document.querySelectorAll('.user-avatar');
        userAvatarElements.forEach(avatar => {
            avatar.src = avatarUrl;
            avatar.alt = currentUser.username;
        });
    }
    
    // Initialize empty state for charts if no data
    initializeEmptyStates();
    
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
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            console.log("Sidebar toggle clicked");
            sidebar.classList.toggle('collapsed');
            document.body.classList.toggle('collapsed-sidebar');
            
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
            document.body.classList.add('collapsed-sidebar');
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
                document.body.classList.add('collapsed-sidebar');
                if (sidebarOverlay) sidebarOverlay.style.display = 'none';
            }
            
            // Update active link
            navLinks.forEach(link => link.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
        });
    });
    
    // User menu toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
            
            // Close notification dropdown if open
            const notificationDropdown = document.getElementById('notificationDropdown');
            if (notificationDropdown && notificationDropdown.classList.contains('active')) {
                notificationDropdown.classList.remove('active');
            }
        });
    }
    
    // Notification toggle
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
            
            // Close user dropdown if open
            if (userDropdown && userDropdown.classList.contains('active')) {
                userDropdown.classList.remove('active');
            }
            
            // Update notification badge
            const notificationCount = document.querySelector('.notification-count');
            if (notificationCount) {
                notificationCount.style.display = 'none';
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
    
    // Mark all notifications as read
    const markAllRead = document.getElementById('markAllRead');
    if (markAllRead) {
        markAllRead.addEventListener('click', function(e) {
            e.preventDefault();
            // Hide notification count badge
            const notificationCount = document.querySelector('.notification-count');
            if (notificationCount) {
                notificationCount.style.display = 'none';
            }
            
            // Update notification items to show they've been read
            const notificationItems = document.querySelectorAll('.notification-item');
            notificationItems.forEach(item => {
                item.style.backgroundColor = 'transparent';
            });
            
            showNotification('All notifications marked as read', 'success');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Period selectors for charts
    setupPeriodButtons();
    
    // Connect close buttons for notifications
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('notification-close')) {
            const notification = e.target.closest('.notification');
            if (notification) {
                closeNotification(notification);
            }
        }
    });
    
    // Card action buttons
    const cardActions = document.querySelectorAll('.btn-card-action');
    cardActions.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const cardId = this.closest('.chart-card').id;
            
            if (action === 'refresh') {
                console.log(`Refreshing ${cardId}...`);
                // Reload the chart data
                loadDashboardData();
                showNotification(`${cardId.replace('-', ' ')} data refreshed`, 'info');
            } else if (action === 'download') {
                console.log(`Downloading ${cardId}...`);
                // Simulate download
                showNotification(`${cardId.replace('-', ' ')} data downloaded`, 'success');
            }
        });
    });
}

/**
 * Initialize empty states for charts and data displays
 */
function initializeEmptyStates() {
    // Get all chart containers
    const chartContainers = document.querySelectorAll('.chart-container');
    
    // Check each container for content
    chartContainers.forEach(container => {
        // If container is empty or only has canvas with no data
        if (!container.querySelector('canvas') || container.clientHeight < 50) {
            // Add empty state message
            if (!container.querySelector('.empty-state')) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <i class="fas fa-chart-area"></i>
                    <p>No data to display yet</p>
                `;
                container.appendChild(emptyState);
            }
        } else {
            // Remove empty state if it exists and container has content
            const emptyState = container.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }
        }
    });
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
        
        // Update document title
        const sectionTitle = selectedSection.querySelector('h2').textContent;
        document.title = `${sectionTitle} | FinDash`;
    }
}

/**
 * Initialize theme based on user preference
 */
function initializeTheme() {
    console.log("Initializing theme...");
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // Apply saved theme
        document.body.setAttribute('data-theme', savedTheme);
        
        // Update icon
        updateThemeIcon(savedTheme);
    } else {
        // Check if user prefers dark theme
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (prefersDarkScheme) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateThemeIcon('dark');
        } else {
            document.body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            updateThemeIcon('light');
        }
    }
    
    console.log(`Theme set to: ${document.body.getAttribute('data-theme')}`);
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    console.log("Toggling theme...");
    
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Apply new theme
    document.body.setAttribute('data-theme', newTheme);
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
    
    // Update theme icon
    updateThemeIcon(newTheme);
    
    console.log(`Theme toggled to: ${newTheme}`);
    
    // Show notification
    showNotification(`Theme changed to ${newTheme} mode`, 'info');
}

/**
 * Update theme icon based on current theme
 * @param {string} theme - Current theme ('light' or 'dark')
 */
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

/**
 * Load dashboard data and initialize charts
 */
function loadDashboardData() {
    console.log("Loading dashboard data...");
    
    // Show loading state
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-circle-notch fa-spin"></i><p>Loading data...</p></div>';
    });
    
    // Get current user
    const currentUser = StorageUtil.getCurrentUser();
    if (!currentUser) {
        console.error("No user found");
        // Create a demo user if none exists
        initializeDemoUser();
        // Try again after creating demo user
        setTimeout(() => loadDashboardData(), 100);
        return;
    }
    
    // Get user data
    let userData = StorageUtil.getUserData(currentUser.id);
    console.log("User data loaded:", userData);
    
    if (!userData || !userData.transactions || userData.transactions.length === 0) {
        console.log("No transaction data found, creating demo data...");
        StorageUtil.initializeDemoData(currentUser.id);
        userData = StorageUtil.getUserData(currentUser.id);
        
        if (!userData || !userData.transactions || userData.transactions.length === 0) {
            console.error("Failed to create demo data");
            initializeEmptyStates();
            return;
        }
    }
    
    console.log(`Loaded ${userData.transactions.length} transactions`);
    
    // Update stats cards
    updateStats(userData.transactions, 'month');
    
    // Set default period
    const defaultPeriod = 'month';
    loadChartsWithPeriod(defaultPeriod);
    
    // Set active period button
    setActivePeriodButton(defaultPeriod);
}

/**
 * Update statistics cards with financial data
 * @param {Array} transactions - Array of user transactions
 * @param {string} period - Time period (day, week, month, year)
 */
function updateStats(transactions, period = 'month') {
    console.log("Updating stats with transactions:", transactions, "for period:", period);
    
    if (!transactions || !transactions.length) {
        // Set default values if no transactions
        updateStatCard('totalBalance', 0, 0);
        updateStatCard('totalIncome', 0, 0);
        updateStatCard('totalExpenses', 0, 0);
        updateStatCard('savings', '0%', 0);
        return;
    }
    
    // Define date range for current and previous period
    const { currentStart, currentEnd, previousStart, previousEnd } = getDateRangeForPeriod(period);
    
    // Calculate totals for current period
    let currentIncome = 0;
    let currentExpenses = 0;
    
    // Calculate totals for previous period
    let previousIncome = 0;
    let previousExpenses = 0;
    
    // Calculate totals for all time (for balance)
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(transaction => {
        const txnDate = new Date(transaction.date);
        const amount = parseFloat(transaction.amount);
        
        // Add to all-time totals
        if (transaction.type === 'income') {
            totalIncome += amount;
        } else if (transaction.type === 'expense') {
            totalExpenses += amount;
        }
        
        // Add to current period
        if (txnDate >= currentStart && txnDate < currentEnd) {
            if (transaction.type === 'income') {
                currentIncome += amount;
            } else if (transaction.type === 'expense') {
                currentExpenses += amount;
            }
        }
        
        // Add to previous period
        if (txnDate >= previousStart && txnDate < previousEnd) {
            if (transaction.type === 'income') {
                previousIncome += amount;
            } else if (transaction.type === 'expense') {
                previousExpenses += amount;
            }
        }
    });
    
    // Calculate metrics and changes
    const totalBalance = totalIncome - totalExpenses;
    const currentBalance = currentIncome - currentExpenses;
    const previousBalance = previousIncome - previousExpenses;
    
    // Calculate savings percentage
    const savingsPercent = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;
    const prevSavingsPercent = previousIncome > 0 ? ((previousIncome - previousExpenses) / previousIncome) * 100 : 0;
    const savingsChange = prevSavingsPercent !== 0 ? 
        (savingsPercent - prevSavingsPercent) : 
        savingsPercent > 0 ? 100 : 0;
    
    // Calculate change percentages
    const incomeChange = previousIncome > 0 ? 
        ((currentIncome - previousIncome) / previousIncome) * 100 : 
        currentIncome > 0 ? 100 : 0;
        
    const expenseChange = previousExpenses > 0 ? 
        ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 
        currentExpenses > 0 ? 100 : 0;
        
    const balanceChange = previousBalance !== 0 ? 
        ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100 : 
        currentBalance > 0 ? 100 : currentBalance < 0 ? -100 : 0;
    
    // Update UI
    updateStatCard('totalBalance', totalBalance, balanceChange);
    updateStatCard('totalIncome', currentIncome, incomeChange);
    updateStatCard('totalExpenses', currentExpenses, expenseChange);
    updateStatCard('savings', savingsPercent.toFixed(1) + '%', savingsChange);
    
    console.log("Stats updated:", {
        balance: { value: totalBalance, change: balanceChange },
        income: { value: currentIncome, change: incomeChange },
        expenses: { value: currentExpenses, change: expenseChange },
        savings: { value: savingsPercent, change: savingsChange }
    });
}

/**
 * Update a single stat card with data and change percentage
 * @param {string} id - ID of the stat card element
 * @param {number|string} value - Value to display
 * @param {number} changePercent - Percentage change from previous period
 */
function updateStatCard(id, value, changePercent) {
    const card = document.getElementById(id);
    if (!card) return;
    
    const valueElement = card.querySelector('.stat-value');
    const changeElement = card.querySelector('.stat-change');
    
    // Format value based on card type
    if (id !== 'savings') {
        valueElement.textContent = formatCurrency(value);
    } else {
        valueElement.textContent = value;
    }
    
    // Update change percentage
    const isPositive = changePercent >= 0;
    const icon = isPositive ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>';
    
    changeElement.innerHTML = `${icon} ${Math.abs(changePercent).toFixed(1)}% from last period`;
    changeElement.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
}

/**
 * Load charts with data for the specified period
 * @param {string} period - Time period (day, week, month, year)
 */
function loadChartsWithPeriod(period) {
    console.log(`Loading charts with period: ${period}`);
    
    // Get current user
    const currentUser = StorageUtil.getCurrentUser();
    if (!currentUser) {
        console.error("No user found");
        initializeDemoUser();
        setTimeout(() => loadChartsWithPeriod(period), 100); // Retry after a short delay
        return;
    }
    
    // Get user data
    const userData = StorageUtil.getUserData(currentUser.id);
    
    if (!userData || !userData.transactions || userData.transactions.length === 0) {
        console.error("No user data or transactions found");
        StorageUtil.initializeDemoData(currentUser.id);
        userData = StorageUtil.getUserData(currentUser.id);
    }
    
    console.log(`Loading charts with ${userData.transactions.length} transactions for period: ${period}`);
    
    // Update stats first
    updateStats(userData.transactions, period);
    
    // Force clear any existing charts
    if (window.charts) {
        Object.values(window.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
    
    // Initialize charts object if it doesn't exist
    window.charts = window.charts || {};
    
    // Update all charts with the selected period
    try {
        updateIncomeExpenseChart(userData.transactions, period);
        updateExpenseBreakdownChart(userData.transactions, period);
        updateBudgetChart(userData.transactions, userData.budgets, period);
        console.log("Charts updated successfully");
    } catch (error) {
        console.error("Error updating charts:", error);
    }
}

/**
 * Setup period selection buttons
 */
function setupPeriodButtons() {
    const periodButtons = document.querySelectorAll('.period-selector button');
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            loadChartsWithPeriod(period);
            setActivePeriodButton(period);
        });
    });
}

/**
 * Set active period button
 * @param {string} period - Active period
 */
function setActivePeriodButton(period) {
    const periodButtons = document.querySelectorAll('.period-selector button');
    periodButtons.forEach(button => {
        if (button.getAttribute('data-period') === period) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

/**
 * Update the income vs expense chart
 * @param {Array} transactions - List of transactions
 * @param {string} period - Time period (day, week, month, year)
 */
function updateIncomeExpenseChart(transactions, period) {
    console.log(`Updating Income vs Expense chart with period: ${period}`);
    
    // Get the canvas element
    const canvas = document.getElementById('incomeExpenseChart');
    if (!canvas) {
        console.error("Income vs Expense chart canvas not found");
        return;
    }
    
    // Get the chart data
    const chartData = getIncomeExpenseDataByPeriod(transactions, period);
    
    // Define chart colors
    const incomeColor = '#4CAF50';
    const expenseColor = '#F44336';
    
    // Destroy existing chart if there is one
    if (window.incomeExpenseChart instanceof Chart) {
        window.incomeExpenseChart.destroy();
    }
    
    // Create the chart
    window.incomeExpenseChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Income',
                    data: chartData.incomeData,
                    backgroundColor: incomeColor,
                    borderColor: incomeColor,
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: chartData.expenseData,
                    backgroundColor: expenseColor,
                    borderColor: expenseColor,
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the expense breakdown chart
 * @param {Array} transactions - List of transactions
 * @param {string} period - Time period (day, week, month, year)
 */
function updateExpenseBreakdownChart(transactions, period) {
    console.log(`Updating Expense Breakdown chart with period: ${period}`);
    
    // Get the canvas element
    const canvas = document.getElementById('expenseBreakdownChart');
    if (!canvas) {
        console.error("Expense Breakdown chart canvas not found");
        return;
    }
    
    // Get expense data by category
    const expenseData = getExpenseDataByCategory(transactions, period);
    
    // Early return if no data
    if (expenseData.categories.length === 0) {
        // Display empty state in the chart container
        const chartContainer = canvas.parentElement;
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <p>No expense data available for this period</p>
                </div>
            `;
        }
        return;
    }
    
    // Update the expense breakdown list
    updateExpenseBreakdownUI(expenseData.categories, expenseData.amounts, expenseData.colors);
    
    // Destroy existing chart if there is one
    if (window.expenseBreakdownChart instanceof Chart) {
        window.expenseBreakdownChart.destroy();
    }
    
    // Create the chart
    window.expenseBreakdownChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: expenseData.categories,
            datasets: [{
                data: expenseData.amounts,
                backgroundColor: expenseData.colors,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update the budget chart
 * @param {Array} transactions - List of transactions
 * @param {Array} budgets - List of budget items
 * @param {string} period - Time period (day, week, month, year)
 */
function updateBudgetChart(transactions, budgets, period) {
    console.log(`Updating Budget chart with period: ${period}`);
    
    // Get the canvas element
    const canvas = document.getElementById('budgetChart');
    if (!canvas) {
        console.error("Budget chart canvas not found");
        return;
    }
    
    // Handle case when budgets don't exist
    if (!budgets || budgets.length === 0) {
        // Display empty state in the chart container
        const chartContainer = canvas.parentElement;
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-piggy-bank"></i>
                    <p>No budget data available</p>
                </div>
            `;
        }
        return;
    }
    
    // Get budget data
    const budgetData = getBudgetData(transactions, budgets, period);
    
    // Update the budget progress UI
    updateBudgetProgressUI(budgetData.categories, budgetData.budgetAmounts, budgetData.spentAmounts);
    
    // Destroy existing chart if there is one
    if (window.budgetChart instanceof Chart) {
        window.budgetChart.destroy();
    }
    
    // Prepare data for chart
    const chartData = {
        labels: budgetData.categories,
        datasets: [
            {
                label: 'Budget',
                data: budgetData.budgetAmounts,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'Spent',
                data: budgetData.spentAmounts,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }
        ]
    };
    
    // Create the chart
    window.budgetChart = new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update expense breakdown UI list
 * @param {Array} categories - Expense categories
 * @param {Array} amounts - Expense amounts
 * @param {Array} colors - Category colors
 */
function updateExpenseBreakdownUI(categories, amounts, colors) {
    const container = document.getElementById('expenseCategories');
    if (!container) return;
    
    // Calculate total amount
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create list items for each category
    if (totalAmount > 0) {
        // Only display top 4 categories and group the rest as "Other"
        let displayCategories = [];
        let displayAmounts = [];
        let displayColors = [];
        
        if (categories.length > 5) {
            // Sort categories by amount (descending)
            const sortedIndices = amounts.map((amount, index) => index)
                .sort((a, b) => amounts[b] - amounts[a]);
            
            // Take top 4 categories
            for (let i = 0; i < 4; i++) {
                if (i < sortedIndices.length) {
                    const idx = sortedIndices[i];
                    displayCategories.push(categories[idx]);
                    displayAmounts.push(amounts[idx]);
                    displayColors.push(colors[idx]);
                }
            }
            
            // Group remaining categories as "Other"
            let otherAmount = 0;
            for (let i = 4; i < sortedIndices.length; i++) {
                const idx = sortedIndices[i];
                otherAmount += amounts[idx];
            }
            
            if (otherAmount > 0) {
                displayCategories.push('Other');
                displayAmounts.push(otherAmount);
                displayColors.push('#999999');
            }
        } else {
            // Use all categories if 5 or fewer
            displayCategories = categories;
            displayAmounts = amounts;
            displayColors = colors;
        }
        
        // Create list items
        displayCategories.forEach((category, index) => {
            const amount = displayAmounts[index];
            const percentage = Math.round((amount / totalAmount) * 100);
            const color = displayColors[index];
            
            const item = document.createElement('div');
            item.className = 'expense-category-item';
            item.innerHTML = `
                <div class="category-color" style="background-color: ${color}"></div>
                <div class="category-name">${category}</div>
                <div class="category-amount">${formatCurrency(amount)}</div>
                <div class="category-percentage">${percentage}%</div>
            `;
            
            container.appendChild(item);
        });
    } else {
        // Show empty state
        container.innerHTML = `
            <div class="empty-state small">
                <p>No expense data available</p>
            </div>
        `;
    }
}

/**
 * Update budget progress UI
 * @param {Array} categories - Budget categories
 * @param {Array} budgetAmounts - Budget amounts
 * @param {Array} spentAmounts - Spent amounts
 */
function updateBudgetProgressUI(categories, budgetAmounts, spentAmounts) {
    const container = document.getElementById('budgetProgress');
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Calculate total budget and total spent
    const totalBudget = budgetAmounts.reduce((sum, amount) => sum + amount, 0);
    const totalSpent = spentAmounts.reduce((sum, amount) => sum + amount, 0);
    
    // Add total progress
    const totalPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    let totalProgressClass = 'progress-good';
    
    if (totalPercentage >= 90) {
        totalProgressClass = 'progress-danger';
    } else if (totalPercentage >= 75) {
        totalProgressClass = 'progress-warning';
    }
    
    // Add total budget summary
    const totalBudgetSummary = document.createElement('div');
    totalBudgetSummary.className = 'budget-summary';
    totalBudgetSummary.innerHTML = `
        <div class="budget-header">
            <h4>Total Budget</h4>
            <div class="budget-numbers">
                <span class="spent">${formatCurrency(totalSpent)}</span>
                <span class="separator">/</span>
                <span class="budget">${formatCurrency(totalBudget)}</span>
            </div>
        </div>
        <div class="progress-container">
            <div class="progress-bar ${totalProgressClass}" style="width: ${totalPercentage}%"></div>
        </div>
        <div class="progress-info">
            <span class="percentage">${totalPercentage}%</span>
            <span class="remaining">Remaining: ${formatCurrency(totalBudget - totalSpent)}</span>
        </div>
    `;
    
    container.appendChild(totalBudgetSummary);
    
    // Add separator
    const separator = document.createElement('div');
    separator.className = 'separator-line';
    container.appendChild(separator);
    
    // Add individual category progress
    if (categories.length > 0) {
        const categoryList = document.createElement('div');
        categoryList.className = 'budget-category-list';
        
        categories.forEach((category, index) => {
            const budget = budgetAmounts[index];
            const spent = spentAmounts[index];
            const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
            
            let progressClass = 'progress-good';
            if (percentage >= 90) {
                progressClass = 'progress-danger';
            } else if (percentage >= 75) {
                progressClass = 'progress-warning';
            }
            
            const categoryItem = document.createElement('div');
            categoryItem.className = 'budget-category-item';
            categoryItem.innerHTML = `
                <div class="category-header">
                    <div class="category-name">${category}</div>
                    <div class="category-numbers">
                        <span class="spent">${formatCurrency(spent)}</span>
                        <span class="separator">/</span>
                        <span class="budget">${formatCurrency(budget)}</span>
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-bar ${progressClass}" style="width: ${percentage}%"></div>
                </div>
            `;
            
            categoryList.appendChild(categoryItem);
        });
        
        container.appendChild(categoryList);
    } else {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state small';
        emptyState.innerHTML = '<p>No budget data available</p>';
        container.appendChild(emptyState);
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    console.log("Logging out...");
    
    // Show confirmation modal
    showNotification('Logging out...', 'info');
    
    // Clear user data
    StorageUtil.clearCurrentUser();
    
    // Redirect to login page after a short delay
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

/**
 * Helper function to get expense data by category
 * @param {Array} transactions - List of transactions
 * @param {string} period - Time period (day, week, month, year)
 * @returns {object} Object with categories, amounts, and colors
 */
function getExpenseDataByCategory(transactions, period) {
    if (!transactions || transactions.length === 0) {
        return { categories: [], amounts: [], colors: [] };
    }
    
    // Get only transactions for the specified period
    const filteredTransactions = filterTransactionsByPeriod(transactions, period);
    
    // Get only expense transactions
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    
    if (expenses.length === 0) {
        return { categories: [], amounts: [], colors: [] };
    }
    
    // Group expenses by category
    const categoryMap = {};
    expenses.forEach(transaction => {
        const category = transaction.category;
        if (!categoryMap[category]) {
            categoryMap[category] = 0;
        }
        categoryMap[category] += transaction.amount;
    });
    
    // Convert to arrays for chart
    const categories = Object.keys(categoryMap);
    const amounts = categories.map(category => categoryMap[category]);
    
    // Define colors for categories
    const categoryColors = {
        'Food': '#FF5722',
        'Housing': '#9C27B0',
        'Transportation': '#3F51B5',
        'Entertainment': '#2196F3',
        'Utilities': '#4CAF50',
        'Healthcare': '#F44336',
        'Shopping': '#FFC107',
        'Other': '#607D8B'
    };
    
    // Generate a color if not defined
    const generateColor = (index) => {
        const baseColors = [
            '#FF5722', '#9C27B0', '#3F51B5', '#2196F3', 
            '#4CAF50', '#F44336', '#FFC107', '#607D8B',
            '#795548', '#009688', '#E91E63', '#673AB7'
        ];
        return baseColors[index % baseColors.length];
    };
    
    const colors = categories.map((category, index) => {
        return categoryColors[category] || generateColor(index);
    });
    
    return { categories, amounts, colors };
}

/**
 * Filter transactions based on time period
 * @param {Array} transactions - List of transactions
 * @param {string} period - Time period (day, week, month, year)
 * @returns {Array} Filtered transactions
 */
function filterTransactionsByPeriod(transactions, period) {
    if (!transactions || transactions.length === 0) {
        return [];
    }
    
    const now = new Date();
    let startDate;
    
    switch (period) {
        case 'day':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'week':
            const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to start on Monday
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= now;
    });
}

/**
 * Get income and expense data grouped by period
 * @param {Array} transactions - List of transactions
 * @param {string} period - Time period (day, week, month, year)
 * @returns {object} Object with labels and data for income and expenses
 */
function getIncomeExpenseDataByPeriod(transactions, period) {
    // Filter transactions by period
    const filteredTransactions = filterTransactionsByPeriod(transactions, period);
    
    // Group transactions by day, week, month, or year
    const groups = {};
    const incomeData = [];
    const expenseData = [];
    const labels = [];
    
    // Helper to get label format based on period
    const getLabelFormat = (date, periodType) => {
        const options = {};
        switch (periodType) {
            case 'day':
                options.hour = '2-digit';
                break;
            case 'week':
                options.weekday = 'short';
                break;
            case 'month':
                options.day = 'numeric';
                break;
            case 'year':
                options.month = 'short';
                break;
        }
        return date.toLocaleDateString('en-US', options);
    };
    
    // Prepare time divisions based on period
    const now = new Date();
    let divisions = [];
    
    switch (period) {
        case 'day':
            // Last 24 hours in 4-hour intervals
            for (let i = 0; i < 6; i++) {
                const date = new Date(now);
                date.setHours(now.getHours() - (i * 4));
                date.setMinutes(0, 0, 0);
                divisions.unshift(date);
            }
            break;
        case 'week':
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                date.setHours(0, 0, 0, 0);
                divisions.push(date);
            }
            break;
        case 'month':
            // Last 30 days in 6-day intervals
            for (let i = 0; i < 5; i++) {
                const date = new Date(now);
                date.setDate(now.getDate() - (i * 6));
                date.setHours(0, 0, 0, 0);
                divisions.unshift(date);
            }
            break;
        case 'year':
            // Last 12 months
            for (let i = 0; i < 12; i++) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                divisions.unshift(date);
            }
            break;
        default:
            for (let i = 0; i < 6; i++) {
                const date = new Date(now);
                date.setDate(now.getDate() - i * 5);
                divisions.unshift(date);
            }
    }
    
    // Initialize groups with zero values
    divisions.forEach((date, index) => {
        const label = getLabelFormat(date, period);
        groups[label] = { income: 0, expense: 0 };
        
        // If last division, add it as the ending point
        if (index === divisions.length - 1 && period !== 'day') {
            const nextDate = new Date(date);
            switch (period) {
                case 'week':
                    nextDate.setDate(date.getDate() + 1);
                    break;
                case 'month':
                    nextDate.setDate(date.getDate() + 6);
                    break;
                case 'year':
                    nextDate.setMonth(date.getMonth() + 1);
                    break;
            }
            const nextLabel = getLabelFormat(nextDate, period);
            groups[nextLabel] = { income: 0, expense: 0 };
        }
    });
    
    // Populate groups with transaction data
    filteredTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const label = getLabelFormat(transactionDate, period);
        
        if (!groups[label]) {
            groups[label] = { income: 0, expense: 0 };
        }
        
        if (transaction.type === 'income') {
            groups[label].income += transaction.amount;
        } else if (transaction.type === 'expense') {
            groups[label].expense += transaction.amount;
        }
    });
    
    // Convert groups to arrays for chart
    Object.keys(groups).forEach(label => {
        labels.push(label);
        incomeData.push(groups[label].income);
        expenseData.push(groups[label].expense);
    });
    
    return { labels, incomeData, expenseData };
}

/**
 * Helper function to get budget data
 * @param {Array} transactions - List of transactions
 * @param {Array} budgets - List of budget items
 * @param {string} period - Time period (day, week, month, year)
 * @returns {object} Object with categories, budget amounts, and spent amounts
 */
function getBudgetData(transactions, budgets, period) {
    if (!transactions || transactions.length === 0 || !budgets || budgets.length === 0) {
        return { categories: [], budgetAmounts: [], spentAmounts: [] };
    }
    
    // Get only transactions for the specified period
    const filteredTransactions = filterTransactionsByPeriod(transactions, period);
    
    // Get only expense transactions
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    
    // Initialize result arrays
    const categories = [];
    const budgetAmounts = [];
    const spentAmounts = [];
    
    // Calculate spent amount for each budget category
    budgets.forEach(budget => {
        categories.push(budget.category);
        
        // Adjust budget amount based on period
        let budgetAmount = budget.amount;
        switch (period) {
            case 'day':
                budgetAmount = budget.amount / 30; // Approximate daily budget
                break;
            case 'week':
                budgetAmount = (budget.amount * 7) / 30; // Approximate weekly budget
                break;
            case 'year':
                budgetAmount = budget.amount * 12; // Annual budget
                break;
            // For month, use the full budget amount
        }
        
        budgetAmounts.push(budgetAmount);
        
        // Sum up expenses for this category
        const categoryExpenses = expenses.filter(expense => expense.category === budget.category);
        const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        spentAmounts.push(spent);
    });
    
    return { categories, budgetAmounts, spentAmounts };
}

/**
 * Setup real-time data updates (simulated)
 */
function setupRealTimeUpdates() {
    // This function would typically connect to a real-time data source
    // For demo purposes, we'll simulate updates every 2 minutes
    setInterval(() => {
        const currentUser = StorageUtil.getCurrentUser();
        if (!currentUser) return;
        
        console.log("Checking for data updates...");
        
        // In a real app, this would check for new data from server
        // For demo, occasionally add a random transaction for visual feedback
        if (Math.random() > 0.7) {
            console.log("Simulating new transaction data...");
            
            // Get existing transactions
            const userData = StorageUtil.getUserData(currentUser.id);
            if (!userData || !userData.transactions) return;
            
            // Add a notification
            const notificationCount = document.querySelector('.notification-count');
            if (notificationCount) {
                notificationCount.style.display = 'flex';
                notificationCount.textContent = '1';
            }
            
            // Update the dashboard with new data
            loadDashboardData();
            
            // Show a subtle notification
            showNotification('New transaction data available', 'info');
        }
    }, 120000); // Check every 2 minutes
}

/**
 * Show a notification to the user
 * @param {string} message - The message to show
 * @param {string} type - The type of notification (success, error, warning, info)
 * @param {number} duration - How long to show the notification in ms
 */
function showNotification(message, type = 'info', duration = 3000) {
    console.log(`Showing notification: ${message} (${type})`);
    
    // Get or create notifications container
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    switch (type) {
        case 'success': 
            icon = 'check-circle'; 
            break;
        case 'error': 
            icon = 'times-circle'; 
            break;
        case 'warning': 
            icon = 'exclamation-triangle'; 
            break;
    }
    
    // Set notification content
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Trigger animation after a small delay to ensure it works
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    // Set timeout to remove notification
    setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    // Add click event to close button
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            closeNotification(notification);
        });
    }
    
    return notification;
}

/**
 * Close a notification
 * @param {HTMLElement} notification - The notification element to close
 */
function closeNotification(notification) {
    // Remove the active class to trigger exit animation
    notification.classList.remove('active');
    
    // Remove the element after animation completes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
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
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

/**
 * Get date range for the specified period
 * @param {string} period - Time period (day, week, month, year)
 * @returns {object} Object with start and end dates for current and previous period
 */
function getDateRangeForPeriod(period) {
    const now = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;
    
    switch (period) {
        case 'day':
            currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            previousStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            previousEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'week':
            const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to start on Monday
            currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
            currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff + 7);
            previousStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff - 7);
            previousEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
            break;
        case 'month':
            currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
            currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousEnd = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'year':
            currentStart = new Date(now.getFullYear(), 0, 1);
            currentEnd = new Date(now.getFullYear() + 1, 0, 1);
            previousStart = new Date(now.getFullYear() - 1, 0, 1);
            previousEnd = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
            currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return { currentStart, currentEnd, previousStart, previousEnd };
}

/**
 * Initialize the dashboard
 */
function initializeDashboard() {
    console.log("Initializing dashboard...");
    
    // Check for logged-in user
    const currentUser = StorageUtil.getCurrentUser();
    console.log("Current user:", currentUser);
    
    if (!currentUser) {
        // If no user, initialize demo mode or redirect to login
        console.log("No user logged in, initializing demo mode.");
        initializeDemoUser(); // Initialize demo user and data
    } else {
        // Load user-specific data
        updateUserInfo(currentUser);
    }
    
    // Always load dashboard data (either demo or real user)
    loadDashboardData();
    
    // Setup UI elements and event listeners
    setupEventListeners(); // Call the main event listener setup
    setupPeriodButtons();  // Call specific setup for period buttons
    setupLogout();         // Call specific setup for logout
    
    console.log("Dashboard initialized.");
}

/**
 * Initialize empty states for charts and stats when no data is available
 */
function initializeEmptyStates() {
    console.log("Initializing empty states...");
    
    // Clear stat cards
    updateStatCard('totalBalance', 0, 0);
    updateStatCard('totalIncome', 0, 0);
    updateStatCard('totalExpenses', 0, 0);
    updateStatCard('savings', '0%', 0);
    
    // Show empty state in chart containers
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-pie"></i><p>No data available for this period.</p></div>';
    });
    
    // Ensure charts are destroyed if they exist
    if (charts.incomeExpenseChart) charts.incomeExpenseChart.destroy();
    if (charts.expenseBreakdownChart) charts.expenseBreakdownChart.destroy();
    if (charts.budgetChart) charts.budgetChart.destroy();
}

/**
 * Setup logout functionality
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutLink = document.getElementById('logoutLink');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            logoutUser();
        });
    }
}

/**
 * Logout the current user
 */
function logoutUser() {
    console.log("Logging out user...");
    StorageUtil.removeCurrentUser(); // Changed from clearCurrentUser for potentially better cleanup
    showNotification('Successfully logged out.', 'success');
    // Redirect to login page after a short delay
    setTimeout(() => {
        window.location.href = 'login.html'; 
    }, 1000);
}

// Initialize the dashboard when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing dashboard...");
    try {
        initializeDashboard();
    } catch (error) {
        console.error("Error initializing dashboard:", error);
        // Try to recover by creating a demo user and loading charts
        try {
            initializeDemoUser();
            setTimeout(() => {
                loadChartsWithPeriod('month');
                setupEventListeners();
                setupPeriodButtons();
                setupLogout();
            }, 500);
        } catch (recoveryError) {
            console.error("Recovery failed:", recoveryError);
        }
    }
});
