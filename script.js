// View Counter System
const totalViewsElement = document.getElementById('totalViews');
const activeUsersElement = document.getElementById('activeUsers');

// Generate unique visitor ID
function generateVisitorId() {
     return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create visitor ID
function getVisitorId() {
     let visitorId = localStorage.getItem('food3d-visitor-id');
     if (!visitorId) {
          visitorId = generateVisitorId();
          localStorage.setItem('food3d-visitor-id', visitorId);
     }
     return visitorId;
}

// Update view counter
function updateViewCounter() {
     const visitorId = getVisitorId();
     const now = Date.now();

     // Get existing data
     let viewData = JSON.parse(localStorage.getItem('food3d-view-data') || '{}');

     // Update total views
     if (!viewData.totalViews) viewData.totalViews = 0;
     if (!viewData.visitors) viewData.visitors = {};

     // Check if this is a new visit (not within 30 minutes)
     const lastVisit = viewData.visitors[visitorId] || 0;
     if (now - lastVisit > 30 * 60 * 1000) { // 30 minutes
          viewData.totalViews++;
     }

     // Update visitor's last activity
     viewData.visitors[visitorId] = now;

     // Clean up old visitors (inactive for more than 5 minutes)
     const fiveMinutesAgo = now - 5 * 60 * 1000;
     Object.keys(viewData.visitors).forEach(id => {
          if (viewData.visitors[id] < fiveMinutesAgo) {
               delete viewData.visitors[id];
          }
     });

     // Calculate active users
     const activeUsers = Object.keys(viewData.visitors).length;

     // Save data
     localStorage.setItem('food3d-view-data', JSON.stringify(viewData));

     // Update display with animation
     updateDisplayWithAnimation(totalViewsElement, viewData.totalViews);
     updateDisplayWithAnimation(activeUsersElement, activeUsers);

     // Update tooltip
     updateTooltip();
}

// Animate number changes
function updateDisplayWithAnimation(element, newValue) {
     const currentValue = parseInt(element.textContent) || 0;
     if (currentValue !== newValue) {
          element.style.transform = 'scale(1.2)';
          element.style.color = '#ff7e5f';
          setTimeout(() => {
               element.textContent = newValue;
               element.style.transform = 'scale(1)';
               element.style.color = '';
          }, 150);
     }
}

// Update tooltip with detailed statistics
function updateTooltip() {
     const viewData = JSON.parse(localStorage.getItem('food3d-view-data') || '{}');
     const visitorId = getVisitorId();

     // Find visitor number
     let visitorNumber = 0;
     if (viewData.visitors) {
          const visitorIds = Object.keys(viewData.visitors).sort((a, b) => {
               return (viewData.visitors[a] || 0) - (viewData.visitors[b] || 0);
          });
          visitorNumber = visitorIds.indexOf(visitorId) + 1;
     }

     // Update tooltip elements
     const tooltipTotalViews = document.getElementById('tooltipTotalViews');
     const tooltipActiveUsers = document.getElementById('tooltipActiveUsers');
     const tooltipVisitorNumber = document.getElementById('tooltipVisitorNumber');
     const tooltipLastUpdate = document.getElementById('tooltipLastUpdate');

     if (tooltipTotalViews) tooltipTotalViews.textContent = viewData.totalViews || 0;
     if (tooltipActiveUsers) tooltipActiveUsers.textContent = Object.keys(viewData.visitors || {}).length;
     if (tooltipVisitorNumber) tooltipVisitorNumber.textContent = visitorNumber;
     if (tooltipLastUpdate) {
          const now = new Date();
          tooltipLastUpdate.textContent = now.toLocaleTimeString();
     }
}

// Update view counter every 30 seconds
setInterval(updateViewCounter, 30000);

// Initial update
updateViewCounter();

// Update on page visibility change (when user switches tabs)
document.addEventListener('visibilitychange', () => {
     if (!document.hidden) {
          updateViewCounter();
     }
});

// Update on user activity (throttled to avoid too many updates)
let activityTimeout;
function handleUserActivity() {
     clearTimeout(activityTimeout);
     activityTimeout = setTimeout(updateViewCounter, 1000); // Update after 1 second of inactivity
}

document.addEventListener('mousemove', handleUserActivity);
document.addEventListener('click', handleUserActivity);
document.addEventListener('scroll', handleUserActivity);
document.addEventListener('keypress', handleUserActivity);

// Show welcome message for new visitors
function showWelcomeMessage() {
     const visitorId = getVisitorId();
     const viewData = JSON.parse(localStorage.getItem('food3d-view-data') || '{}');

     if (!viewData.visitors || !viewData.visitors[visitorId]) {
          // This is a new visitor
          setTimeout(() => {
               const welcomeMsg = document.createElement('div');
               welcomeMsg.className = 'welcome-message';
               welcomeMsg.innerHTML = `
                    <div class="welcome-content">
                         <span class="welcome-icon">👋</span>
                         <span>Welcome! You're visitor #${viewData.totalViews + 1}</span>
                    </div>
               `;
               document.body.appendChild(welcomeMsg);

               setTimeout(() => {
                    welcomeMsg.classList.add('show');
               }, 100);

               setTimeout(() => {
                    welcomeMsg.classList.remove('show');
                    setTimeout(() => {
                         if (welcomeMsg.parentNode) {
                              welcomeMsg.parentNode.removeChild(welcomeMsg);
                         }
                    }, 500);
               }, 3000);
          }, 1000);
     }
}

// Call welcome message function
showWelcomeMessage();

// Add click handler for view counter
const viewCounter = document.getElementById('viewCounter');
if (viewCounter) {
     viewCounter.addEventListener('click', () => {
          const viewData = JSON.parse(localStorage.getItem('food3d-view-data') || '{}');
          const activeUsers = Object.keys(viewData.visitors || {}).length;

          // Show detailed popup
          const popup = document.createElement('div');
          popup.className = 'view-details-popup';
          popup.innerHTML = `
               <div class="popup-content">
                    <div class="popup-header">
                         <span class="popup-icon">📊</span>
                         <h3>Detailed View Statistics</h3>
                         <button class="popup-close" onclick="this.parentElement.parentElement.parentElement.remove()">✖️</button>
                    </div>
                    <div class="popup-body">
                         <div class="stat-row">
                              <span class="stat-title">Total Views:</span>
                              <span class="stat-number">${viewData.totalViews || 0}</span>
                         </div>
                         <div class="stat-row">
                              <span class="stat-title">Currently Active:</span>
                              <span class="stat-number active">${activeUsers}</span>
                         </div>
                         <div class="stat-row">
                              <span class="stat-title">Your Visit Number:</span>
                              <span class="stat-number">${getVisitorNumber()}</span>
                         </div>
                         <div class="stat-row">
                              <span class="stat-title">Last Updated:</span>
                              <span class="stat-number">${new Date().toLocaleString()}</span>
                         </div>
                         <div class="stat-row">
                              <span class="stat-title">Data Source:</span>
                              <span class="stat-number">Local Storage</span>
                         </div>
                    </div>
               </div>
          `;
          document.body.appendChild(popup);

          setTimeout(() => {
               popup.classList.add('show');
          }, 100);
     });
}

// Helper function to get visitor number
function getVisitorNumber() {
     const viewData = JSON.parse(localStorage.getItem('food3d-view-data') || '{}');
     const visitorId = getVisitorId();

     if (viewData.visitors) {
          const visitorIds = Object.keys(viewData.visitors).sort((a, b) => {
               return (viewData.visitors[a] || 0) - (viewData.visitors[b] || 0);
          });
          return visitorIds.indexOf(visitorId) + 1;
     }
     return 1;
}

// Light/Dark mode toggle
const toggleMode = document.getElementById('toggleMode');
const modeIcon = document.getElementById('modeIcon');
const body = document.body;

function setMode(isDark) {
     if (isDark) {
          body.classList.add('dark');
          modeIcon.textContent = '☀️';
     } else {
          body.classList.remove('dark');
          modeIcon.textContent = '🌙';
     }
}

// Save mode in localStorage
function getSavedMode() {
     return localStorage.getItem('food3d-mode') === 'dark';
}
function saveMode(isDark) {
     localStorage.setItem('food3d-mode', isDark ? 'dark' : 'light');
}

// Initial mode
setMode(getSavedMode());

toggleMode.addEventListener('click', () => {
     const isDark = !body.classList.contains('dark');
     setMode(isDark);
     saveMode(isDark);
});

// Advanced Search Functionality
const searchForm = document.querySelector('.search-form');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Searchable content data
const searchableContent = [
     { type: 'food', name: 'Pizza Mania', description: 'Cheesy, saucy, and loaded with toppings', category: 'Fast Food' },
     { type: 'food', name: 'Burger Blast', description: 'Juicy beef patty, fresh veggies, and secret sauce', category: 'Fast Food' },
     { type: 'food', name: 'Hotdog Heaven', description: 'Classic hotdog with tangy mustard and crispy onions', category: 'Fast Food' },
     { type: 'food', name: 'Fries Fiesta', description: 'Golden, crispy fries served with a variety of dips', category: 'Fast Food' },
     { type: 'food', name: 'Sandwich Supreme', description: 'Layered with meats, cheese, and fresh veggies', category: 'Fast Food' },
     { type: 'food', name: 'Taco Treat', description: 'Spicy beef, crisp lettuce, and creamy cheese', category: 'Fast Food' },
     { type: 'food', name: 'Chicken Nuggets', description: 'Crunchy on the outside, tender on the inside', category: 'Fast Food' },
     { type: 'food', name: 'Donut Delight', description: 'Sweet, fluffy donuts with colorful sprinkles', category: 'Desserts' },
     { type: 'food', name: 'Ice Cream Dream', description: 'Creamy, cold, and sweet. The perfect treat', category: 'Desserts' },
     { type: 'section', name: 'About Section', description: 'Learn about our food world and passion', category: 'Information' },
     { type: 'section', name: 'Food Menu', description: 'Browse our complete menu with prices', category: 'Menu' },
     { type: 'section', name: 'Order Now', description: 'Place your order for delicious food', category: 'Order' },
     { type: 'section', name: 'Customer Reviews', description: 'See what our customers say about us', category: 'Reviews' }
];

// Search functionality
function performSearch(query) {
     if (!query.trim()) return;

     const results = searchableContent.filter(item =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
     );

     if (results.length > 0) {
          showSearchResults(results, query);
     } else {
          showNoResults(query);
     }
}

// Show search results
function showSearchResults(results, query) {
     const searchModal = document.createElement('div');
     searchModal.className = 'search-modal';
     searchModal.innerHTML = `
          <div class="search-modal-content">
               <div class="search-modal-header">
                    <h3>Search Results for "${query}"</h3>
                    <button class="search-modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✖️</button>
               </div>
               <div class="search-modal-body">
                    ${results.map(result => `
                         <div class="search-result-item" onclick="navigateToResult('${result.type}', '${result.name}')">
                              <div class="result-icon">${result.type === 'food' ? '🍕' : '📋'}</div>
                              <div class="result-content">
                                   <div class="result-title">${result.name}</div>
                                   <div class="result-description">${result.description}</div>
                                   <div class="result-category">${result.category}</div>
                              </div>
                         </div>
                    `).join('')}
               </div>
          </div>
     `;
     document.body.appendChild(searchModal);

     setTimeout(() => searchModal.classList.add('show'), 100);
}

// Show no results
function showNoResults(query) {
     const searchModal = document.createElement('div');
     searchModal.className = 'search-modal';
     searchModal.innerHTML = `
          <div class="search-modal-content">
               <div class="search-modal-header">
                    <h3>No Results Found</h3>
                    <button class="search-modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✖️</button>
               </div>
               <div class="search-modal-body">
                    <div class="no-results">
                         <div class="no-results-icon">🔍</div>
                         <p>No results found for "${query}"</p>
                         <p>Try searching for: Pizza, Burger, Menu, Order, etc.</p>
                    </div>
               </div>
          </div>
     `;
     document.body.appendChild(searchModal);

     setTimeout(() => searchModal.classList.add('show'), 100);
}

// Navigate to search result
function navigateToResult(type, name) {
     const searchModal = document.querySelector('.search-modal');
     if (searchModal) searchModal.remove();

     if (type === 'food') {
          // Scroll to food card
          const foodCard = document.querySelector(`[data-name="${name}"]`);
          if (foodCard) {
               foodCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
               foodCard.style.animation = 'cardBounce 0.6s ease-in-out';
               setTimeout(() => foodCard.style.animation = '', 600);
          }
     } else if (type === 'section') {
          // Scroll to section
          const section = document.querySelector(`#${name.toLowerCase().replace(' ', '')}Section`);
          if (section) {
               section.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
     }
}

// Search form event listeners
searchForm.addEventListener('submit', (e) => {
     e.preventDefault();
     performSearch(searchInput.value);
});

searchBtn.addEventListener('click', (e) => {
     e.preventDefault();
     performSearch(searchInput.value);
});

// Real-time search suggestions
let searchTimeout;
searchInput.addEventListener('input', (e) => {
     clearTimeout(searchTimeout);
     const query = e.target.value;

     if (query.length >= 2) {
          searchTimeout = setTimeout(() => {
               const suggestions = searchableContent.filter(item =>
                    item.name.toLowerCase().includes(query.toLowerCase()) ||
                    item.description.toLowerCase().includes(query.toLowerCase())
               ).slice(0, 3);

               showSearchSuggestions(suggestions, query);
          }, 300);
     } else {
          hideSearchSuggestions();
     }
});

// Show search suggestions
function showSearchSuggestions(suggestions, query) {
     let suggestionsBox = document.querySelector('.search-suggestions');
     if (!suggestionsBox) {
          suggestionsBox = document.createElement('div');
          suggestionsBox.className = 'search-suggestions';
          searchForm.appendChild(suggestionsBox);
     }

     if (suggestions.length > 0) {
          suggestionsBox.innerHTML = suggestions.map(item => `
               <div class="suggestion-item" onclick="searchInput.value='${item.name}'; hideSearchSuggestions(); performSearch('${item.name}')">
                    <span class="suggestion-icon">${item.type === 'food' ? '🍕' : '📋'}</span>
                    <span class="suggestion-text">${item.name}</span>
               </div>
          `).join('');
          suggestionsBox.style.display = 'block';
     } else {
          suggestionsBox.style.display = 'none';
     }
}

// Hide search suggestions
function hideSearchSuggestions() {
     const suggestionsBox = document.querySelector('.search-suggestions');
     if (suggestionsBox) {
          suggestionsBox.style.display = 'none';
     }
}

// Banner Carousel (Loop)
const carouselTrack = document.getElementById('carouselTrack');
const slides = Array.from(carouselTrack.children);
let currentSlide = 0;
function showSlide(idx) {
     slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === idx);
     });
}
function nextSlide() {
     currentSlide = (currentSlide + 1) % slides.length;
     showSlide(currentSlide);
}
setInterval(nextSlide, 2500);
showSlide(currentSlide);

