// Carousel functionality - Flat Design Version
class Carousel {
    constructor() {
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.carousel-indicator');
        this.progressBars = document.querySelectorAll('.progress-bar');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.isPaused = false;
        this.autoPlayInterval = 6000; // Reduced to 6 seconds
        this.progressBarDuration = 6000; // Reduced to 6 seconds
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.swipeThreshold = 50;
        
        if (this.slides.length === 0) return;
        
        this.init();
    }
    
    init() {
        this.preloadImages();
        this.startCarousel();
        this.bindEvents();
    }
    
    preloadImages() {
        // Preload carousel images for smoother transitions
        this.slides.forEach(slide => {
            const bgImage = slide.style.backgroundImage;
            if (bgImage) {
                const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                    const img = new Image();
                    img.src = urlMatch[1];
                }
            }
        });
    }
    
    showSlide(index) {
        // Ensure index is within bounds
        if (index < 0 || index >= this.slides.length) return;
        
        // Hide all slides
        this.slides.forEach(slide => {
            slide.style.opacity = '0';
            slide.style.zIndex = '0';
        });
        
        // Remove active class from all indicators
        this.indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        // Reset all progress bars
        this.progressBars.forEach(bar => {
            bar.style.transition = 'none';
            bar.style.width = '0';
            // Force reflow to reset animation
            bar.offsetHeight;
        });
        
        // Show current slide with fade effect
        const currentSlide = this.slides[index];
        currentSlide.style.opacity = '0';
        currentSlide.style.zIndex = '10';
        
        // Use requestAnimationFrame for smooth animation
        requestAnimationFrame(() => {
            currentSlide.style.transition = 'opacity 0.3s ease'; // Faster transition
            currentSlide.style.opacity = '1';
        });
        
        // Activate current indicator
        const currentIndicator = this.indicators[index];
        if (currentIndicator) {
            currentIndicator.classList.add('active');
        }
        
        // Start progress bar animation
        const currentProgressBar = this.progressBars[index];
        if (currentProgressBar) {
            currentProgressBar.style.transition = `width ${this.progressBarDuration}ms linear`;
            currentProgressBar.style.width = '100%';
        }
        
        this.currentSlide = index;
        
        // Dispatch custom event
        this.dispatchSlideChangeEvent();
    }
    
    nextSlide() {
        let next = this.currentSlide + 1;
        if (next >= this.slides.length) next = 0;
        this.showSlide(next);
    }
    
    prevSlide() {
        let prev = this.currentSlide - 1;
        if (prev < 0) prev = this.slides.length - 1;
        this.showSlide(prev);
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.showSlide(index);
            this.restartInterval();
        }
    }
    
    startCarousel() {
        // Start with first slide
        this.showSlide(0);
        
        // Set up interval for automatic sliding
        this.restartInterval();
        
        // Pause carousel on hover
        this.carouselContainer = document.querySelector('.hero-carousel');
        if (this.carouselContainer) {
            this.carouselContainer.addEventListener('mouseenter', () => {
                this.pauseCarousel();
            });
            
            this.carouselContainer.addEventListener('mouseleave', () => {
                this.resumeCarousel();
            });
        }
    }
    
    pauseCarousel() {
        this.isPaused = true;
        
        // Pause progress bar animation
        const activeBar = this.progressBars[this.currentSlide];
        if (activeBar) {
            const computedStyle = window.getComputedStyle(activeBar);
            const width = computedStyle.getPropertyValue('width');
            activeBar.style.transition = 'none';
            activeBar.style.width = width;
        }
    }
    
    resumeCarousel() {
        this.isPaused = false;
        
        // Resume progress bar animation with remaining time
        const activeBar = this.progressBars[this.currentSlide];
        if (activeBar) {
            const remainingTime = this.calculateRemainingTime();
            if (remainingTime > 0) {
                activeBar.style.transition = `width ${remainingTime}ms linear`;
                activeBar.style.width = '100%';
            }
        }
    }
    
    calculateRemainingTime() {
        const activeBar = this.progressBars[this.currentSlide];
        if (!activeBar) return this.progressBarDuration;
        
        const computedStyle = window.getComputedStyle(activeBar);
        const currentWidth = parseFloat(computedStyle.getPropertyValue('width'));
        const container = activeBar.parentElement;
        const containerWidth = container ? container.offsetWidth : 100;
        
        if (containerWidth === 0) return this.progressBarDuration;
        
        const progress = (currentWidth / containerWidth);
        return this.progressBarDuration * (1 - progress);
    }
    
    restartInterval() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
        
        this.slideInterval = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, this.autoPlayInterval);
    }
    
    bindEvents() {
        // Add click events to indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
                this.restartInterval();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
                this.restartInterval();
            }
        });
        
        // Add swipe support for mobile
        this.addSwipeSupport();
    }
    
    addSwipeSupport() {
        if (!this.carouselContainer) return;
        
        this.carouselContainer.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.carouselContainer.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }
    
    handleSwipe() {
        const swipeDistance = this.touchStartX - this.touchEndX;
        
        if (Math.abs(swipeDistance) > this.swipeThreshold) {
            if (swipeDistance > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
            this.restartInterval();
        }
    }
    
    dispatchSlideChangeEvent() {
        const event = new CustomEvent('carouselslidechange', {
            detail: {
                currentSlide: this.currentSlide,
                totalSlides: this.slides.length
            }
        });
        document.dispatchEvent(event);
    }
}

