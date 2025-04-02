/**
 * FinDash - Financial Dashboard
 * Created by Ahmad Irfan
 * Services page JavaScript file for interactive dashboard preview
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts when the page loads
    initializeCharts();
    
    // Setup tab functionality
    setupTabs();
});

/**
 * Initialize all charts on the services page
 */
function initializeCharts() {
    // Overview Chart
    const overviewCtx = document.getElementById('overviewChart');
    if (overviewCtx) {
        const overviewChart = new Chart(overviewCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Income',
                        data: [4200, 4500, 4300, 4800, 4600, 4500],
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: [3100, 3300, 3200, 3400, 3500, 3280],
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Income vs Expenses (2025)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Expense Chart
    const expenseCtx = document.getElementById('expenseChart');
    if (expenseCtx) {
        const expenseChart = new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: ['Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment', 'Other'],
                datasets: [{
                    data: [1200, 650, 420, 350, 280, 380],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Monthly Expenses by Category'
                    }
                }
            }
        });
    }
    
    // Budget Chart
    const budgetCtx = document.getElementById('budgetChart');
    if (budgetCtx) {
        const budgetChart = new Chart(budgetCtx, {
            type: 'bar',
            data: {
                labels: ['Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment', 'Other'],
                datasets: [
                    {
                        label: 'Budget',
                        data: [1300, 700, 500, 400, 300, 400],
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Actual',
                        data: [1200, 650, 420, 350, 280, 380],
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
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
                    },
                    title: {
                        display: true,
                        text: 'Budget vs Actual Spending'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Investment Chart
    const investmentCtx = document.getElementById('investmentChart');
    if (investmentCtx) {
        const investmentChart = new Chart(investmentCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Stocks',
                        data: [10000, 10400, 10200, 10800, 11200, 11500],
                        borderColor: '#4361ee',
                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Bonds',
                        data: [5000, 5050, 5100, 5150, 5200, 5250],
                        borderColor: '#3f37c9',
                        backgroundColor: 'rgba(63, 55, 201, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Real Estate',
                        data: [15000, 15100, 15300, 15600, 15900, 16200],
                        borderColor: '#4cc9f0',
                        backgroundColor: 'rgba(76, 201, 240, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Investment Portfolio Performance'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * Setup tab functionality
 */
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    if (tabBtns.length > 0) {
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
            });
        });
    }
}
