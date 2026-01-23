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
            indicator.classList.remove('w-10');
            indicator.classList.add('w-8');
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
            currentSlide.style.transition = 'opacity 0.5s ease';
            currentSlide.style.opacity = '1';
        });
        
        // Activate current indicator
        const currentIndicator = this.indicators[index];
        if (currentIndicator) {
            currentIndicator.classList.add('active');
            currentIndicator.classList.add('w-10');
            currentIndicator.classList.remove('w-8');
        }
        
        // Start progress bar animation
        const currentProgressBar = this.progressBars[index];
        if (currentProgressBar) {
            // Set container width for progress calculation
            const container = currentProgressBar.parentElement;
            if (container) {
                const containerWidth = container.offsetWidth;
                currentProgressBar.style.setProperty('--container-width', `${containerWidth}px`);
            }
            
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
        const containerWidth = parseFloat(computedStyle.getPropertyValue('--container-width')) || 
                             activeBar.parentElement.offsetWidth;
        
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
        
        // Add focus handling for accessibility
        this.addFocusHandling();
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
    
    addFocusHandling() {
        // Pause carousel when focus is inside carousel for accessibility
        this.carouselContainer?.addEventListener('focusin', () => {
            this.pauseCarousel();
        });
        
        this.carouselContainer?.addEventListener('focusout', () => {
            this.resumeCarousel();
        });
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

// Mobile Menu functionality - Improved
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
        
        // Trap focus in mobile menu for accessibility
        this.setupFocusTrap();
    }
    
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        // Show menu
        this.desktopMenu.classList.remove('hidden');
        this.desktopMenu.classList.add('flex', 'flex-col', 'absolute', 'top-full', 
                                      'left-0', 'right-0', 'bg-white', 'shadow-lg', 
                                      'p-6', 'space-y-4', 'animate-fade-in');
        
        // Update button
        this.mobileMenuButton.innerHTML = '<i class="fas fa-times text-2xl"></i>';
        this.mobileMenuButton.setAttribute('aria-expanded', 'true');
        this.mobileMenuButton.classList.add('text-blue-600');
        
        this.isOpen = true;
        
        // Trap focus
        this.trapFocus();
        
        // Dispatch event
        this.dispatchMenuEvent('mobilemenuopen');
    }
    
    closeMenu() {
        // Hide menu
        this.desktopMenu.classList.add('hidden');
        this.desktopMenu.classList.remove('flex', 'flex-col', 'absolute', 'top-full', 
                                         'left-0', 'right-0', 'bg-white', 'shadow-lg', 
                                         'p-6', 'space-y-4', 'animate-fade-in');
        
        // Update button
        this.mobileMenuButton.innerHTML = '<i class="fas fa-bars text-2xl"></i>';
        this.mobileMenuButton.setAttribute('aria-expanded', 'false');
        this.mobileMenuButton.classList.remove('text-blue-600');
        
        this.isOpen = false;
        
        // Release focus trap
        this.releaseFocus();
        
        // Dispatch event
        this.dispatchMenuEvent('mobilemenuclose');
    }
    
    setupFocusTrap() {
        this.firstFocusableElement = null;
        this.lastFocusableElement = null;
    }
    
    trapFocus() {
        // Get all focusable elements in the menu
        const focusableElements = this.desktopMenu.querySelectorAll(
            'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            this.firstFocusableElement = focusableElements[0];
            this.lastFocusableElement = focusableElements[focusableElements.length - 1];
            
            // Focus first element
            this.firstFocusableElement.focus();
            
            // Add keyboard trap
            this.desktopMenu.addEventListener('keydown', this.handleFocusTrap.bind(this));
        }
    }
    
    handleFocusTrap(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === this.firstFocusableElement) {
                    e.preventDefault();
                    this.lastFocusableElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === this.lastFocusableElement) {
                    e.preventDefault();
                    this.firstFocusableElement.focus();
                }
            }
        }
    }
    
    releaseFocus() {
        this.desktopMenu.removeEventListener('keydown', this.handleFocusTrap.bind(this));
        this.mobileMenuButton.focus();
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
        // Add aria-label for accessibility
        this.scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
        
        window.addEventListener('scroll', () => {
            this.toggleVisibility();
        });
        
        this.scrollToTopBtn.addEventListener('click', () => {
            this.scrollToTop();
        });
        
        // Add keyboard support
        this.scrollToTopBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.scrollToTop();
            }
        });
        
        // Initial check
        this.toggleVisibility();
    }
    
    toggleVisibility() {
        if (window.pageYOffset > this.scrollThreshold) {
            this.scrollToTopBtn.classList.add('visible');
            this.scrollToTopBtn.setAttribute('aria-hidden', 'false');
        } else {
            this.scrollToTopBtn.classList.remove('visible');
            this.scrollToTopBtn.setAttribute('aria-hidden', 'true');
        }
    }
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Return focus for accessibility
        setTimeout(() => {
            this.scrollToTopBtn.blur();
        }, 1000);
        
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
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Handle both direct clicks and clicks on child elements inside links
            const link = target.closest('a');
            
            if (link && link.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                if (targetId === '') {
                    // Scroll to top if href is just "#"
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    return;
                }
                
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerOffset = 80; // Adjust for fixed header
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without scrolling
                    history.pushState(null, null, `#${targetId}`);
                }
            }
        });
    }
}

