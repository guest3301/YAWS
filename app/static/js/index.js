// Main website JavaScript file
'use strict';

// Wait for DOM content to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initAnimations();
  initFormValidation();
  initCarousel();
  initNoticeBoard();
  initCaptions();
  initDateTime();
  
  // Only initialize parallax on larger screens
  if (window.innerWidth > 768) {
    initParallax();
  }
});

// Global variables
let isScrollPaused = false;
let scrollInterval = null;

/**
 * Animation on scroll functionality
 */
function initAnimations() {
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.content, .feature-card, .achievement-card, .stat-card, .campus-card');
    
    if (elements.length === 0) {
      return;
    }
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
        element.classList.add('in-view');
      } else {
        element.classList.remove('in-view');
      }
    });
  };
  
  // Add scroll event listener with throttling
  let scrollThrottleTimer;
  window.addEventListener('scroll', () => {
    if (!scrollThrottleTimer) {
      scrollThrottleTimer = setTimeout(() => {
        animateOnScroll();
        scrollThrottleTimer = null;
      }, 100);
    }
  });
  
  // Run once on initial load
  animateOnScroll();
}

/**
 * Form validation for input fields
 */
function initFormValidation() {
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
  
  const newsletterForm = document.querySelector('.m3-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const emailField = this.querySelector('input[type="email"]');
      
      if (emailField && emailField.validity.valid) {
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
}

/**
 * Carousel/Slideshow functionality
 */
function initCarousel() {
  let currentSlide = 0;
  const slides = document.querySelectorAll('.carousel-item');
  const indicatorsContainer = document.querySelector('.carousel-indicators');
  
  if (slides.length === 0 || !indicatorsContainer) {
    console.error("Carousel elements not found");
    return;
  }
  
  // Create indicators
  slides.forEach((_, index) => {
    const indicator = document.createElement('div');
    indicator.classList.add('indicator');
    indicator.onclick = () => goToSlide(index);
    indicatorsContainer.appendChild(indicator);
  });
  
  const indicators = document.querySelectorAll('.indicator');
  
  function updateSlides() {
    if (!slides[currentSlide] || !indicators[currentSlide]) {
      return;
    }
    
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
  }
  
  function moveSlide(direction) {
    currentSlide += direction;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    updateSlides();
  }
  
  function goToSlide(index) {
    if (index < 0 || index >= slides.length) {
      return;
    }
    currentSlide = index;
    updateSlides();
  }
  
  // Auto advance slides
  setInterval(() => moveSlide(1), 10000);
  
  // Initialize first slide
  updateSlides();
  
  // Make moveSlide available globally
  window.moveSlide = moveSlide;
}

/**
 * Notice board auto-scrolling functionality
 */
function initNoticeBoard() {
  function startScrolling() {
    if (!isScrollPaused) {
      // Clear existing interval if any
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
      
      scrollInterval = setInterval(() => {
        const wrapper = document.querySelector('.notices-wrapper');
        if (!wrapper) return;
        
        if (wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight) {
          wrapper.scrollTop = 0;
        } else {
          wrapper.scrollTop += 1;
        }
      }, 50);
    }
  }
  
  // Export these functions to global scope for use in HTML
  window.pauseScroll = function() {
    isScrollPaused = true;
    if (scrollInterval) {
      clearInterval(scrollInterval);
    }
  };
  
  window.resumeScroll = function() {
    isScrollPaused = false;
    startScrolling();
  };
  
  // Start scrolling initially
  startScrolling();
}

/**
 * Hero caption animation
 */
function initCaptions() {
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
    
    if (!titleElement || !textElement) return;
    
    currentIndex = (currentIndex + 1) % captions.length;
    
    titleElement.style.opacity = "0";
    textElement.style.opacity = "0";
    
    setTimeout(() => {
      titleElement.textContent = captions[currentIndex].title;
      textElement.textContent = captions[currentIndex].text;
      
      titleElement.style.opacity = "1";
      textElement.style.opacity = "1";
    }, 500);
  }
  
  setInterval(changeCaption, 4000);
}

/**
 * Date and time display functionality
 */
function initDateTime() {
  const dateTimeElement = document.getElementById("dateTime");
  if (!dateTimeElement) return;
  
  function updateDateTime() {
    const now = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    dateTimeElement.textContent = now.toLocaleString('en-US', options);
  }
  
  setInterval(updateDateTime, 1000);
  updateDateTime(); // Initialize immediately
}

/**
 * Parallax scrolling effect
 */
function initParallax() {
  const parallaxSections = document.querySelectorAll('.parallax-section');
  if (parallaxSections.length === 0) return;
  
  let ticking = false;
  
  function updateParallax() {
    parallaxSections.forEach(section => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.3;
      const rect = section.getBoundingClientRect();
      
      // Only apply effect when section is in view
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        section.style.backgroundPosition = `50% ${rate}px`;
      }
    });
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  
  // Initial update
  updateParallax();
}