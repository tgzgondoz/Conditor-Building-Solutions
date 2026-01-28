let items = document.querySelectorAll('.slider .items');
let prevBtn = document.querySelector('#prev');
let nextBtn = document.querySelector('#next');
let lastPosition = items.length - 1;
let firstPosition = 0;
let active = 0;

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
}

const setDiameter = () => {
    let slider = document.querySelector('.slider');
    let widthSlider = slider.offsetWidth;
    let heightSlider = slider.offsetHeight;
    let diameter = Math.sqrt(Math.pow(widthSlider, 2) + Math.pow(heightSlider, 2));
    
    document.documentElement.style.setProperty('--diameter', diameter + 'px');
}

// Initialize
setDiameter();
setSlider();

window.addEventListener('resize', setDiameter);

// Add touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

document.querySelector('.slider').addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.querySelector('.slider').addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

const handleSwipe = () => {
    const swipeThreshold = 50;
    
    if (touchStartX - touchEndX > swipeThreshold) {
        // Swipe left - go to next
        nextBtn.onclick();
    } else if (touchEndX - touchStartX > swipeThreshold) {
        // Swipe right - go to previous
        prevBtn.onclick();
    }
}