// Cart System
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItemsList = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
let cart = [];

function updateCart() {
     cartItemsList.innerHTML = '';
     cart.forEach((item, idx) => {
          const li = document.createElement('li');
          li.textContent = item;
          const removeBtn = document.createElement('button');
          removeBtn.className = 'remove-cart-item';
          removeBtn.innerHTML = '✖️';
          removeBtn.title = 'Remove';
          removeBtn.onclick = () => {
               cart.splice(idx, 1);
               updateCart();
          };
          li.appendChild(removeBtn);
          cartItemsList.appendChild(li);
     });
     cartCount.textContent = cart.length;
}

cartBtn.addEventListener('click', () => {
     cartModal.classList.add('active');
});
closeCart.addEventListener('click', () => {
     cartModal.classList.remove('active');
});
cartModal.addEventListener('click', (e) => {
     if (e.target === cartModal) cartModal.classList.remove('active');
});

// Add to Cart buttons (event delegation for robustness)
document.addEventListener('click', function (e) {
     if (e.target.classList.contains('add-cart-btn')) {
          const card = e.target.closest('.food-card');
          const name = card.getAttribute('data-name');
          cart.push(name);
          updateCart();
     }
});

// Order Now Button & Form
const orderNowBtn = document.getElementById('orderNowBtn');
const orderForm = document.getElementById('orderForm');
const congratsEffect = document.getElementById('congratsEffect');
const orderFoodName = document.getElementById('orderFoodName');