// Form handling
class FormHandler {
    constructor() {
        this.init();
    }
    
    init() {
        const jobSearchForm = document.querySelector('form');
        if (jobSearchForm) {
            jobSearchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleJobSearch(jobSearchForm);
            });
        }
    }
    
    handleJobSearch(form) {
        const searchInput = form.querySelector('input[type="text"]');
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm) {
            // In a real application, this would make an API call
            console.log(`Searching for jobs: ${searchTerm}`);
            
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Searching...';
            submitButton.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                
                // Show message
                this.showSearchMessage(`No jobs found for "${searchTerm}". Try a different search term.`);
            }, 1500);
        } else {
            searchInput.focus();
        }
    }
    
    showSearchMessage(message) {
        // Remove existing message
        const existingMessage = document.querySelector('.search-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'search-message mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg animate-fade-in';
        messageDiv.textContent = message;
        
        // Find the form and insert message
        const form = document.querySelector('form');
        if (form) {
            form.parentNode.insertBefore(messageDiv, form.nextSibling);
            
            // Remove message after 5 seconds
            setTimeout(() => {
                messageDiv.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                setTimeout(() => {
                    messageDiv.remove();
                }, 300);
            }, 5000);
        }
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
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApp();
            });
        } else {
            this.setupApp();
        }
        
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
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    setupApp() {
        // Add CSS animations
        this.addAnimations();
        
        // Initialize components
        this.carousel = new Carousel();
        this.mobileMenu = new MobileMenu();
        this.scrollToTop = new ScrollToTop();
        this.smoothScroll = new SmoothScroll();
        this.formHandler = new FormHandler();
        
        // Add loading animation
        this.addLoadingAnimation();
        
        // Dispatch app ready event
        this.dispatchAppReadyEvent();
    }
    
    addAnimations() {
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
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
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
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out;
                }
                
                .animate-fade-in-down {
                    animation: fadeInDown 0.5s ease-out;
                }
                
                .animate-slide-in-right {
                    animation: slideInRight 0.5s ease-out;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    addLoadingAnimation() {
        // Add loading animation to content boxes
        const contentBoxes = document.querySelectorAll('.content-box');
        contentBoxes.forEach((box, index) => {
            box.style.animationDelay = `${index * 0.1}s`;
            box.classList.add('animate-fade-in-up');
        });
        
        // Add animation to news items
        const newsItems = document.querySelectorAll('.space-y-6 > div');
        newsItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.15}s`;
            item.classList.add('animate-slide-in-right');
        });
    }
    
    handleResize() {
        // Handle any resize-specific logic
        if (this.carousel) {
            // Update progress bar container width on resize
            const activeProgressBar = this.carousel.progressBars[this.carousel.currentSlide];
            if (activeProgressBar) {
                const container = activeProgressBar.parentElement;
                if (container) {
                    const containerWidth = container.offsetWidth;
                    activeProgressBar.style.setProperty('--container-width', `${containerWidth}px`);
                }
            }
        }
        
        // Close mobile menu on desktop resize
        if (window.innerWidth >= 1024 && this.mobileMenu && this.mobileMenu.isOpen) {
            this.mobileMenu.closeMenu();
        }
    }
    
    dispatchAppReadyEvent() {
        const event = new CustomEvent('appready', {
            detail: {
                carousel: this.carousel,
                mobileMenu: this.mobileMenu,
                scrollToTop: this.scrollToTop,
                smoothScroll: this.smoothScroll,
                formHandler: this.formHandler
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
window.FormHandler = FormHandler;

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