// LUMINA — Luxury Skincare Interactive Script

const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {

  // --- 0. Fetch & Render Products from Backend ---
  const productsGrid = document.getElementById('productsGrid');

  async function loadProducts() {
    if (!productsGrid) return;
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const products = await response.json();

      productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-product="${product.name}" data-price="${product.price}" data-id="${product._id}">
          <div class="card-img-box">
            <img src="${product.image || 'moist.png'}" alt="${product.name}" loading="lazy" />
          </div>
          <div class="card-details">
            <h3 class="product-name">${product.name}</h3>
            <span class="product-price">$${product.price.toFixed(1)}</span>
          </div>
          <button class="product-arrow-btn" aria-label="Add ${product.name} to cart" title="Add to cart">
            &rarr;
          </button>
        </div>
      `).join('');

      attachProductCardListeners();
    } catch (err) {
      console.error('Failed to load products:', err);
      productsGrid.innerHTML = '<p>Unable to load products right now.</p>';
    }
  }

  loadProducts();

  // --- 1. Navbar Glassmorphism on Scroll ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- 2. Mobile Menu Toggle ---
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // --- 3. Shopping Cart Interactions ---
  let cartCount = 0;
  const cartCountEl = document.getElementById('cartCount');
  const toast = document.getElementById('toast');

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function attachProductCardListeners() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
      const arrowBtn = card.querySelector('.product-arrow-btn');
      const productName = card.dataset.product || 'Product';

      if (arrowBtn) {
        arrowBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          cartCount++;
          if (cartCountEl) cartCountEl.textContent = cartCount;
          showToast(`✨ ${productName} added to your cart!`);
        });
      }

      card.addEventListener('click', () => {
        cartCount++;
        if (cartCountEl) cartCountEl.textContent = cartCount;
        showToast(`✨ ${productName} added to your cart!`);
      });
    });
  }
    // --- Routine Finder ---
  const skinTypeOptions = document.getElementById('skinTypeOptions');
  const concernsOptions = document.getElementById('concernsOptions');
  const routineForm = document.getElementById('routineForm');
  const routineResult = document.getElementById('routineResult');

  let selectedSkinType = null;
  let selectedConcerns = [];

  if (skinTypeOptions) {
    skinTypeOptions.querySelectorAll('.routine-option').forEach(btn => {
      btn.addEventListener('click', () => {
        skinTypeOptions.querySelectorAll('.routine-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedSkinType = btn.dataset.value;
      });
    });
  }

  if (concernsOptions) {
    concernsOptions.querySelectorAll('.routine-option').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        const value = btn.dataset.value;
        if (selectedConcerns.includes(value)) {
          selectedConcerns = selectedConcerns.filter(c => c !== value);
        } else {
          selectedConcerns.push(value);
        }
      });
    });
  }

  if (routineForm) {
    routineForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!selectedSkinType) {
        alert('Please select your skin type first.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/routine-finder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skinType: selectedSkinType, concerns: selectedConcerns })
        });
        const data = await response.json();

        if (!response.ok) {
          routineResult.innerHTML = `<p>${data.message || 'No routine found for this combination.'}</p>`;
        } else {
          routineResult.innerHTML = data.routine.map(product => `
            <div class="routine-result-item">
              <span class="routine-result-step">${product.category}</span>
              <span class="routine-result-name">${product.name}</span>
              <span class="routine-result-price">$${product.price.toFixed(1)}</span>
            </div>
          `).join('');
        }
        routineResult.classList.add('show');
      } catch (err) {
        console.error('Routine finder error:', err);
        routineResult.innerHTML = '<p>Something went wrong. Please try again.</p>';
        routineResult.classList.add('show');
      }
    });
  }

  // --- Auth Modal ---
  const authModalOverlay = document.getElementById('authModalOverlay');
  const accountBtn = document.getElementById('accountBtn');
  const accountLabel = document.getElementById('accountLabel');
  const authModalClose = document.getElementById('authModalClose');
  const authTabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  function updateAccountLabel() {
    const user = JSON.parse(localStorage.getItem('luminaUser') || 'null');
    if (accountLabel) {
      accountLabel.textContent = user ? user.name : 'Account';
    }
  }
  updateAccountLabel();

  if (accountBtn) {
    accountBtn.addEventListener('click', (e) => {
      e.preventDefault();
      authModalOverlay.classList.add('show');
    });
  }

  if (authModalClose) {
    authModalClose.addEventListener('click', () => {
      authModalOverlay.classList.remove('show');
    });
  }

  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      document.getElementById(tab.dataset.tab === 'login' ? 'loginForm' : 'registerForm').classList.add('active');
    });
  });

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const errorEl = document.getElementById('loginError');
      errorEl.textContent = '';

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (!response.ok) {
          errorEl.textContent = data.error || 'Login failed.';
          return;
        }

        localStorage.setItem('luminaToken', data.token);
        localStorage.setItem('luminaUser', JSON.stringify(data.user));
        updateAccountLabel();
        authModalOverlay.classList.remove('show');
        showToast(`Welcome back, ${data.user.name}!`);
      } catch (err) {
        errorEl.textContent = 'Something went wrong. Please try again.';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const errorEl = document.getElementById('registerError');
      errorEl.textContent = '';

      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();

        if (!response.ok) {
          errorEl.textContent = data.error || 'Registration failed.';
          return;
        }

        showToast('Account created! Please sign in.');
        document.querySelector('.auth-tab[data-tab="login"]').click();
        registerForm.reset();
      } catch (err) {
        errorEl.textContent = 'Something went wrong. Please try again.';
      }
    });
  }

  // --- 4. Testimonials Slider Controls ---
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevReview');
  const nextBtn = document.getElementById('nextReview');
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  let currentReview = 0;

  function updateTestimonialActive(index) {
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });

    if (window.innerWidth <= 768) {
      testimonialCards.forEach((card, idx) => {
        if (idx === index) {
          card.style.display = 'flex';
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          card.style.display = 'none';
        }
      });
    } else {
      testimonialCards.forEach(card => {
        card.style.display = 'flex';
      });
    }
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      currentReview = parseInt(dot.dataset.index, 10);
      updateTestimonialActive(currentReview);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentReview = (currentReview - 1 + dots.length) % dots.length;
      updateTestimonialActive(currentReview);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentReview = (currentReview + 1) % dots.length;
      updateTestimonialActive(currentReview);
    });
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      testimonialCards.forEach(card => card.style.display = 'flex');
    } else {
      updateTestimonialActive(currentReview);
    }
  });

  // --- 5. Newsletter Submission ---
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      if (input && input.value) {
        showToast('🌿 Thank you for subscribing to Lumina!');
        input.value = '';
      }
    });
  }
});