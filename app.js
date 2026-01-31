// Slider functionality
let items = document.querySelectorAll('.slider .items');
let prevBtn = document.querySelector('#prev');
let nextBtn = document.querySelector('#next');
let lastPosition = items.length - 1;
let firstPosition = 0;
let active = 0;
let autoSlideInterval;

nextBtn.onclick = () => {
   active++;
   if (active > lastPosition) {
       active = lastPosition;
   }
   setSlider();
}

prevBtn.onclick = () => {
    active--;
    if (active < firstPosition) {
        active = firstPosition;
    }
    setSlider();
}

const setSlider = () => {
   let oldActive = document.querySelector('.slider .items.active');
   if (oldActive) oldActive.classList.remove('active');
   items[active].classList.add('active');

   // Update button visibility
   if (active === lastPosition) {
       nextBtn.classList.add('d-none');
   } else {
       nextBtn.classList.remove('d-none');
   }
   
   if (active === firstPosition) {
       prevBtn.classList.add('d-none');
   } else {
       prevBtn.classList.remove('d-none');
   }
   
   // Update dots
   updateDots();
}

const updateDots = () => {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => {
        dot.classList.remove('active');
        if (parseInt(dot.getAttribute('data-index')) === active) {
            dot.classList.add('active');
        }
    });
}

// Dot navigation
document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        active = index;
        setSlider();
    });
});

const setDiameter = () => {
    let slider = document.querySelector('.slider');
    let widthSlider = slider.offsetWidth;
    let heightSlider = slider.offsetHeight;
    let diameter = Math.sqrt(Math.pow(widthSlider, 2) + Math.pow(heightSlider, 2));
    
    document.documentElement.style.setProperty('--diameter', diameter + 'px');
}

// Auto slide functionality
const startAutoSlide = () => {
    autoSlideInterval = setInterval(() => {
        if (active < lastPosition) {
            active++;
        } else {
            active = firstPosition;
        }
        setSlider();
    }, 5000); // Change slide every 5 seconds
}

const stopAutoSlide = () => {
    clearInterval(autoSlideInterval);
}

// Initialize
setDiameter();
setSlider();
startAutoSlide();

// Pause auto slide on hover
document.querySelector('.slider').addEventListener('mouseenter', stopAutoSlide);
document.querySelector('.slider').addEventListener('mouseleave', startAutoSlide);

window.addEventListener('resize', setDiameter);

// Add touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

document.querySelector('.slider').addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoSlide();
});

document.querySelector('.slider').addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    // Restart auto slide after a delay
    setTimeout(startAutoSlide, 3000);
});

const handleSwipe = () => {
    const swipeThreshold = 50;
    
    if (touchStartX - touchEndX > swipeThreshold) {
        // Swipe left - go to next
        if (active < lastPosition) {
            active++;
            setSlider();
        }
    } else if (touchEndX - touchStartX > swipeThreshold) {
        // Swipe right - go to previous
        if (active > firstPosition) {
            active--;
            setSlider();
        }
    }
}

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navList = document.querySelector('.nav-list');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      navList.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navList.classList.remove('active');
      });
    });
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Newsletter form submission
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value;
      
      if (email && email.includes('@')) {
        // In a real application, you would send this to your server
        alert('Thank you for subscribing to our newsletter!');
        emailInput.value = '';
      } else {
        alert('Please enter a valid email address.');
      }
    });
  }
  
  // Project card hover effects
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.zIndex = '1';
    });
  });
});