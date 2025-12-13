// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadStoreInfo();
  await loadMainImages();
  await loadCommitmentItems();
  await loadGreeting();
  await loadMenuImages();
  await loadBanquetCourses();
  await loadNews();
  await loadGallery();
  await loadFAQ();
  
  initializeMobileMenu();
  initializeSmoothScroll();
  initializeNavbarScroll();
});

// Load store info
async function loadStoreInfo() {
  try {
    const response = await axios.get('/api/store-info');
    const store = response.data;
    
    // Navigation and footer
    const storeName = store.shoulder_name 
      ? `${store.shoulder_name} ${store.store_name}` 
      : store.store_name;
    
    document.getElementById('nav-store-name').textContent = storeName;
    document.getElementById('footer-store-name').textContent = storeName;
    document.getElementById('footer-copyright-name').textContent = store.store_name;
    document.getElementById('footer-year').textContent = new Date().getFullYear();
    
    if (store.address) {
      document.getElementById('footer-address').textContent = store.address;
    }
    
    if (store.phone) {
      document.getElementById('footer-phone').innerHTML = `
        <i class="fas fa-phone mr-2"></i>${store.phone}
      `;
    }
    
    // Reservation buttons
    if (store.reservation_type !== 'none' && store.reservation_value) {
      const buttons = [
        document.getElementById('reservation-btn-nav'),
        document.getElementById('reservation-btn-mobile'),
        document.getElementById('reservation-btn-footer')
      ];
      
      buttons.forEach(btn => {
        btn.classList.remove('hidden');
        
        if (store.reservation_type === 'url') {
          btn.textContent = 'ご予約';
          btn.onclick = () => window.open(store.reservation_value, '_blank');
        } else if (store.reservation_type === 'phone') {
          btn.textContent = store.reservation_value;
          btn.onclick = () => window.location.href = `tel:${store.reservation_value}`;
        }
      });
    }
    
    // Store info section
    document.getElementById('store-info-content').innerHTML = `
      <div class="space-y-4">
        ${store.shoulder_name ? `<p class="text-sm text-gray-600">${store.shoulder_name}</p>` : ''}
        <h3 class="text-2xl font-bold">${store.store_name}</h3>
        ${store.phone ? `<p class="flex items-center"><i class="fas fa-phone mr-2"></i>${store.phone}</p>` : ''}
        ${store.address ? `<p class="flex items-start"><i class="fas fa-map-marker-alt mr-2 mt-1"></i>${store.address}</p>` : ''}
        ${store.nearest_station ? `<p class="flex items-start"><i class="fas fa-train mr-2 mt-1"></i>${store.nearest_station}</p>` : ''}
        ${store.parking_info ? `<p class="flex items-start"><i class="fas fa-parking mr-2 mt-1"></i>${store.parking_info}</p>` : ''}
        ${store.payment_methods ? `<p class="flex items-start"><i class="fas fa-credit-card mr-2 mt-1"></i>${store.payment_methods}</p>` : ''}
        ${store.other_info ? `<p class="text-gray-600 mt-4">${store.other_info}</p>` : ''}
      </div>
    `;
    
    // Google Maps
    if (store.google_maps_url) {
      document.getElementById('map-content').innerHTML = `
        <iframe 
          src="${store.google_maps_url}" 
          width="100%" 
          height="400" 
          style="border:0;" 
          allowfullscreen="" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade"
          class="rounded-lg shadow">
        </iframe>
      `;
    }
    
    // Contact form
    if (store.show_contact_form && store.contact_form_url) {
      document.getElementById('contact').classList.remove('hidden');
      document.getElementById('contact-content').innerHTML = `
        <iframe 
          src="${store.contact_form_url}" 
          width="100%" 
          height="600" 
          frameborder="0" 
          marginheight="0" 
          marginwidth="0"
          class="rounded-lg shadow">
          読み込んでいます…
        </iframe>
      `;
    }
    
  } catch (error) {
    console.error('Error loading store info:', error);
  }
}

