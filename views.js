class ImageSlider {
  constructor() {
    this.slides = document.querySelectorAll('.slider .items');
    this.prevBtn = document.getElementById('prev');
    this.nextBtn = document.getElementById('next');
    this.dots = document.querySelectorAll('.dot');
    this.currentSlide = 0;
    this.totalSlides = this.slides.length;
    this.isAnimating = false;
    this.animationDuration = 1000; // Match CSS --slide-duration
    
    this.init();
  }
  
  init() {
    // Set initial state
    this.updateSlides();
    
    // Event Listeners
    this.prevBtn.addEventListener('click', () => this.prevSlide());
    this.nextBtn.addEventListener('click', () => this.nextSlide());
    
    // Dot navigation
    this.dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.goToSlide(index);
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
    
    // Auto-play (optional)
    // this.startAutoPlay();
  }
  
  updateSlides() {
    // Remove all classes first
    this.slides.forEach(slide => {
      slide.classList.remove('active', 'prev', 'next');
    });
    
    // Calculate previous and next indices
    const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    const nextIndex = (this.currentSlide + 1) % this.totalSlides;
    
    // Apply classes
    this.slides[prevIndex].classList.add('prev');
    this.slides[this.currentSlide].classList.add('active');
    this.slides[nextIndex].classList.add('next');
    
    // Update dots
    this.dots.forEach(dot => dot.classList.remove('active'));
    this.dots[this.currentSlide].classList.add('active');
    
    // Update button states
    this.prevBtn.disabled = this.currentSlide === 0;
    this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
  }
  
  prevSlide() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlides();
    
    // Reset animation lock
    setTimeout(() => {
      this.isAnimating = false;
    }, this.animationDuration);
  }
  
  nextSlide() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlides();
    
    // Reset animation lock
    setTimeout(() => {
      this.isAnimating = false;
    }, this.animationDuration);
  }
  
  goToSlide(index) {
    if (this.isAnimating || index === this.currentSlide) return;
    this.isAnimating = true;
    
    this.currentSlide = index;
    this.updateSlides();
    
    // Reset animation lock
    setTimeout(() => {
      this.isAnimating = false;
    }, this.animationDuration);
  }
  
  startAutoPlay() {
    setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const slider = new ImageSlider();
  
  // Set circle diameter to be larger (65% of viewport)
  const setDiameter = () => {
    const sliderEl = document.querySelector('.slider');
    const width = sliderEl.offsetWidth;
    const height = sliderEl.offsetHeight;
    const diameter = Math.min(width, height) * 0.65; // Increased to 65% for pro look
    
    document.documentElement.style.setProperty('--diameter', `${diameter}px`);
  };
  
  // Initial diameter calculation
  setDiameter();
  
  // Update on resize
  window.addEventListener('resize', setDiameter);
  
  // Optional: Add touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.querySelector('.slider').addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  document.querySelector('.slider').addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const threshold = 50;
    
    if (touchStartX - touchEndX > threshold) {
      slider.nextSlide();
    }
    if (touchEndX - touchStartX > threshold) {
      slider.prevSlide();
    }
  }, { passive: true });
});


// Mobile menu toggle for views.js
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navList = document.querySelector('.nav-list');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      navList.classList.toggle('active');
      // Toggle menu icon animation
      const menuIcon = this.querySelector('.menu-icon');
      menuIcon.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navList.classList.remove('active');
        const menuIcon = document.querySelector('.menu-icon');
        if (menuIcon) menuIcon.classList.remove('active');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.main-nav') && navList.classList.contains('active')) {
        navList.classList.remove('active');
        const menuIcon = document.querySelector('.menu-icon');
        if (menuIcon) menuIcon.classList.remove('active');
      }
    });
  }
});