if (orderNowBtn && orderForm && orderFoodName) {
     orderNowBtn.addEventListener('click', () => {
          orderFoodName.textContent = 'Ordering: ' + orderNowBtn.getAttribute('data-name');
          orderFoodName.style.display = 'block';
          orderForm.style.display = 'flex';
          orderForm.scrollIntoView({ behavior: 'smooth' });
     });
}

// Order Form Success Message (for Formspree)
const formSuccessMsg = document.getElementById('formSuccessMsg');
if (window.location.hash === '#form-success') {
     formSuccessMsg.textContent = 'Your order has been received! Thank you!';
     formSuccessMsg.style.display = 'block';
     showCongratsEffect();
     // Optionally, hide after a few seconds
     setTimeout(() => { formSuccessMsg.style.display = 'none'; }, 4000);
}

// Confetti/Balloon Effect
function showCongratsEffect() {
     congratsEffect.innerHTML = '';
     for (let i = 0; i < 25; i++) {
          const balloon = document.createElement('div');
          balloon.style.position = 'absolute';
          balloon.style.left = Math.random() * 90 + 'vw';
          balloon.style.bottom = '-60px';
          balloon.style.width = '32px';
          balloon.style.height = '40px';
          balloon.style.borderRadius = '16px 16px 16px 16px/24px 24px 16px 16px';
          balloon.style.background = `hsl(${Math.random() * 360},90%,70%)`;
          balloon.style.boxShadow = '0 4px 16px #ffb34780';
          balloon.style.zIndex = 9999;
          balloon.style.opacity = 0.9;
          balloon.style.transition = 'transform 2.5s cubic-bezier(.77,0,.18,1), opacity 0.5s';
          congratsEffect.appendChild(balloon);
          setTimeout(() => {
               balloon.style.transform = `translateY(-${window.innerHeight * 0.8 + Math.random() * 100}px)`;
               balloon.style.opacity = 0;
          }, 50);
     }
     congratsEffect.style.display = 'block';
     setTimeout(() => {
          congratsEffect.style.display = 'none';
          congratsEffect.innerHTML = '';
          alert('Aapki request aa gayi hai!');
     }, 2500);
}

// Floating Mascot follows scroll
const floatingMascot = document.getElementById('floatingMascot');
function updateMascotPosition() {
     const scrollY = window.scrollY;
     const vh = window.innerHeight;
     // Mascot stays 20vh from top, but moves with scroll
     floatingMascot.style.top = (20 + (scrollY / vh) * 40) + 'vh';
}
window.addEventListener('scroll', updateMascotPosition);
updateMascotPosition();

// Mobile Navbar Toggle
const navbarToggle = document.getElementById('navbarToggle');
const navbarMenu = document.getElementById('navbarMenu');
navbarToggle.addEventListener('click', () => {
     navbarMenu.classList.toggle('active');
});
// Close menu on link click (mobile)
document.querySelectorAll('.navbar-links a').forEach(link => {
     link.addEventListener('click', () => {
          if (window.innerWidth <= 900) {
               navbarMenu.classList.remove('active');
          }
     });
});

// Social Popup for Footer Icons
const socialLinks = document.querySelectorAll('.social-link');
const socialPopup = document.getElementById('socialPopup');
const popupAllow = document.getElementById('popupAllow');
const popupCancel = document.getElementById('popupCancel');
let pendingSocialHref = null;
socialLinks.forEach(link => {
     link.addEventListener('click', function (e) {
          e.preventDefault();
          pendingSocialHref = link.getAttribute('href');
          socialPopup.classList.add('active');
     });
});
function closeSocialPopup() {
     socialPopup.classList.remove('active');
     pendingSocialHref = null;
}
if (popupAllow) {
     popupAllow.onclick = function () {
          if (pendingSocialHref && pendingSocialHref !== '#') {
               window.open(pendingSocialHref, '_blank');
          }
          closeSocialPopup();
     };
}
if (popupCancel) {
     popupCancel.onclick = closeSocialPopup;
}
// Optional: close popup on outside click
socialPopup.addEventListener('click', function (e) {
     if (e.target === socialPopup) closeSocialPopup();
});

// Scroll Progress Bar
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
     const scrollTop = window.scrollY;
     const docHeight = document.body.scrollHeight - window.innerHeight;
     const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
     scrollProgress.style.width = percent + '%';
});

// Signature Badge Tooltip
const signatureBadge = document.getElementById('signatureBadge');
const signatureTooltip = document.getElementById('signatureTooltip');
let badgeActive = false;
function toggleSignatureTooltip() {
     badgeActive = !badgeActive;
     if (badgeActive) {
          signatureBadge.classList.add('active');
     } else {
          signatureBadge.classList.remove('active');
     }
}
signatureBadge.addEventListener('click', toggleSignatureTooltip);
document.addEventListener('click', (e) => {
     if (!signatureBadge.contains(e.target)) {
          signatureBadge.classList.remove('active');
          badgeActive = false;
     }
});

