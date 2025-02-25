function toggleMenu(button) {
    button.classList.toggle('active');
    const navList = document.querySelector('.nav-list');
    navList.classList.toggle('open');
  }

  // Mobile dropdown handling
  document.querySelectorAll('.dropdown > a').forEach(link => {
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const dropdown = this.parentElement;
        dropdown.classList.toggle('active');
        // Close other dropdowns
        document.querySelectorAll('.dropdown').forEach(other => {
          if (other !== dropdown) other.classList.remove('active');
        });
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      if (!e.target.closest('.nav')) {
        document.querySelector('.nav-list').classList.remove('open');
        document.querySelector('.hamburger').classList.remove('active');
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
      }
    }
  });