// Load main images
async function loadMainImages() {
  try {
    const response = await axios.get('/api/main-images');
    const images = response.data;
    
    const slidesContainer = document.getElementById('hero-slides');
    
    images.forEach(item => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      
      if (item.media_type === 'video') {
        slide.innerHTML = `
          <video autoplay muted loop playsinline class="w-full h-full object-cover">
            <source src="${item.media_url}" type="video/mp4">
          </video>
        `;
      } else {
        slide.innerHTML = `
          <img src="${item.media_url}" alt="メインイメージ" class="w-full h-full object-cover">
        `;
      }
      
      slidesContainer.appendChild(slide);
    });
    
    // Initialize Swiper
    new Swiper('.hero-swiper', {
      loop: images.length > 1,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
    
  } catch (error) {
    console.error('Error loading main images:', error);
  }
}

// Load commitment items
async function loadCommitmentItems() {
  try {
    const response = await axios.get('/api/commitment-items');
    const items = response.data;
    
    const container = document.getElementById('commitment-grid');
    
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'bg-gray-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition';
      card.innerHTML = `
        ${item.image_url ? `
          <img src="${item.image_url}" alt="${item.title}" class="w-full h-48 object-cover">
        ` : ''}
        <div class="p-6">
          <h3 class="text-xl font-bold text-primary mb-3">${item.title}</h3>
          ${item.description ? `<p class="text-gray-600">${item.description}</p>` : ''}
        </div>
      `;
      container.appendChild(card);
    });
    
  } catch (error) {
    console.error('Error loading commitment items:', error);
  }
}

// Load greeting
async function loadGreeting() {
  try {
    const response = await axios.get('/api/greeting');
    const greeting = response.data;
    
    if (!greeting || !greeting.title) return;
    
    const container = document.getElementById('greeting-content');
    container.innerHTML = `
      <div class="text-center">
        ${greeting.image_url ? `
          <img src="${greeting.image_url}" alt="${greeting.title}" class="w-48 h-48 rounded-full mx-auto mb-6 object-cover shadow-lg">
        ` : ''}
        <h2 class="text-3xl font-bold text-primary mb-6">${greeting.title}</h2>
        <p class="text-gray-700 whitespace-pre-wrap text-left leading-relaxed">${greeting.message}</p>
      </div>
    `;
    
  } catch (error) {
    console.error('Error loading greeting:', error);
  }
}

// Load menu images
async function loadMenuImages() {
  try {
    const response = await axios.get('/api/menu-images');
    const images = response.data;
    
    if (images.length === 0) return;
    
    const slidesContainer = document.getElementById('menu-slides');
    
    images.forEach(item => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide cursor-pointer';
      slide.innerHTML = `
        <img src="${item.image_url}" alt="メニュー" class="w-full h-auto object-contain rounded-lg shadow-lg">
      `;
      slide.onclick = () => openModal(item.image_url);
      slidesContainer.appendChild(slide);
    });
    
    // Initialize Swiper
    new Swiper('.menu-swiper', {
      loop: images.length > 1,
      slidesPerView: 1,
      spaceBetween: 20,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
    
  } catch (error) {
    console.error('Error loading menu images:', error);
  }
}

// Load banquet courses
async function loadBanquetCourses() {
  try {
    const response = await axios.get('/api/banquet-courses');
    const courses = response.data;
    
    if (courses.length === 0) return;
    
    document.getElementById('banquet').classList.remove('hidden');
    
    const container = document.getElementById('banquet-grid');
    
    courses.forEach(course => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition';
      card.innerHTML = `
        ${course.image_url ? `
          <img src="${course.image_url}" alt="${course.course_name}" class="w-full h-48 object-cover">
        ` : ''}
        <div class="p-6">
          <h3 class="text-xl font-bold text-primary mb-3">${course.course_name}</h3>
          ${course.course_description ? `<p class="text-gray-600">${course.course_description}</p>` : ''}
        </div>
      `;
      container.appendChild(card);
    });
    
  } catch (error) {
    console.error('Error loading banquet courses:', error);
  }
}