// Back to Top Button
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
     if (window.scrollY > 300) {
          backToTop.classList.add('show');
     } else {
          backToTop.classList.remove('show');
     }
});
backToTop.addEventListener('click', () => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Section Reveal Animation
const revealSections = document.querySelectorAll('[data-section]');
const observer = new window.IntersectionObserver((entries) => {
     entries.forEach(entry => {
          if (entry.isIntersecting) {
               entry.target.classList.add('visible');
          }
     });
}, { threshold: 0.15 });
revealSections.forEach(section => observer.observe(section));

// Food Card 'Order Now' Buttons
const orderCardBtns = document.querySelectorAll('.order-card-btn');
if (typeof orderCardBtns !== 'undefined' && orderCardBtns.length) {
     orderCardBtns.forEach(btn => {
          btn.addEventListener('click', function () {
               const card = btn.closest('.food-card');
               const foodName = card.getAttribute('data-name');
               orderFoodName.textContent = 'Ordering: ' + foodName;
               orderFoodName.style.display = 'block';
               orderForm.style.display = 'flex';
               orderForm.scrollIntoView({ behavior: 'smooth' });
          });
     });
}

// Food Menu Checkbox Selection
const menuCheckboxes = document.querySelectorAll('.menu-checkbox');
const selectedMenuList = document.getElementById('selectedMenuList');
if (typeof menuCheckboxes !== 'undefined' && menuCheckboxes.length && selectedMenuList) {
     function updateSelectedMenuList() {
          const selected = Array.from(menuCheckboxes)
               .filter(cb => cb.checked)
               .map(cb => cb.value);
          selectedMenuList.innerHTML = '';
          selected.forEach(item => {
               const li = document.createElement('li');
               li.textContent = item;
               selectedMenuList.appendChild(li);
          });
     }
     menuCheckboxes.forEach(cb => {
          cb.addEventListener('change', updateSelectedMenuList);
     });
     // Initial update
     updateSelectedMenuList();
}

// Loader Overlay Logic
const loaderOverlay = document.getElementById('loaderOverlay');
const modeButtons = document.getElementById('modeButtons');
const langSection = document.getElementById('langSection');
const chooseLight = document.getElementById('chooseLight');
const chooseDark = document.getElementById('chooseDark');
const chooseEnglish = document.getElementById('chooseEnglish');
const chooseUrdu = document.getElementById('chooseUrdu');

// Video Intro and Enhanced Loader Flow
const videoIntroOverlay = document.getElementById('videoIntroOverlay');
const introVideo = document.getElementById('introVideo');
const skipIntroBtn = document.getElementById('skipIntroBtn');

// Handle video loading errors
if (introVideo) {
     introVideo.addEventListener('error', () => {
          // Show fallback background when video fails to load
          const fallbackBg = document.querySelector('.video-fallback-bg');
          if (fallbackBg) {
               fallbackBg.style.opacity = '1';
          }
     });
}

// Add particle effects to video intro
function addVideoIntroParticles() {
     if (!videoIntroOverlay) return;

     const particles = ['🍕', '🍔', '🍟', '🌭', '🌮', '🍦', '🍩', '🥤'];

     setInterval(() => {
          if (videoIntroOverlay.classList.contains('hidden')) return;

          const particle = document.createElement('div');
          particle.className = 'intro-particle';
          particle.textContent = particles[Math.floor(Math.random() * particles.length)];
          particle.style.left = Math.random() * 100 + '%';
          particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
          particle.style.opacity = Math.random() * 0.5 + 0.3;

          videoIntroOverlay.appendChild(particle);

          setTimeout(() => {
               if (particle.parentNode) {
                    particle.remove();
               }
          }, 5000);
     }, 800);
}

// Start particle effects when video intro shows
if (videoIntroOverlay && !localStorage.getItem('food3d-intro-seen')) {
     setTimeout(addVideoIntroParticles, 1000);
}

// Check if user has seen intro before
const hasSeenIntro = localStorage.getItem('food3d-intro-seen');

if (hasSeenIntro) {
     // Skip video intro if already seen
     if (videoIntroOverlay) {
          videoIntroOverlay.classList.add('hidden');
          setTimeout(() => {
               videoIntroOverlay.style.display = 'none';
          }, 800);
     }
     if (loaderOverlay) loaderOverlay.style.display = 'flex';
} else {
     // Show video intro for first-time visitors
     if (videoIntroOverlay) {
          videoIntroOverlay.style.display = 'flex';
          // Add entrance animation
          setTimeout(() => {
               videoIntroOverlay.classList.add('show');
          }, 100);
     }
     if (loaderOverlay) loaderOverlay.style.display = 'none';

     // Auto-hide video intro after 4 seconds
     setTimeout(() => {
          if (videoIntroOverlay && !videoIntroOverlay.classList.contains('hidden')) {
               hideVideoIntro();
          }
     }, 4000);
}

// Skip intro button functionality
if (skipIntroBtn) {
     skipIntroBtn.addEventListener('click', () => {
          hideVideoIntro();
     });

     // Add hover effect to skip button
     skipIntroBtn.addEventListener('mouseenter', () => {
          skipIntroBtn.style.transform = 'scale(1.1)';
     });

     skipIntroBtn.addEventListener('mouseleave', () => {
          skipIntroBtn.style.transform = 'scale(1)';
     });
}

// Hide video intro and show loader
function hideVideoIntro() {
     if (videoIntroOverlay) {
          videoIntroOverlay.classList.add('hidden');
          setTimeout(() => {
               videoIntroOverlay.style.display = 'none';
               if (loaderOverlay) loaderOverlay.style.display = 'flex';
          }, 800);
     }
     localStorage.setItem('food3d-intro-seen', 'true');
}

// Enhanced loader flow with video intro
function showLoaderAfterIntro() {
     if (videoIntroOverlay && !videoIntroOverlay.classList.contains('hidden')) {
          hideVideoIntro();
     }
}

// Sponsor Button Functionality
const sponsorBtn = document.getElementById('sponsorBtn');
if (sponsorBtn) {
     sponsorBtn.addEventListener('click', () => {
          // Show sponsor info modal
          showSponsorModal();
     });
}

function showSponsorModal() {
     const modal = document.createElement('div');
     modal.className = 'sponsor-modal';
     modal.innerHTML = `
          <div class="sponsor-modal-content">
               <div class="sponsor-modal-header">
                    <h3>Sponsored by Coding aur Code</h3>
                    <button class="sponsor-modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✖️</button>
               </div>
               <div class="sponsor-modal-body">
                    <div class="sponsor-info">
                         <div class="sponsor-logo">💻</div>
                         <h4>Coding aur Code</h4>
                         <p>Professional Web Development Services</p>
                         <div class="sponsor-features">
                              <div class="feature-item">🚀 Modern Web Development</div>
                              <div class="feature-item">🎨 Creative Design</div>
                              <div class="feature-item">📱 Responsive Websites</div>
                              <div class="feature-item">⚡ Fast & Optimized</div>
                         </div>
                         <div class="sponsor-contact">
                              <p>Contact: mughalahmedali592@gmail.com</p>
                              <p>Website: https://coderaam.github.io/portfolio_A/</p>
                         </div>
                    </div>
               </div>
          </div>
     `;
     document.body.appendChild(modal);

     setTimeout(() => modal.classList.add('show'), 100);
}

// Enhanced Copy Protection
document.addEventListener('contextmenu', (e) => {
     e.preventDefault();
     showCopyProtectionAlert();
});

document.addEventListener('keydown', (e) => {
     // Prevent Ctrl+A, Ctrl+C, Ctrl+X, Ctrl+V, F12
     if ((e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'x' || e.key === 'v')) || e.key === 'F12') {
          e.preventDefault();
          showCopyProtectionAlert();
     }
});

function showCopyProtectionAlert() {
     const alert = document.createElement('div');
     alert.className = 'copy-protection-alert';
     alert.innerHTML = `
          <div class="copy-alert-content">
               <div class="copy-alert-icon">🚫</div>
               <h4>Copy Protection Active</h4>
               <p>This content is protected. Please contact us for permissions.</p>
               <button onclick="this.parentElement.parentElement.remove()">OK</button>
          </div>
     `;
     document.body.appendChild(alert);

     setTimeout(() => alert.classList.add('show'), 100);
     setTimeout(() => {
          if (alert.parentNode) {
               alert.classList.remove('show');
               setTimeout(() => alert.remove(), 300);
          }
     }, 3000);
}

// Close Game Function
function closeGame() {
     const gameModals = document.querySelectorAll('.quiz-modal, .memory-modal, .wheel-modal');
     gameModals.forEach(modal => {
          modal.style.animation = 'fadeOut 0.3s ease';
          setTimeout(() => modal.remove(), 300);
     });
}

