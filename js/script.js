/**
 * FinDash - Financial Dashboard
 * Created by Ahmad Irfan
 * Main JavaScript file for common functionality across all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const body = document.body;
    const headerRight = document.querySelector('.header-right');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            body.classList.toggle('nav-open');
            
            // Clone the header-right content for mobile view
            if (nav.classList.contains('active') && window.innerWidth <= 768) {
                const mobileHeaderRight = headerRight.cloneNode(true);
                mobileHeaderRight.classList.add('mobile-visible');
                
                // Only append if it doesn't exist already
                if (!document.querySelector('.mobile-visible')) {
                    nav.appendChild(mobileHeaderRight);
                }
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (nav.classList.contains('active') && 
                !nav.contains(event.target) && 
                !menuToggle.contains(event.target)) {
                nav.classList.remove('active');
                body.classList.remove('nav-open');
            }
        });
        
        // Close menu when escape key is pressed
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && nav.classList.contains('active')) {
                nav.classList.remove('active');
                body.classList.remove('nav-open');
            }
        });
        
        // Add active class to current page link
        const currentLocation = window.location.pathname;
        const navLinks = document.querySelectorAll('nav ul li a');
        
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (currentLocation.includes(linkPath) && linkPath !== '#' && linkPath !== '') {
                link.classList.add('active');
            }
        });
    }
    
    // Testimonial Slider
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    
    if (testimonials.length > 0 && dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                // Hide all testimonials
                testimonials.forEach(testimonial => {
                    testimonial.style.display = 'none';
                });
                
                // Remove active class from all dots
                dots.forEach(d => {
                    d.classList.remove('active');
                });
                
                // Show the selected testimonial and activate the dot
                testimonials[index].style.display = 'block';
                dot.classList.add('active');
            });
        });
        
        // Auto slide every 5 seconds
        let currentSlide = 0;
        setInterval(() => {
            currentSlide = (currentSlide + 1) % testimonials.length;
            
            // Hide all testimonials
            testimonials.forEach(testimonial => {
                testimonial.style.display = 'none';
            });
            
            // Remove active class from all dots
            dots.forEach(d => {
                d.classList.remove('active');
            });
            
            // Show the current testimonial and activate the dot
            testimonials[currentSlide].style.display = 'block';
            dots[currentSlide].classList.add('active');
        }, 5000);
    }
    
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle the current item
                item.classList.toggle('active');
            });
        });
    }
    
    // Services Page Tabs
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
    
    // Dashboard Preview Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Show corresponding content
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    // Form submission handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (name && email && message) {
                // In a real app, you would send this data to a server
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            } else {
                alert('Please fill in all required fields.');
            }
        });
    }
    
    // Check if user is logged in
    function checkAuth() {
        const currentUser = localStorage.getItem('currentUser');
        const loginBtn = document.querySelector('.btn-login');
        
        if (currentUser && loginBtn) {
            const user = JSON.parse(currentUser);
            loginBtn.textContent = user.name;
            
            // If on non-dashboard page, add dashboard link
            if (!document.querySelector('.dashboard-page')) {
                loginBtn.setAttribute('href', 'dashboard.html');
            }
        }
    }
    
    // Run auth check
    checkAuth();
});
