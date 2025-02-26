// Material 3 Navigation and Responsive Menu
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle function
    window.toggleMenu = function(hamburger) {
        hamburger.classList.toggle('active');
        document.querySelector('.nav-list').classList.toggle('open');
    };
    
    // Mobile menu toggle via hamburger button
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navList.classList.toggle('open');
        });
    }
    
    // Handle dropdown menus on mobile
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        if (window.innerWidth <= 768) {
            const link = dropdown.querySelector('a');
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                    
                    // Close other dropdowns
                    dropdowns.forEach(other => {
                        if (other !== dropdown && other.classList.contains('active')) {
                            other.classList.remove('active');
                        }
                    });
                }
            });
        }
    });
    
    // Handle nested dropdowns on mobile
    const nestedDropdowns = document.querySelectorAll('.nested-dropdown');
    nestedDropdowns.forEach(nested => {
        if (window.innerWidth <= 768) {
            const nestedLink = nested.querySelector('a');
            nestedLink.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    nested.classList.toggle('active');
                }
            });
        }
    });
    
    // Material 3 ripple effect for buttons
    const buttons = document.querySelectorAll('button, .m3-button, .m3-icon-button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Enhanced scroll animation for content elements
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.content, .feature-card, .achievement-card, .stat-card, .campus-card');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
            
            if (isVisible) {
                element.classList.add('in-view');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check on page load
    
    // Implement Material 3 style form validation
    const formInputs = document.querySelectorAll('.m3-text-field input');
    formInputs.forEach(input => {
        const validateInput = () => {
            const field = input.closest('.m3-text-field');
            if (input.validity.valid) {
                field.classList.remove('invalid');
                field.classList.add('valid');
            } else {
                field.classList.remove('valid');
                field.classList.add('invalid');
            }
        };
        
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', validateInput);
    });
    
    // Newsletter form submission with feedback
    const newsletterForm = document.querySelector('.m3-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailField = this.querySelector('input[type="email"]');
            
            if (emailField && emailField.validity.valid) {
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.textContent = 'Thank you for subscribing!';
                successMsg.classList.add('m3-success-message');
                
                this.appendChild(successMsg);
                emailField.value = '';
                
                setTimeout(() => {
                    successMsg.remove();
                }, 3000);
            }
        });
    }
});

// Existing caption changing functionality
const captions = [
    { title: "Join Us Today", text: "Experience world-class education and vibrant campus life." },
    { title: "Your Future Starts Here", text: "Explore endless learning opportunities at Saket College." },
    { title: "Learn, Grow, Succeed", text: "Join a community that fosters innovation and success." },
    { title: "Be a Part of Excellence", text: "Shape your career with our top-notch faculty and resources." }
];

let currentIndex = 0;

function changeCaption() {
    const titleElement = document.getElementById("caption-title");
    const textElement = document.getElementById("caption-text");
    
    if (titleElement && textElement) {
        currentIndex = (currentIndex + 1) % captions.length; // Loop through captions
        
        titleElement.style.opacity = "0";
        textElement.style.opacity = "0";
        
        setTimeout(() => {
            titleElement.textContent = captions[currentIndex].title;
            textElement.textContent = captions[currentIndex].text;
            
            titleElement.style.opacity = "1";
            textElement.style.opacity = "1";
        }, 500); // Delay for smooth transition
    }
}

if (document.getElementById("caption-title") && document.getElementById("caption-text")) {
    setInterval(changeCaption, 4000); // Change text every 4 seconds
}

// Notice board date/time and scrolling functionality
function updateDateTime() {
    const dateTimeElement = document.getElementById("dateTime");
    if (dateTimeElement) {
        const now = new Date();
        dateTimeElement.textContent = now.toLocaleString();
    }
}

if (document.getElementById("dateTime")) {
    setInterval(updateDateTime, 1000);
    updateDateTime();
}

let noticeContainer = document.querySelector('.notices-content');
let animation;

function pauseScroll() {
    if (noticeContainer) {
        animation = noticeContainer.style.animation;
        noticeContainer.style.animation = 'none';
    }
}

function resumeScroll() {
    if (noticeContainer) {
        noticeContainer.style.animation = animation;
    }
}

// Feature card animation
function checkVisibility() {
    const cards = document.querySelectorAll(".feature-card");
    
    cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100 && rect.bottom > 100) {
            card.classList.add("visible");
            card.classList.remove("reset");
        } else {
            card.classList.remove("visible");
            card.classList.add("reset");
        }
    });
}

window.addEventListener("scroll", checkVisibility);
window.addEventListener("load", checkVisibility); // Initial check on page load