// WhatsApp Integration
const whatsappBtn = document.getElementById('whatsappBtn');
if (whatsappBtn) {
     whatsappBtn.addEventListener('click', () => {
          const message = encodeURIComponent('Hi! I want to order food from Food3D. Can you help me?');
          const phone = '923001234567'; // Replace with actual phone number
          window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
     });
}

// Games Functionality
function startQuizGame() {
     const questions = [
          { question: 'What is the main ingredient in pizza?', answer: 'cheese', options: ['cheese', 'tomato', 'bread', 'meat'] },
          { question: 'Which food is known as "King of Fast Food"?', answer: 'burger', options: ['pizza', 'burger', 'fries', 'hotdog'] },
          { question: 'What color is a ripe banana?', answer: 'yellow', options: ['green', 'yellow', 'red', 'orange'] }
     ];

     let currentQuestion = 0;
     let score = 0;

     function showQuestion() {
          const q = questions[currentQuestion];
          const modal = document.createElement('div');
          modal.className = 'quiz-modal';
          modal.innerHTML = `
               <div class="quiz-content">
                    <div class="game-header">
                         <h3>Question ${currentQuestion + 1}/${questions.length}</h3>
                         <button class="cancel-game-btn" onclick="closeGame()">✖️</button>
                    </div>
                    <p>${q.question}</p>
                    <div class="quiz-options">
                         ${q.options.map(option => `
                              <button class="quiz-option" onclick="checkAnswer('${option}')">${option}</button>
                         `).join('')}
                    </div>
                    <p>Score: ${score}</p>
               </div>
          `;
          document.body.appendChild(modal);
     }

     window.checkAnswer = function (answer) {
          if (answer === questions[currentQuestion].answer) {
               score++;
               showMessage('Correct! 🎉');
          } else {
               showMessage('Wrong! 😢');
          }

          currentQuestion++;
          if (currentQuestion < questions.length) {
               setTimeout(showQuestion, 1000);
          } else {
               setTimeout(() => {
                    showMessage(`Game Over! Final Score: ${score}/${questions.length}`);
                    document.querySelector('.quiz-modal').remove();
               }, 1000);
          }
     };

     showQuestion();
}

function startMemoryGame() {
     const foods = ['🍕', '🍔', '🍟', '🌭', '🌮', '🍦', '🍩', '🥤'];
     const gameBoard = [...foods, ...foods].sort(() => Math.random() - 0.5);
     let flippedCards = [];
     let matchedPairs = 0;
     let totalPairs = foods.length;

     const modal = document.createElement('div');
     modal.className = 'memory-modal';
     modal.innerHTML = `
          <div class="memory-content">
               <div class="game-header">
                    <h3>Memory Match Game</h3>
                    <button class="cancel-game-btn" onclick="closeGame()">✖️</button>
               </div>
               <div class="memory-grid">
                    ${gameBoard.map((food, index) => `
                         <div class="memory-card" data-index="${index}" data-food="${food}" onclick="flipCard(this)">
                              <span class="card-back">❓</span>
                              <span class="card-front">${food}</span>
                         </div>
                    `).join('')}
               </div>
               <div class="game-stats">
                    <p>Matched: <span id="matchedCount">0</span>/<span id="totalPairs">${totalPairs}</span></p>
                    <p>Moves: <span id="moveCount">0</span></p>
               </div>
          </div>
     `;
     document.body.appendChild(modal);

     // Store game state globally
     window.memoryGameState = {
          flippedCards,
          matchedPairs,
          totalPairs,
          moveCount: 0
     };
}

// Memory game card flip function
function flipCard(card) {
     if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

     card.classList.add('flipped');
     window.memoryGameState.flippedCards.push(card);

     if (window.memoryGameState.flippedCards.length === 2) {
          window.memoryGameState.moveCount++;
          document.getElementById('moveCount').textContent = window.memoryGameState.moveCount;

          const [card1, card2] = window.memoryGameState.flippedCards;

          if (card1.dataset.food === card2.dataset.food) {
               // Match found!
               card1.classList.add('matched');
               card2.classList.add('matched');
               window.memoryGameState.matchedPairs++;
               document.getElementById('matchedCount').textContent = window.memoryGameState.matchedPairs;

               if (window.memoryGameState.matchedPairs === window.memoryGameState.totalPairs) {
                    // Game won!
                    setTimeout(() => {
                         showMessage('🎉 Congratulations! You won! +20 points earned!');
                         addPoints(20);
                         closeGame();
                    }, 500);
               }
          } else {
               // No match, flip back
               setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
               }, 1000);
          }

          window.memoryGameState.flippedCards = [];
     }
}

function startSpinWheel() {
     const prizes = ['10% OFF', 'Free Fries', '20% OFF', 'Free Drink', '15% OFF', 'Free Pizza'];
     const modal = document.createElement('div');
     modal.className = 'wheel-modal';
     modal.innerHTML = `
          <div class="wheel-content">
               <div class="game-header">
                    <h3>Spin & Win!</h3>
                    <button class="cancel-game-btn" onclick="closeGame()">✖️</button>
               </div>
               <div class="wheel" id="wheel">
                    ${prizes.map((prize, index) => `
                         <div class="wheel-segment" style="transform: rotate(${index * 60}deg)">
                              <span>${prize}</span>
                         </div>
                    `).join('')}
               </div>
               <button class="spin-btn" onclick="spinWheel()">SPIN!</button>
               <div class="wheel-result" id="wheelResult" style="display: none;">
                    <h4>🎉 You Won!</h4>
                    <p id="prizeText"></p>
                    <button class="claim-prize-btn" onclick="claimPrize()">Claim Prize</button>
               </div>
          </div>
     `;
     document.body.appendChild(modal);
}

// Spin wheel function
function spinWheel() {
     const wheel = document.getElementById('wheel');
     const spinBtn = document.querySelector('.spin-btn');
     const resultDiv = document.getElementById('wheelResult');
     const prizeText = document.getElementById('prizeText');

     if (wheel.classList.contains('spinning')) return;

     // Disable spin button
     spinBtn.disabled = true;
     spinBtn.textContent = 'Spinning...';
     wheel.classList.add('spinning');

     // Random spin
     const spins = 5 + Math.random() * 5; // 5-10 spins
     const finalAngle = Math.random() * 360;
     const totalRotation = spins * 360 + finalAngle;

     wheel.style.transform = `rotate(${totalRotation}deg)`;

     // Calculate prize
     setTimeout(() => {
          const segmentAngle = 360 / 6; // 6 prizes
          const normalizedAngle = finalAngle % 360;
          const prizeIndex = Math.floor(normalizedAngle / segmentAngle);
          const prizes = ['10% OFF', 'Free Fries', '20% OFF', 'Free Drink', '15% OFF', 'Free Pizza'];
          const wonPrize = prizes[prizeIndex];

          // Show result
          prizeText.textContent = wonPrize;
          resultDiv.style.display = 'block';

          // Add points based on prize
          let pointsEarned = 0;
          if (wonPrize.includes('OFF')) pointsEarned = 15;
          else if (wonPrize.includes('Free')) pointsEarned = 25;

          setTimeout(() => {
               showMessage(`🎉 You won ${wonPrize}! +${pointsEarned} points earned!`);
               addPoints(pointsEarned);
          }, 1000);

          wheel.classList.remove('spinning');
     }, 3000);
}

// Claim prize function
function claimPrize() {
     showMessage('🎁 Prize claimed! Check your rewards!');
     closeGame();
}

