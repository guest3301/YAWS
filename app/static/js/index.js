 //-------------------------------------------no changes in this file-------------------------------------------
 document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navList.classList.toggle('open');
        });
    } 

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!e.target.closest('.nav')) {
                navList.classList.remove('open');
                hamburger.classList.remove('active');
                document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
            }
        }
    });

    // Mobile dropdown handling
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        if (link) {
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                    
                    dropdowns.forEach(other => {
                        if (other !== dropdown && other.classList.contains('active')) {
                            other.classList.remove('active');
                        }
                    });
                }
            });
        }
    });

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
    //-------------------------------------------no changes in this file-------------------------------------------


    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.content, .feature-card, .achievement-card, .stat-card, .campus-card');
    
        if (elements.length === 0) {
            console.error("No elements found for animation.");
            return;
        }
    
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
            if (isVisible) {
                element.classList.add('in-view');
            } else {
                element.classList.remove('in-view'); // Optional
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    document.addEventListener('DOMContentLoaded', animateOnScroll);
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
    
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

    // Start notice board auto-scroll
    startScrolling();
});
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

setInterval(changeCaption, 4000); // Change text every 4 seconds

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
    isScrollPaused = true;
    clearInterval(scrollInterval);
}

function resumeScroll() {
    isScrollPaused = false;
    startScrolling();
}

function startScrolling() {
    if (!isScrollPaused) {
        scrollInterval = setInterval(() => {
            const wrapper = document.querySelector('.notices-wrapper');
            if (wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight) {
                wrapper.scrollTop = 0;
            } else {
                wrapper.scrollTop += 1;
            }
        }, 50);
    }
}
//varousellll part
document.addEventListener("DOMContentLoaded", () => {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-item');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
  
    console.log("Slides found:", slides.length);
    console.log("Indicators container found:", indicatorsContainer !== null);
  
    if (slides.length === 0 || !indicatorsContainer) {
      console.error("❌ Error: Slides or indicators container not found!");
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
    console.log("Indicators created:", indicators.length);
  
    function updateSlides() {
      if (!slides[currentSlide]) {
        console.error(`❌ Error: Slide at index ${currentSlide} does not exist!`);
        return;
      }
      if (!indicators[currentSlide]) {
        console.error(`❌ Error: Indicator at index ${currentSlide} does not exist!`);
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
        console.error(`❌ Error: Invalid slide index ${index}`);
        return;
      }
      currentSlide = index;
      updateSlides();
    }
  
    // Auto advance slides
    setInterval(() => moveSlide(1), 10000);
  
    // Initialize first slide
    updateSlides();
  });

// Parallax effect
function initParallax() {
  const parallaxSections = document.querySelectorAll('.parallax-section');
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

// Initialize parallax on load
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth > 768) {
    initParallax();
  }
});
