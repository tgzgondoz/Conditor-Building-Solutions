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

// Mega Menu functionality
class MegaMenu {
    constructor() {
        this.megaMenuTriggers = document.querySelectorAll('.group');
        this.megaMenus = document.querySelectorAll('.mega-menu');
        this.timeouts = new Map();
        this.hoverDelay = 150; // ms delay for menu hide
        this.isMobile = window.innerWidth < 1024;
        
        if (this.megaMenuTriggers.length === 0) return;
        
        this.init();
        this.bindResize();
    }
    
    init() {
        this.megaMenuTriggers.forEach(trigger => {
            const megaMenu = trigger.querySelector('.mega-menu');
            if (!megaMenu) return;
            
            // Store timeout ID for this menu
            this.timeouts.set(megaMenu, null);
            
            trigger.addEventListener('mouseenter', () => {
                if (this.isMobile) return;
                this.showMenu(megaMenu);
            });
            
            trigger.addEventListener('mouseleave', (e) => {
                if (this.isMobile) return;
                this.hideMenu(megaMenu, e);
            });
            
            // Handle mouse events on the mega menu itself
            megaMenu.addEventListener('mouseenter', () => {
                if (this.isMobile) return;
                this.clearHideTimeout(megaMenu);
            });
            
            megaMenu.addEventListener('mouseleave', (e) => {
                if (this.isMobile) return;
                this.hideMenu(megaMenu, e);
            });
            
            // Touch support for mobile
            trigger.addEventListener('touchstart', (e) => {
                if (!this.isMobile) return;
                e.preventDefault();
                this.toggleMenu(megaMenu);
            });
        });
        
        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMobile) {
                this.closeAllMenus(e);
            }
        });
    }
    
    showMenu(menu) {
        // Close all other menus first
        this.closeAllMenus();
        
        // Show the requested menu
        this.clearHideTimeout(menu);
        menu.classList.add('active');
        
        // Dispatch custom event
        this.dispatchMenuEvent('megamenushow', menu);
    }
    
    hideMenu(menu, e) {
        if (e && e.relatedTarget && menu.contains(e.relatedTarget)) {
            return; // Mouse moved into menu, don't hide
        }
        
        const timeoutId = setTimeout(() => {
            menu.classList.remove('active');
            this.dispatchMenuEvent('megamenuhide', menu);
        }, this.hoverDelay);
        
        this.timeouts.set(menu, timeoutId);
    }
    
    toggleMenu(menu) {
        if (menu.classList.contains('active')) {
            menu.classList.remove('active');
            this.dispatchMenuEvent('megamenuhide', menu);
        } else {
            this.showMenu(menu);
        }
    }
    
    clearHideTimeout(menu) {
        const timeoutId = this.timeouts.get(menu);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.timeouts.set(menu, null);
        }
    }
    
    closeAllMenus(excludeElement = null) {
        this.megaMenus.forEach(menu => {
            if (excludeElement && (menu === excludeElement || menu.contains(excludeElement))) {
                return;
            }
            menu.classList.remove('active');
            this.clearHideTimeout(menu);
        });
    }
    
    bindResize() {
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth < 1024;
            if (!this.isMobile) {
                this.closeAllMenus();
            }
        });
    }
    
    dispatchMenuEvent(eventName, menu) {
        const event = new CustomEvent(eventName, {
            detail: { menu }
        });
        document.dispatchEvent(event);
    }
}

// Mobile Menu functionality
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
            if (this.isOpen && !this.mobileMenuButton.contains(e.target) && 
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
                                      'p-6', 'space-y-4', 'animate-fade-in');
        this.mobileMenuButton.innerHTML = '<i class="fas fa-times text-2xl"></i>';
        this.isOpen = true;
        
        // Dispatch event
        this.dispatchMenuEvent('mobilemenuopen');
    }
    
    closeMenu() {
        this.desktopMenu.classList.add('hidden');
        this.desktopMenu.classList.remove('flex', 'flex-col', 'absolute', 'top-full', 
                                         'left-0', 'right-0', 'bg-white', 'shadow-lg', 
                                         'p-6', 'space-y-4', 'animate-fade-in');
        this.mobileMenuButton.innerHTML = '<i class="fas fa-bars text-2xl"></i>';
        this.isOpen = false;
        
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

// Initialize all functionality
class App {
    constructor() {
        this.carousel = null;
        this.megaMenu = null;
        this.mobileMenu = null;
        this.scrollToTop = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize components
            this.carousel = new Carousel();
            this.megaMenu = new MegaMenu();
            this.mobileMenu = new MobileMenu();
            this.scrollToTop = new ScrollToTop();
            
            // Add CSS animation for mobile menu
            this.addAnimations();
            
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
        // Add CSS for fade-in animation if not already present
        if (!document.querySelector('#custom-animations')) {
            const style = document.createElement('style');
            style.id = 'custom-animations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
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
                megaMenu: this.megaMenu,
                mobileMenu: this.mobileMenu,
                scrollToTop: this.scrollToTop
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
window.MegaMenu = MegaMenu;
window.MobileMenu = MobileMenu;
window.ScrollToTop = ScrollToTop;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Carousel,
        MegaMenu,
        MobileMenu,
        ScrollToTop,
        App
    };
}