// Loyalty Program
let userPoints = parseInt(localStorage.getItem('userPoints')) || 0;
let userLevel = localStorage.getItem('userLevel') || 'Bronze';

function updateLoyaltyDisplay() {
     const pointsElement = document.getElementById('userPoints');
     const levelElement = document.getElementById('userLevel');
     const progressFill = document.getElementById('progressFill');
     const rewardsList = document.getElementById('rewardsList');

     if (pointsElement) pointsElement.textContent = userPoints;
     if (levelElement) levelElement.textContent = userLevel + ' Member';

     // Update progress bar
     let nextLevelPoints = 100;
     if (userLevel === 'Bronze') nextLevelPoints = 100;
     else if (userLevel === 'Silver') nextLevelPoints = 300;
     else if (userLevel === 'Gold') nextLevelPoints = 500;

     const progress = (userPoints % nextLevelPoints) / nextLevelPoints * 100;
     if (progressFill) progressFill.style.width = progress + '%';

     // Update rewards list
     if (rewardsList) {
          const rewards = getRewardsForLevel(userLevel);
          rewardsList.innerHTML = rewards.map(reward => `
               <div class="reward-item">
                    <span class="reward-icon">${reward.icon}</span>
                    <span class="reward-text">${reward.text}</span>
                    <span class="reward-status">${reward.available ? '✅ Available' : '🔒 Locked'}</span>
               </div>
          `).join('');
     }

     // Check for level up
     if (userPoints >= nextLevelPoints) {
          if (userLevel === 'Bronze') {
               userLevel = 'Silver';
               showMessage('🎉 Level Up! You are now Silver Member!');
          } else if (userLevel === 'Silver') {
               userLevel = 'Gold';
               showMessage('🎉 Level Up! You are now Gold Member!');
          }
          localStorage.setItem('userLevel', userLevel);
     }

     localStorage.setItem('userPoints', userPoints);
}

// Get rewards for each level
function getRewardsForLevel(level) {
     const baseRewards = [
          { icon: '🎁', text: 'Welcome Gift', available: true },
          { icon: '📧', text: 'Newsletter Access', available: true },
          { icon: '🎮', text: 'Free Games', available: true }
     ];

     if (level === 'Silver') {
          return [
               ...baseRewards,
               { icon: '🍕', text: 'Free Pizza (500 pts)', available: userPoints >= 500 },
               { icon: '🍔', text: 'Free Burger (400 pts)', available: userPoints >= 400 },
               { icon: '🎉', text: 'Birthday Bonus', available: true }
          ];
     } else if (level === 'Gold') {
          return [
               ...baseRewards,
               { icon: '🍕', text: 'Free Pizza (500 pts)', available: userPoints >= 500 },
               { icon: '🍔', text: 'Free Burger (400 pts)', available: userPoints >= 400 },
               { icon: '🎉', text: 'Birthday Bonus', available: true },
               { icon: '⭐', text: 'VIP Support', available: true },
               { icon: '🎯', text: 'Priority Orders', available: true },
               { icon: '💎', text: 'Exclusive Menu', available: true }
          ];
     }

     return baseRewards;
}

// Add points when ordering
function addPoints(amount) {
     userPoints += amount;
     updateLoyaltyDisplay();
     showMessage(`+${amount} points earned! 🎉`);
}

// Location Features
function openGoogleMaps() {
     const address = '123 Food Street, Karachi, Pakistan';
     const encodedAddress = encodeURIComponent(address);
     window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
}

// Personalization
function saveUserProfile() {
     const name = document.getElementById('userName').value;
     const email = document.getElementById('userEmail').value;
     const preference = document.getElementById('foodPreference').value;

     if (name && email) {
          localStorage.setItem('userName', name);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('foodPreference', preference);
          showMessage('Profile saved successfully! ✅');
     } else {
          showMessage('Please fill all required fields! ❌');
     }
}

// Load user profile
function loadUserProfile() {
     const name = localStorage.getItem('userName');
     const email = localStorage.getItem('userEmail');
     const preference = localStorage.getItem('foodPreference');

     if (name) document.getElementById('userName').value = name;
     if (email) document.getElementById('userEmail').value = email;
     if (preference) document.getElementById('foodPreference').value = preference;
}

// Analytics
function updateAnalytics() {
     const popularItems = [
          { name: 'Pizza Mania', orders: 156 },
          { name: 'Burger Blast', orders: 142 },
          { name: 'Fries Fiesta', orders: 98 },
          { name: 'Ice Cream Dream', orders: 87 }
     ];

     const popularContainer = document.getElementById('popularItems');
     if (popularContainer) {
          popularContainer.innerHTML = popularItems.map(item => `
               <div class="analytics-item">
                    <span>${item.name}</span>
                    <span>${item.orders} orders</span>
               </div>
          `).join('');
     }

     const trendingItems = [
          { name: 'Taco Treat', trend: '🔥 Hot' },
          { name: 'Donut Delight', trend: '📈 Rising' },
          { name: 'Sandwich Supreme', trend: '⭐ Popular' }
     ];

     const trendingContainer = document.getElementById('trendingItems');
     if (trendingContainer) {
          trendingContainer.innerHTML = trendingItems.map(item => `
               <div class="analytics-item">
                    <span>${item.name}</span>
                    <span>${item.trend}</span>
               </div>
          `).join('');
     }
}

// Audio Features
let isAudioEnabled = false;

function playBackgroundMusic() {
     if (!isAudioEnabled) {
          showMessage('🎵 Background music enabled!');
          isAudioEnabled = true;
     } else {
          showMessage('🔇 Background music disabled!');
          isAudioEnabled = false;
     }
}

function toggleVoiceNavigation() {
     showMessage('🎤 Voice navigation toggled!');
}

function toggleAudioDescriptions() {
     showMessage('🔊 Audio descriptions toggled!');
}

// Social Sharing
function shareOnSocial() {
     if (navigator.share) {
          navigator.share({
               title: 'Food3D - Amazing Food Website',
               text: 'Check out this amazing food website!',
               url: window.location.href
          });
     } else {
          // Fallback for browsers that don't support Web Share API
          const url = encodeURIComponent(window.location.href);
          const text = encodeURIComponent('Check out this amazing food website!');
          window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
     }
}

// Special Events
function claimBirthdayOffer() {
     const today = new Date();
     const userBirthday = localStorage.getItem('userBirthday');

     if (userBirthday) {
          const birthday = new Date(userBirthday);
          if (today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate()) {
               showMessage('🎉 Happy Birthday! You got 50% OFF!');
               addPoints(50);
          } else {
               showMessage('🎂 Please set your birthday in profile to claim offer!');
          }
     } else {
          showMessage('🎂 Please set your birthday in profile to claim offer!');
     }
}

function viewRamadanMenu() {
     showMessage('🌙 Special Ramadan menu coming soon!');
}

function viewFestivalMenu() {
     showMessage('🎄 Festival menu coming soon!');
}

