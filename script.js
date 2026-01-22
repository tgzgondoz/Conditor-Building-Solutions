// Carousel functionality
class Carousel {
    constructor() {
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.carousel-indicator');
        this.progressBars = document.querySelectorAll('.progress-bar');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.isPaused = false;
        this.autoPlayInterval = 8000; // 8 seconds
        this.progressBarDuration = 8000; // 8 seconds
        
        if (this.slides.length === 0) return;
        
        this.init();
    }
    
    init() {
        this.startCarousel();
        this.bindEvents();
    }
    
    showSlide(index) {
        // Hide all slides
        this.slides.forEach(slide => {
            slide.style.opacity = '0';
            slide.style.zIndex = '0';
        });
        
        // Remove active class from all indicators
        this.indicators.forEach(indicator => {
            indicator.classList.remove('active');
            indicator.classList.remove('w-10');
            indicator.classList.add('w-8');
        });
        
        // Reset all progress bars
        this.progressBars.forEach(bar => {
            bar.style.transition = 'none';
            bar.style.width = '0';
            // Force reflow
            bar.offsetHeight;
        });
        
        // Show current slide
        this.slides[index].style.opacity = '1';
        this.slides[index].style.zIndex = '10';
        
        // Activate current indicator
        this.indicators[index].classList.add('active');
        this.indicators[index].classList.add('w-10');
        this.indicators[index].classList.remove('w-8');
        
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
        }
    }
    
    startCarousel() {
        // Start with first slide
        this.showSlide(0);
        
        // Set up interval for automatic sliding
        this.slideInterval = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, this.autoPlayInterval);
        
        // Pause carousel on hover
        this.carouselContainer = document.querySelector('.hero-carousel');
        if (this.carouselContainer) {
            this.carouselContainer.addEventListener('mouseenter', () => {
                this.isPaused = true;
                // Pause progress bar animation
                const activeBar = this.progressBars[this.currentSlide];
                if (activeBar) {
                    const computedStyle = window.getComputedStyle(activeBar);
                    const width = computedStyle.getPropertyValue('width');
                    activeBar.style.transition = 'none';
                    activeBar.style.width = width;
                }
            });
            
            this.carouselContainer.addEventListener('mouseleave', () => {
                this.isPaused = false;
                // Resume progress bar animation
                const activeBar = this.progressBars[this.currentSlide];
                if (activeBar) {
                    activeBar.style.transition = `width ${this.remainingTime()}ms linear`;
                    activeBar.style.width = '100%';
                }
            });
        }
    }
    
    remainingTime() {
        // Calculate remaining time for progress bar
        const activeBar = this.progressBars[this.currentSlide];
        if (!activeBar) return this.progressBarDuration;
        
        const computedStyle = window.getComputedStyle(activeBar);
        const width = parseFloat(computedStyle.getPropertyValue('width'));
        const containerWidth = parseFloat(computedStyle.getPropertyValue('--container-width') || 
                                       activeBar.parentElement.offsetWidth);
        
        const percentage = (width / containerWidth) * 100;
        return (percentage / 100) * this.progressBarDuration;
    }
    
    bindEvents() {
        // Add click events to indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
                this.restartInterval();
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
    
    restartInterval() {
        clearInterval(this.slideInterval);
        this.slideInterval = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, this.autoPlayInterval);
    }
    
    addSwipeSupport() {
        if (!this.carouselContainer) return;
        
        let startX = 0;
        let endX = 0;
        
        this.carouselContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        this.carouselContainer.addEventListener('touchmove', (e) => {
            endX = e.touches[0].clientX;
        }, { passive: true });
        
        this.carouselContainer.addEventListener('touchend', () => {
            const threshold = 50;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    // Swipe left
                    this.nextSlide();
                } else {
                    // Swipe right
                    this.prevSlide();
                }
                this.restartInterval();
            }
        }, { passive: true });
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