// Mobile Menu functionality - Flat Design Version
class MobileMenu {
    constructor() {
        this.mobileMenuButton = document.getElementById('mobile-menu-button');
        this.desktopMenu = document.querySelector('.hidden.lg\\:flex');
        this.navItems = document.querySelectorAll('nav a.nav-item');
        this.isOpen = false;
        
        if (!this.mobileMenuButton) return;
        
        this.init();
    }
    
    init() {
        this.mobileMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.mobileMenuButton.contains(e.target) && 
                !this.desktopMenu.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
        
        // Close menu when clicking a link
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (this.isOpen) {
                    this.closeMenu();
                }
            });
        });
    }
    
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        // Show menu with flat design
        this.desktopMenu.classList.remove('hidden');
        this.desktopMenu.classList.add('flex', 'flex-col', 'absolute', 'top-full', 
                                      'left-0', 'right-0', 'bg-white', 
                                      'p-4', 'space-y-2', 'border-t', 'border-gray-200');
        
        // Update button
        this.mobileMenuButton.innerHTML = '<i class="fas fa-times"></i>';
        
        this.isOpen = true;
    }
    
    closeMenu() {
        // Hide menu
        this.desktopMenu.classList.add('hidden');
        this.desktopMenu.classList.remove('flex', 'flex-col', 'absolute', 'top-full', 
                                         'left-0', 'right-0', 'bg-white', 
                                         'p-4', 'space-y-2', 'border-t', 'border-gray-200');
        
        // Update button
        this.mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
        
        this.isOpen = false;
    }
}

// Scroll to Top functionality - Flat Design Version
class ScrollToTop {
    constructor() {
        this.scrollToTopBtn = document.getElementById('scrollToTopBtn');
        this.scrollThreshold = 300;
        
        if (!this.scrollToTopBtn) return;
        
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => {
            this.toggleVisibility();
        });
        
        this.scrollToTopBtn.addEventListener('click', () => {
            this.scrollToTop();
        });
        
        // Initial check
        this.toggleVisibility();
    }
    
    toggleVisibility() {
        if (window.pageYOffset > this.scrollThreshold) {
            this.scrollToTopBtn.classList.add('visible');
        } else {
            this.scrollToTopBtn.classList.remove('visible');
        }
    }
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Smooth scrolling for anchor links - Simplified
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            const link = target.closest('a');
            
            if (link && link.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                if (targetId === '') {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    return;
                }
                
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }
}

// Form handling - Flat Design Version
class FormHandler {
    constructor() {
        this.init();
    }
    
    init() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });
    }
    
    handleFormSubmit(form) {
        const inputs = form.querySelectorAll('input');
        let isValid = true;
        
        // Simple validation
        inputs.forEach(input => {
            if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    this.showError(input, 'Please enter a valid email address');
                } else {
                    this.removeError(input);
                }
            }
            
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                this.showError(input, 'This field is required');
            } else {
                this.removeError(input);
            }
        });
        
        if (isValid) {
            this.showSuccess(form);
        }
    }
    
    showError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-600 text-sm mt-1';
        errorDiv.textContent = message;
        
        // Remove existing error
        this.removeError(input);
        
        // Add error message
        input.parentNode.appendChild(errorDiv);
        input.classList.add('border-red-500');
    }
    
    removeError(input) {
        const errorDiv = input.parentNode.querySelector('.text-red-600');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.classList.remove('border-red-500');
    }
    
    showSuccess(form) {
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        
        // Show loading state
        button.textContent = 'Sending...';
        button.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'bg-green-50 text-green-700 p-4 mt-4';
            successDiv.textContent = form.classList.contains('flex-col') 
                ? 'Thank you for subscribing!' 
                : 'Job search submitted successfully!';
            
            form.parentNode.insertBefore(successDiv, form.nextSibling);
            
            // Reset form
            form.reset();
            button.textContent = originalText;
            button.disabled = false;
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successDiv.remove();
            }, 5000);
        }, 1500);
    }
}

// Initialize all functionality
class App {
    constructor() {
        this.carousel = null;
        this.mobileMenu = null;
        this.scrollToTop = null;
        this.smoothScroll = null;
        this.formHandler = null;
        
        this.init();
    }
    
    init() {
        // Initialize immediately
        this.setupApp();
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (this.carousel) {
                if (document.hidden) {
                    this.carousel.pauseCarousel();
                } else {
                    this.carousel.resumeCarousel();
                }
            }
        });
    }
    
    setupApp() {
        // Initialize components
        this.carousel = new Carousel();
        this.mobileMenu = new MobileMenu();
        this.scrollToTop = new ScrollToTop();
        this.smoothScroll = new SmoothScroll();
        this.formHandler = new FormHandler();
        
        // Add content animations
        this.addContentAnimations();
    }
    
    addContentAnimations() {
        // Simple fade-in animation for content boxes
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-4');
                }
            });
        }, observerOptions);
        
        // Observe content boxes
        const contentBoxes = document.querySelectorAll('.content-box');
        contentBoxes.forEach(box => {
            box.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-500');
            observer.observe(box);
        });
    }
}

// Initialize the application
const app = new App();

// Make components available globally for debugging
window.app = app;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Carousel,
        MobileMenu,
        ScrollToTop,
        SmoothScroll,
        FormHandler,
        App
    };
}