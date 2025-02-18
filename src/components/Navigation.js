export default class Navigation {
  constructor() {
    this.render();
    this.addEventListeners();
  }

  render() {
    const nav = document.createElement('nav');
    nav.className = 'main-nav';
    nav.innerHTML = `
      <div class="nav-container">
        <div class="nav-brand">
          <a href="#home" class="nav-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-logo-svg">
              <path d="M6.5 4C5.67157 4 5 4.67157 5 5.5V18.5C5 19.3284 5.67157 20 6.5 20C7.32843 20 8 19.3284 8 18.5V5.5C8 4.67157 7.32843 4 6.5 4Z" fill="currentColor"/>
              <path d="M17.5 4C16.6716 4 16 4.67157 16 5.5V18.5C16 19.3284 16.6716 20 17.5 20C18.3284 20 19 19.3284 19 18.5V5.5C19 4.67157 18.3284 4 17.5 4Z" fill="currentColor"/>
              <path d="M3 8.5C2.44772 8.5 2 8.94772 2 9.5V14.5C2 15.0523 2.44772 15.5 3 15.5C3.55228 15.5 4 15.0523 4 14.5V9.5C4 8.94772 3.55228 8.5 3 8.5Z" fill="currentColor"/>
              <path d="M20 8.5C19.4477 8.5 19 8.94772 19 9.5V14.5C19 15.0523 19.4477 15.5 20 15.5C20.5523 15.5 21 15.0523 21 14.5V9.5C21 8.94772 20.5523 8.5 20 8.5Z" fill="currentColor"/>
              <path d="M8 11H16V13H8V11Z" fill="currentColor"/>
            </svg>
            <span>FitTrack</span>
          </a>
        </div>
        
        <button class="menu-toggle" id="menu-toggle">
          <span class="menu-icon"></span>
        </button>

        <div class="nav-menu" id="nav-menu">
          <a href="#home" class="nav-link">
            <i class="fas fa-home"></i>
            Home
          </a>
          
          <div class="nav-item">
            <a href="#workout" class="nav-link has-dropdown">
              <i class="fas fa-dumbbell"></i>
              Workouts
            </a>
            <div class="dropdown-menu">
              <a href="#workout/new" class="dropdown-item">
                <i class="fas fa-plus-circle"></i>
                New Workout
              </a>
              <a href="#workout/tracker" class="dropdown-item">
                <i class="fas fa-chart-line"></i>
                Workout Tracker
              </a>
              <a href="#workout/history" class="dropdown-item">
                <i class="fas fa-history"></i>
                History
              </a>
            </div>
          </div>

          <a href="#nutrition" class="nav-link">
            <i class="fas fa-utensils"></i>
            Nutrition
          </a>
          
          <a href="#profile" class="nav-link">
            <i class="fas fa-user"></i>
            Profile
          </a>
        </div>
      </div>
    `;

    // Insert navigation into the app container
    const appContainer = document.getElementById('app');
    appContainer.insertBefore(nav, appContainer.firstChild);
    this.highlightCurrentPage();
  }

  addEventListeners() {
    const menuToggle = document.querySelector('#menu-toggle');
    const navMenu = document.querySelector('#nav-menu');

    // Handle mobile menu toggle
    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.main-nav')) {
          menuToggle.classList.remove('active');
          navMenu.classList.remove('active');
        }
      });
    }

    // Handle navigation clicks
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const isDropdownToggle = link.classList.contains('has-dropdown');
        
        if (isDropdownToggle && window.innerWidth <= 768) {
          e.preventDefault();
          const navItem = link.closest('.nav-item');
          navItem?.classList.toggle('active');
        } else if (!isDropdownToggle) {
          e.preventDefault();
          const page = link.getAttribute('href').slice(1);
          window.location.hash = page;
          this.handleNavigation(page);
        }
      });
    });

    // Handle dropdown item clicks
    document.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('href').slice(1);
        window.location.hash = page;
        this.handleNavigation(page);
        
        // Close mobile menu after selection
        if (window.innerWidth <= 768) {
          menuToggle?.classList.remove('active');
          navMenu?.classList.remove('active');
          item.closest('.nav-item')?.classList.remove('active');
        }
      });
    });
  }

  highlightCurrentPage() {
    const currentHash = window.location.hash.slice(1) || 'home';
    
    // Handle both main nav links and dropdown items
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
      const href = link.getAttribute('href').slice(1);
      if (currentHash.startsWith(href) && href !== '') {
        link.classList.add('active');
        // If it's a dropdown item, also highlight the parent dropdown
        if (link.classList.contains('dropdown-item')) {
          link.closest('.nav-item')?.querySelector('.nav-link')?.classList.add('active');
        }
      } else {
        link.classList.remove('active');
      }
    });
  }

  handleNavigation(page) {
    this.highlightCurrentPage();
    window.dispatchEvent(new CustomEvent('navigationchange', { 
      detail: { page } 
    }));
  }
} 