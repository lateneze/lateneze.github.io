// ============================================
// FETCH PEOPLE DATA (existing function - updated)
// ============================================
async function fetchPeopleData() {
    const tableBody = document.getElementById('people-table-body');
    const spinner = document.getElementById('loading-spinner');
    const table = document.getElementById('people-table');
    const errorDiv = document.getElementById('error-message');
    
    try {
        const supabaseUrl = 'https://mylpzcqmawbwbsoexgtf.supabase.co/rest/v1/People';
        const apiKey = 'sb_publishable_vsq1c8bLkTyPCc-HF734mQ_2ykS3sIR';
        
        const response = await fetch(supabaseUrl, {
            headers: {
                'apikey': apiKey,
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        spinner.style.display = 'none';
        table.style.display = 'table';
        tableBody.innerHTML = '';
        
        if (!data || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 30px; color: #64748b;">
                        No people found in the database.
                    </td>
                </tr>
            `;
            return;
        }
        
        data.forEach(person => {
            const row = document.createElement('tr');
            const createdAt = person.created_at 
                ? new Date(person.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A';
            
            row.innerHTML = `
                <td>${person.id || 'N/A'}</td>
                <td><strong>${person.name || 'Unknown'}</strong></td>
                <td>${createdAt}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error fetching people data:', error);
        spinner.style.display = 'none';
        table.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Failed to load data: ${error.message}. Please try again later.`;
    }
}

// ============================================
// INSERT PERSON FUNCTION (NEW)
// ============================================
async function insertPerson(name) {
    const supabaseUrl = 'https://mylpzcqmawbwbsoexgtf.supabase.co/rest/v1/People';
    const apiKey = 'sb_publishable_vsq1c8bLkTyPCc-HF734mQ_2ykS3sIR';
    
    const response = await fetch(supabaseUrl, {
        method: 'POST',
        headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'  // Returns the inserted row
        },
        body: JSON.stringify({ name: name.trim() })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// ============================================
// FORM HANDLING (NEW)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Fetch people data if section exists
    if (document.getElementById('people-table-body')) {
        fetchPeopleData();
    }
    
    // Handle insert form submission
    const form = document.getElementById('insert-person-form');
    const nameInput = document.getElementById('person-name');
    const submitBtn = document.getElementById('submit-person-btn');
    const resetBtn = document.getElementById('reset-form-btn');
    const formMessage = document.getElementById('form-message');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get the name value
            const name = nameInput.value.trim();
            
            // Validate
            if (!name) {
                showFormMessage('Please enter a name.', 'error');
                return;
            }
            
            if (name.length < 2) {
                showFormMessage('Name must be at least 2 characters long.', 'error');
                return;
            }
            
            // Disable form during submission
            nameInput.disabled = true;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding...';
            
            // Clear previous messages
            formMessage.className = '';
            formMessage.style.display = 'none';
            
            try {
                // Insert the person
                const result = await insertPerson(name);
                
                // Success message
                showFormMessage(`✅ Successfully added "${name}" to the database!`, 'success');
                
                // Reset the form
                form.reset();
                
                // Refresh the table to show the new data
                setTimeout(() => {
                    fetchPeopleData();
                }, 500);
                
            } catch (error) {
                console.error('Error inserting person:', error);
                
                // Handle specific errors
                let errorMsg = error.message || 'Failed to add person. Please try again.';
                
                if (errorMsg.includes('duplicate key')) {
                    errorMsg = 'A person with this name already exists. Please use a different name.';
                } else if (errorMsg.includes('permission denied')) {
                    errorMsg = 'You don\'t have permission to add people to the database.';
                }
                
                showFormMessage(`❌ ${errorMsg}`, 'error');
                
            } finally {
                // Re-enable form
                nameInput.disabled = false;
                submitBtn.disabled = false;
                submitBtn.textContent = '➕ Add Person';
            }
        });
        
        // Reset form handler
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                form.reset();
                formMessage.className = '';
                formMessage.style.display = 'none';
                nameInput.disabled = false;
                submitBtn.disabled = false;
                submitBtn.textContent = '➕ Add Person';
            });
        }
        
        // Real-time validation on input
        nameInput.addEventListener('input', () => {
            const value = nameInput.value.trim();
            if (value.length > 0 && value.length < 2) {
                nameInput.style.borderColor = '#dc2626';
            } else if (value.length >= 2) {
                nameInput.style.borderColor = '#2563eb';
            } else {
                nameInput.style.borderColor = '#e2e8f0';
            }
        });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================
function showFormMessage(message, type) {
    const formMessage = document.getElementById('form-message');
    if (!formMessage) return;
    
    formMessage.textContent = message;
    formMessage.className = type; // 'success', 'error', or 'loading'
    formMessage.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            formMessage.style.display = 'none';
            formMessage.className = '';
        }, 5000);
    }
}


// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Simple validation
        if (!name || !email || !subject || !message) {
            alert('Please fill in all fields.');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Simulate form submission
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            alert('Thank you for your message! I\'ll get back to you soon.');
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.project-card, .blog-post, .stat').forEach(el => {
    observer.observe(el);
});

// Add active class to current nav link
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 50);
    }
});

// Smooth reveal animation for sections
const revealSection = function(entries, observer) {
    const [entry] = entries;
    
    if (!entry.isIntersecting) return;
    
    entry.target.style.opacity = '1';
    entry.target.style.transform = 'translateY(0)';
    
    observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
    root: null,
    threshold: 0.15,
});

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'all 0.8s ease-out';
    sectionObserver.observe(section);
});

// Add some interactive hover effects
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.position = 'absolute';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .nav-link.active {
        color: #2563eb;
    }
    
    .nav-link.active::after {
        width: 100%;
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background-color: white;
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            padding: 2rem 0;
        }
        
        .nav-menu.active {
            left: 0;
        }
        
        .hamburger.active .bar:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active .bar:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }
        
        .hamburger.active .bar:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
    }
`;
document.head.appendChild(style);