// Mobile Menu functionality - Simplified
class MobileMenu {
    constructor() {
        this.mobileMenuButton = document.getElementById('mobile-menu-button');
        this.desktopMenu = document.querySelector('.hidden.lg\\:flex');
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
        if (this.desktopMenu) {
            this.desktopMenu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    this.closeMenu();
                }
            });
        }
    }
    
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.desktopMenu.classList.remove('hidden');
        this.desktopMenu.classList.add('flex', 'flex-col', 'absolute', 'top-full', 
                                      'left-0', 'right-0', 'bg-white', 'shadow-lg', 
                                      'p-6', 'space-y-4');
        this.mobileMenuButton.innerHTML = '<i class="fas fa-times text-2xl"></i>';
        this.mobileMenuButton.classList.add('text-blue-600');
        this.isOpen = true;
        
        // Add animation
        this.desktopMenu.style.animation = 'fadeInDown 0.3s ease-out';
        
        // Dispatch event
        this.dispatchMenuEvent('mobilemenuopen');
    }
    
    closeMenu() {
        this.desktopMenu.classList.add('hidden');
        this.desktopMenu.classList.remove('flex', 'flex-col', 'absolute', 'top-full', 
                                         'left-0', 'right-0', 'bg-white', 'shadow-lg', 
                                         'p-6', 'space-y-4');
        this.mobileMenuButton.innerHTML = '<i class="fas fa-bars text-2xl"></i>';
        this.mobileMenuButton.classList.remove('text-blue-600');
        this.isOpen = false;
        
        // Remove animation
        this.desktopMenu.style.animation = '';
        
        // Dispatch event
        this.dispatchMenuEvent('mobilemenuclose');
    }
    
    dispatchMenuEvent(eventName) {
        const event = new CustomEvent(eventName, {
            detail: { isOpen: this.isOpen }
        });
        document.dispatchEvent(event);
    }
}

// Scroll to Top functionality
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
        
        // Dispatch event
        const event = new CustomEvent('scrolltotop');
        document.dispatchEvent(event);
    }
}

// Smooth scrolling for anchor links
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        // Add smooth scrolling to all anchor links
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Check if clicked element is an anchor link with href starting with #
            if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const targetId = target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Adjust for fixed header
                        behavior: 'smooth'
                    });
                }
            }
        });
    }
}

// Initialize all functionality
class App {
    constructor() {
        this.carousel = null;
        this.mobileMenu = null;
        this.scrollToTop = null;
        this.smoothScroll = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            // Add CSS animations
            this.addAnimations();
            
            // Initialize components
            this.carousel = new Carousel();
            this.mobileMenu = new MobileMenu();
            this.scrollToTop = new ScrollToTop();
            this.smoothScroll = new SmoothScroll();
            
            // Dispatch app ready event
            this.dispatchAppReadyEvent();
        });
        
        // Handle page visibility changes (pause carousel when tab is not active)
        document.addEventListener('visibilitychange', () => {
            if (this.carousel) {
                this.carousel.isPaused = document.hidden;
            }
        });
    }
    
    addAnimations() {
        // Add CSS for animations if not already present
        if (!document.querySelector('#custom-animations')) {
            const style = document.createElement('style');
            style.id = 'custom-animations';
            style.textContent = `
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    dispatchAppReadyEvent() {
        const event = new CustomEvent('appready', {
            detail: {
                carousel: this.carousel,
                mobileMenu: this.mobileMenu,
                scrollToTop: this.scrollToTop,
                smoothScroll: this.smoothScroll
            }
        });
        document.dispatchEvent(event);
    }
}

// Initialize the application
const app = new App();

// Make components available globally for debugging
window.app = app;
window.Carousel = Carousel;
window.MobileMenu = MobileMenu;
window.ScrollToTop = ScrollToTop;
window.SmoothScroll = SmoothScroll;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Carousel,
        MobileMenu,
        ScrollToTop,
        SmoothScroll,
        App
    };
}