// Load news
async function loadNews() {
  try {
    const response = await axios.get('/api/news?limit=5');
    const news = response.data;
    
    const container = document.getElementById('news-list');
    
    news.forEach(item => {
      const article = document.createElement('div');
      article.className = 'bg-white p-6 rounded-lg shadow hover:shadow-lg transition';
      article.innerHTML = `
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-xl font-bold text-primary">${item.title}</h3>
          <span class="text-sm text-gray-500 whitespace-nowrap ml-4">${formatDate(item.published_date)}</span>
        </div>
        ${item.content ? `<p class="text-gray-600">${item.content}</p>` : ''}
      `;
      container.appendChild(article);
    });
    
  } catch (error) {
    console.error('Error loading news:', error);
  }
}

// Load gallery
async function loadGallery() {
  try {
    const response = await axios.get('/api/gallery');
    const gallery = response.data;
    
    const container = document.getElementById('gallery-grid');
    
    gallery.forEach(item => {
      const card = document.createElement('div');
      card.className = 'relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer group';
      card.innerHTML = `
        <img src="${item.image_url}" alt="${item.title || ''}" class="w-full h-48 object-cover group-hover:scale-110 transition duration-300">
        ${item.title || item.description ? `
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            ${item.title ? `<h4 class="text-white font-bold">${item.title}</h4>` : ''}
            ${item.description ? `<p class="text-white text-sm">${item.description}</p>` : ''}
          </div>
        ` : ''}
      `;
      card.onclick = () => openModal(item.image_url);
      container.appendChild(card);
    });
    
  } catch (error) {
    console.error('Error loading gallery:', error);
  }
}

// Load FAQ
async function loadFAQ() {
  try {
    const response = await axios.get('/api/faq');
    const faq = response.data;
    
    const container = document.getElementById('faq-list');
    
    faq.forEach((item, index) => {
      const faqItem = document.createElement('div');
      faqItem.className = 'bg-white rounded-lg shadow overflow-hidden';
      faqItem.innerHTML = `
        <button class="w-full text-left p-6 hover:bg-gray-50 transition flex justify-between items-center" onclick="toggleFAQ(${index})">
          <div class="flex-1">
            <h3 class="font-bold text-lg text-primary mb-2">Q. ${item.question}</h3>
            <div id="faq-answer-${index}" class="hidden text-gray-600 mt-3 pl-4 border-l-4 border-primary">
              A. ${item.answer}
            </div>
          </div>
          <i id="faq-icon-${index}" class="fas fa-chevron-down text-primary transition-transform ml-4"></i>
        </button>
      `;
      container.appendChild(faqItem);
    });
    
  } catch (error) {
    console.error('Error loading FAQ:', error);
  }
}

// Toggle FAQ answer
function toggleFAQ(index) {
  const answer = document.getElementById(`faq-answer-${index}`);
  const icon = document.getElementById(`faq-icon-${index}`);
  
  if (answer.classList.contains('hidden')) {
    answer.classList.remove('hidden');
    icon.style.transform = 'rotate(180deg)';
  } else {
    answer.classList.add('hidden');
    icon.style.transform = 'rotate(0deg)';
  }
}

// Open image modal
function openModal(imageUrl) {
  const modal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  modalImage.src = imageUrl;
  modal.classList.remove('hidden');
}

// Close image modal
function closeModal() {
  const modal = document.getElementById('image-modal');
  modal.classList.add('hidden');
}

// Initialize mobile menu
function initializeMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
  
  // Close menu when clicking a link
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
}

// Initialize smooth scroll
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80; // Navbar height
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Initialize navbar scroll effect
function initializeNavbarScroll() {
  const navbar = document.getElementById('navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar.classList.add('shadow-lg');
    } else {
      navbar.classList.remove('shadow-lg');
    }
  });
}

// Format date helper
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}
