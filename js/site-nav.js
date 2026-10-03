// js/site-nav.js — header behaviour shared by news.html and news-details.html
// (same logic as the inline script in index.html)

// Networks dropdown
const subDrop = document.getElementById('subDrop');
const subDropTrigger = document.getElementById('subDropTrigger');
if (subDrop && subDropTrigger) {
  subDropTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    subDrop.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!subDrop.contains(e.target)) subDrop.classList.remove('open');
  });
}

// Header scroll state
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
});

// Mobile menu
const menuBtn = document.querySelector('.menu-btn');
const navUl = document.querySelector('nav ul');
menuBtn?.addEventListener('click', () => {
  const isShown = navUl.style.display === 'flex';
  navUl.style.display = isShown ? 'none' : 'flex';
  navUl.style.position = 'absolute';
  navUl.style.top = '60px';
  navUl.style.left = '0';
  navUl.style.right = '0';
  navUl.style.flexDirection = 'column';
  navUl.style.background = 'rgba(20,17,12,0.92)';
  navUl.style.padding = '20px';
  navUl.style.borderRadius = '20px';
  navUl.style.gap = '16px';
});

// Footer year
const yr = document.getElementById('footerYear');
if (yr) yr.textContent = new Date().getFullYear();