// Utility function for messages
function showMessage(message) {
     const msgDiv = document.createElement('div');
     msgDiv.className = 'message-popup';
     msgDiv.textContent = message;
     msgDiv.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(45deg, #ffb347, #ff7e5f);
          color: white;
          padding: 1rem 2rem;
          border-radius: 2rem;
          z-index: 10000;
          animation: slideIn 0.3s ease;
     `;
     document.body.appendChild(msgDiv);

     setTimeout(() => {
          msgDiv.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => msgDiv.remove(), 300);
     }, 3000);
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
     updateLoyaltyDisplay();
     loadUserProfile();
     updateAnalytics();

     // Audio controls toggle
     const audioBtn = document.getElementById('audioBtn');
     const audioMenu = document.getElementById('audioMenu');

     if (audioBtn && audioMenu) {
          audioBtn.addEventListener('click', () => {
               audioMenu.style.display = audioMenu.style.display === 'flex' ? 'none' : 'flex';
          });
     }
});

// Translation object
const translations = {
     en: {
          mainHeading: 'Welcome to 3D Food World!',
          orderNow: 'Order Now',
          foodMenu: 'Food Menu',
          fastFood: 'Fast Food',
          localFood: 'Local Food',
          selectedItems: 'Selected Items:',
          placeOrder: 'Place Your Order',
          yourName: 'Your Name',
          yourEmail: 'Your Email',
          phoneNumber: 'Phone Number',
          orderDetails: 'Order Details (e.g. 2x Pizza, 1x Burger)',
          sendOrder: 'Send Order',
          aboutHeading: 'About Our Food World',
          aboutText: 'We bring you the best fast food experience with a 3D twist! Enjoy delicious meals, quick service, and a vibrant atmosphere. Watch our story to know more about our passion for food.',
          contact: 'Contact',
          email: 'Email',
          phone: 'Phone',
          followUs: 'Follow Us',
          cart: 'Your Cart',
          pizza: 'Pizza',
          burger: 'Burger',
          fries: 'Fries',
          sandwich: 'Sandwich',
          hotdog: 'Hotdog',
          taco: 'Taco',
          chickenNuggets: 'Chicken Nuggets',
          donut: 'Donut',
          iceCream: 'Ice Cream',
          shawarma: 'Shawarma',
          biryani: 'Biryani',
          nihari: 'Nihari',
          karahi: 'Karahi',
          haleem: 'Haleem',
          qeema: 'Qeema',
          daalChawal: 'Daal Chawal',
          chapliKebab: 'Chapli Kebab',
          parathaRoll: 'Paratha Roll',
          samosa: 'Samosa',
          pakora: 'Pakora',
          // ...add more as needed
     },
     ur: {
          mainHeading: '3D فوڈ ورلڈ میں خوش آمدید!',
          orderNow: 'آرڈر کریں',
          foodMenu: 'فوڈ مینو',
          fastFood: 'فاسٹ فوڈ',
          localFood: 'مقامی کھانے',
          selectedItems: 'منتخب اشیاء:',
          placeOrder: 'اپنا آرڈر دیں',
          yourName: 'آپ کا نام',
          yourEmail: 'آپ کا ای میل',
          phoneNumber: 'فون نمبر',
          orderDetails: 'آرڈر کی تفصیل (مثلاً 2 پیزا، 1 برگر)',
          sendOrder: 'آرڈر بھیجیں',
          aboutHeading: 'ہمارے فوڈ ورلڈ کے بارے میں',
          aboutText: 'ہم آپ کو 3D انداز میں بہترین فاسٹ فوڈ تجربہ فراہم کرتے ہیں! مزیدار کھانے، تیز سروس اور شاندار ماحول سے لطف اٹھائیں۔ ہماری کہانی جاننے کے لیے ویڈیو دیکھیں۔',
          contact: 'رابطہ',
          email: 'ای میل',
          phone: 'فون',
          followUs: 'ہمیں فالو کریں',
          cart: 'آپ کی ٹوکری',
          pizza: 'پیزا',
          burger: 'برگر',
          fries: 'فرائز',
          sandwich: 'سینڈوچ',
          hotdog: 'ہاٹ ڈاگ',
          taco: 'ٹاکو',
          chickenNuggets: 'چکن نگٹس',
          donut: 'ڈونٹ',
          iceCream: 'آئس کریم',
          shawarma: 'شاورما',
          biryani: 'بریانی',
          nihari: 'نہاری',
          karahi: 'کڑاہی',
          haleem: 'حلیم',
          qeema: 'قیمہ',
          daalChawal: 'دال چاول',
          chapliKebab: 'چپلی کباب',
          parathaRoll: 'پراٹھا رول',
          samosa: 'سموسہ',
          pakora: 'پکوڑا',
          // ...add more as needed
     }
};

function updateLanguage(lang) {
     document.querySelectorAll('[data-translate]').forEach(el => {
          const key = el.getAttribute('data-translate');
          if (translations[lang][key]) {
               el.textContent = translations[lang][key];
          }
     });
}

window.addEventListener('DOMContentLoaded', () => {
     loaderOverlay.style.display = 'flex';
     document.body.style.overflow = 'hidden';
});

chooseLight.addEventListener('click', () => {
     setMode(false);
     modeButtons.style.display = 'none';
     langSection.style.display = 'block';
});
chooseDark.addEventListener('click', () => {
     setMode(true);
     modeButtons.style.display = 'none';
     langSection.style.display = 'block';
});
chooseEnglish.addEventListener('click', () => {
     document.body.classList.remove('rtl');
     updateLanguage('en');
     loaderOverlay.style.display = 'none';
     document.body.style.overflow = '';
});
chooseUrdu.addEventListener('click', () => {
     document.body.classList.add('rtl');
     updateLanguage('ur');
     loaderOverlay.style.display = 'none';
     document.body.style.overflow = '';
});

// PDF Download for Selected Menu
const menuDoneBtn = document.getElementById('menuDoneBtn');
if (typeof menuDoneBtn !== 'undefined' && menuDoneBtn) {
     menuDoneBtn.addEventListener('click', function () {
          const selected = Array.from(menuCheckboxes)
               .filter(cb => cb.checked)
               .map(cb => cb.value);
          if (selected.length === 0) {
               alert('Please select at least one item!');
               return;
          }
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(18);
          doc.text('Your Selected Food Menu', 15, 20);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(14);
          selected.forEach((item, i) => {
               doc.text(`• ${item}`, 20, 35 + i * 10);
          });
          doc.save('food3d-menu.pdf');
     });
}

// AJAX Formspree Submit for Order Form
orderForm.addEventListener('submit', function (e) {
     e.preventDefault();
     const formData = new FormData(orderForm);
     fetch(orderForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
     })
          .then(response => {
               if (response.ok) {
                    orderForm.style.display = 'none';
                    orderFoodName.style.display = 'none';
                    formSuccessMsg.textContent = 'Successfully! آپ کا آرڈر سبمٹ ہو گیا ہے.';
                    formSuccessMsg.style.display = 'block';
                    showCongratsEffect();
                    setTimeout(() => { formSuccessMsg.style.display = 'none'; }, 4000);
                    orderForm.reset();
               } else {
                    return response.json().then(data => {
                         throw new Error(data.error || 'Submission failed.');
                    });
               }
          })
          .catch(() => {
               formSuccessMsg.textContent = 'Sorry, there was a problem submitting your order.';
               formSuccessMsg.style.display = 'block';
               setTimeout(() => { formSuccessMsg.style.display = 'none'; }, 4000);
          });
});

// Button Ripple Effect
function addRipple(e) {
     const btn = e.currentTarget;
     const circle = document.createElement('span');
     circle.className = 'ripple';
     const rect = btn.getBoundingClientRect();
     const size = Math.max(rect.width, rect.height);
     circle.style.width = circle.style.height = size + 'px';
     circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
     circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
     btn.appendChild(circle);
     setTimeout(() => circle.remove(), 600);
}

// Advanced particle effect for special interactions
function createParticles(x, y, color = '#ffb347') {
     for (let i = 0; i < 8; i++) {
          const particle = document.createElement('div');
          particle.style.position = 'fixed';
          particle.style.left = x + 'px';
          particle.style.top = y + 'px';
          particle.style.width = '4px';
          particle.style.height = '4px';
          particle.style.background = color;
          particle.style.borderRadius = '50%';
          particle.style.pointerEvents = 'none';
          particle.style.zIndex = '10000';
          particle.style.transition = 'all 0.6s cubic-bezier(.77,0,.18,1)';

          document.body.appendChild(particle);

          const angle = (i / 8) * Math.PI * 2;
          const distance = 50 + Math.random() * 30;
          const finalX = x + Math.cos(angle) * distance;
          const finalY = y + Math.sin(angle) * distance;

          setTimeout(() => {
               particle.style.transform = `translate(${finalX - x}px, ${finalY - y}px)`;
               particle.style.opacity = '0';
          }, 10);

          setTimeout(() => {
               if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
               }
          }, 600);
     }
}

// Enhanced mascot interaction
function enhanceMascotInteraction() {
     const mascot = document.getElementById('floatingMascot');
     if (mascot) {
          mascot.addEventListener('click', (e) => {
               createParticles(e.clientX, e.clientY, '#ff7e5f');
               mascot.style.transform = 'scale(1.3) rotate(15deg)';
               setTimeout(() => {
                    mascot.style.transform = '';
               }, 300);
          });
     }
}

// Initialize enhanced interactions
enhanceMascotInteraction();

// Advanced scroll animations
function addScrollAnimations() {
     const observerOptions = {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
     };

     const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
               if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                    entry.target.style.filter = 'blur(0)';

                    // Add staggered animation for food cards
                    if (entry.target.classList.contains('food-card')) {
                         const cards = entry.target.parentElement.children;
                         Array.from(cards).forEach((card, index) => {
                              setTimeout(() => {
                                   card.style.opacity = '1';
                                   card.style.transform = 'translateY(0) scale(1)';
                              }, index * 100);
                         });
                    }
               }
          });
     }, observerOptions);

     // Observe all animated elements
     document.querySelectorAll('.food-card, .btn-3d, .about-section, .food-menu-section').forEach(el => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(30px) scale(0.95)';
          el.style.filter = 'blur(5px)';
          el.style.transition = 'all 0.6s cubic-bezier(.77,0,.18,1)';
          observer.observe(el);
     });
}

// Initialize scroll animations
addScrollAnimations();
['.btn-3d', '.order-card-btn', '.add-cart-btn', '.loader-btn', '#menuDoneBtn'].forEach(sel => {
     document.querySelectorAll(sel).forEach(btn => {
          btn.addEventListener('click', addRipple);
     });
});

// Mascot VIP Center Animation on Scroll
const mascot = document.getElementById('floatingMascot');
const footer = document.querySelector('footer');
function checkMascotVIP() {
     const mascotRect = mascot.getBoundingClientRect();
     const footerRect = footer.getBoundingClientRect();
     // If footer is visible in viewport (bottom of page)
     if (footerRect.top < window.innerHeight - 100) {
          mascot.classList.add('mascot-center');
     } else {
          mascot.classList.remove('mascot-center');
     }
}
window.addEventListener('scroll', checkMascotVIP);
window.addEventListener('resize', checkMascotVIP);
checkMascotVIP();

// Food Menu Selection Hold (localStorage)
const foodMenuSection = document.getElementById('foodMenuSection');
if (foodMenuSection) {
     const MENU_KEY = 'food3d-menu-selection';
     // Restore selection on load
     const saved = JSON.parse(localStorage.getItem(MENU_KEY) || '[]');
     menuCheckboxes.forEach(cb => {
          if (saved.includes(cb.value)) cb.checked = true;
     });
     if (typeof updateSelectedMenuList === 'function') updateSelectedMenuList();
     // Save selection on change
     menuCheckboxes.forEach(cb => {
          cb.addEventListener('change', () => {
               const selected = Array.from(menuCheckboxes)
                    .filter(c => c.checked)
                    .map(c => c.value);
               localStorage.setItem(MENU_KEY, JSON.stringify(selected));
          });
     });
}

// 70% OFF Offer Countdown Timer
const offerTimer = document.getElementById('offerTimer');
const timerCountdown = document.getElementById('timerCountdown');

// Set offer end time (e.g., 2 hours from now, or set a specific date/time)
const offerEnd = new Date();
offerEnd.setHours(offerEnd.getHours() + 2); // 2 hours from now

function updateOfferTimer() {
     const now = new Date();
     const diff = offerEnd - now;
     if (diff > 0) {
          const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
          const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
          const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
          timerCountdown.textContent = `${hours}:${mins}:${secs}`;
     } else {
          timerCountdown.textContent = '00:00:00';
          if (offerTimer) offerTimer.parentElement.style.display = 'none';
          clearInterval(timerInterval);
     }
}
const timerInterval = setInterval(updateOfferTimer, 1000);
updateOfferTimer();

// Ensure menu-checkboxes have correct structure for animated effect
window.addEventListener('DOMContentLoaded', function () {
     document.querySelectorAll('.menu-checkbox').forEach(function (checkbox) {
          const label = checkbox.closest('label');
          if (label) {
               // Move the span immediately after the checkbox if not already
               const span = label.querySelector('span');
               if (span && checkbox.nextSibling !== span) {
                    label.insertBefore(span, checkbox.nextSibling);
               }
          }
     });
});

// Customer Feedback/Review Carousel
const reviews = [
     {
          text: 'Yahan ka pizza zabardast hai! Service bhi fast hai.',
          stars: 5,
          author: 'Ali (Karachi)'
     },
     {
          text: 'Best fries in town, must try! 😋',
          stars: 5,
          author: 'Sara (Lahore)'
     },
     {
          text: 'Burger ki quality bohat achi hai, fresh aur juicy.',
          stars: 4,
          author: 'Usman (Islamabad)'
     },
     {
          text: 'Loved the 3D look and fast delivery!',
          stars: 5,
          author: 'Ayesha (Hyderabad)'
     },
     {
          text: 'Ice cream bohat creamy thi, bachon ko bohat pasand aayi.',
          stars: 5,
          author: 'Nida (Multan)'
     },
     {
          text: 'Great food, friendly staff, aur rates bhi reasonable hain.',
          stars: 4,
          author: 'Bilal (Faisalabad)'
     },
     {
          text: 'Amazing experience! Will order again.',
          stars: 5,
          author: 'Hina (Rawalpindi)'
     },
     {
          text: 'Order thora late aya tha, lekin taste lajawab tha.',
          stars: 3,
          author: 'Zeeshan (Sukkur)'
     },
     {
          text: 'Sandwich fresh tha aur packing bhi achi thi.',
          stars: 4,
          author: 'Farah (Peshawar)'
     },
     {
          text: 'Superb! Highly recommended for fast food lovers.',
          stars: 5,
          author: 'Imran (Quetta)'
     }
];

const reviewCarousel = document.getElementById('reviewCarousel');
let reviewIdx = 0;

function renderReview(idx) {
     if (!reviewCarousel) return;
     reviewCarousel.innerHTML = '';
     const review = reviews[idx];
     const card = document.createElement('div');
     card.className = 'review-card active';
     card.innerHTML = `
          <div class="review-stars">${'★'.repeat(review.stars)}${'☆'.repeat(5 - review.stars)}</div>
          <div class="review-text">${review.text}</div>
          <div class="review-author">- ${review.author}</div>
     `;
     reviewCarousel.appendChild(card);
}

function nextReview() {
     reviewIdx = (reviewIdx + 1) % reviews.length;
     renderReview(reviewIdx);
}

if (reviewCarousel) {
     renderReview(reviewIdx);
     setInterval(nextReview, 3000);
}
