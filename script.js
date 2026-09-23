// LUMINA — Luxury Skincare Interactive Script

const API_BASE_URL = 'http://localhost:5000/api';
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51UHTm0IJQfUN1Zhj2TnCCMvhbuQ0b8FF9UlzlvneeFUFOcY5VpI8FhTatvUuDdEtEpukQPQTd3lgpaMQTjpwwcbE002uWpreGI';
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
const stripeElements = stripe.elements();
const cardElement = stripeElements.create('card');

document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('productsGrid');
  let allProducts = [];

  async function loadProducts() {
    if (!productsGrid) return;
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const products = await response.json();
      allProducts = products;

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
      populateReviewProductDropdown();
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

  // --- 3. Real Cart System ---
  const cartCountEl = document.getElementById('cartCount');
  const toast = document.getElementById('toast');
  const cartModalOverlay = document.getElementById('cartModalOverlay');
  const cartBtn = document.getElementById('cartBtn');
  const cartModalClose = document.getElementById('cartModalClose');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const goToCheckoutBtn = document.getElementById('goToCheckoutBtn');

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function getCart() {
    return JSON.parse(localStorage.getItem('luminaCart') || '[]');
  }

  function saveCart(cart) {
    localStorage.setItem('luminaCart', JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountEl) cartCountEl.textContent = totalQty;
  }

  function addToCart(productId, name, price) {
    const cart = getCart();
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId, name, price, quantity: 1 });
    }
    saveCart(cart);
    showToast(`✨ ${name} added to your cart!`);
  }

  function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.productId !== productId);
    saveCart(cart);
    renderCartModal();
  }

  function changeQuantity(productId, delta) {
    const cart = getCart();
    const item = cart.find(i => i.productId === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    saveCart(cart);
    renderCartModal();
  }

  function renderCartModal() {
    const cart = getCart();
    if (cart.length === 0) {
      cartItemsList.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
      cartTotalPrice.textContent = '$0.0';
      return;
    }

    cartItemsList.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-qty-controls">
            <button type="button" class="cart-qty-btn" data-action="decrease" data-id="${item.productId}">-</button>
            <span>${item.quantity}</span>
            <button type="button" class="cart-qty-btn" data-action="increase" data-id="${item.productId}">+</button>
          </div>
        </div>
        <div style="text-align:right;">
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(1)}</div>
          <button type="button" class="cart-remove-btn" data-action="remove" data-id="${item.productId}">Remove</button>
        </div>
      </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalPrice.textContent = `$${total.toFixed(1)}`;

    cartItemsList.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (action === 'increase') changeQuantity(id, 1);
        if (action === 'decrease') changeQuantity(id, -1);
        if (action === 'remove') removeFromCart(id);
      });
    });
  }

  function attachProductCardListeners() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
      const arrowBtn = card.querySelector('.product-arrow-btn');
      const productId = card.dataset.id;
      const productName = card.dataset.product;
      const productPrice = parseFloat(card.dataset.price);

      const handleAdd = (e) => {
        if (e) e.stopPropagation();
        addToCart(productId, productName, productPrice);
      };

      if (arrowBtn) arrowBtn.addEventListener('click', handleAdd);
      card.addEventListener('click', handleAdd);
    });
  }

  updateCartCount();

  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderCartModal();
      cartModalOverlay.classList.add('show');
    });
  }

  if (cartModalClose) {
    cartModalClose.addEventListener('click', () => cartModalOverlay.classList.remove('show'));
  }

  // --- Checkout & Stripe ---
  const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
  const checkoutModalClose = document.getElementById('checkoutModalClose');
  const shippingForm = document.getElementById('shippingForm');
  const checkoutError = document.getElementById('checkoutError');
  const payButton = document.getElementById('payButton');

  cardElement.mount('#cardElement');

  if (goToCheckoutBtn) {
    goToCheckoutBtn.addEventListener('click', () => {
      const cart = getCart();
      if (cart.length === 0) {
        showToast('Your cart is empty.');
        return;
      }
      const token = localStorage.getItem('luminaToken');
      if (!token) {
        cartModalOverlay.classList.remove('show');
        authModalOverlay.classList.add('show');
        showToast('Please sign in to checkout.');
        return;
      }
      cartModalOverlay.classList.remove('show');
      checkoutModalOverlay.classList.add('show');
    });
  }

  if (checkoutModalClose) {
    checkoutModalClose.addEventListener('click', () => checkoutModalOverlay.classList.remove('show'));
  }

  if (shippingForm) {
    shippingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      checkoutError.textContent = '';
      payButton.disabled = true;
      payButton.textContent = 'Processing...';

      const token = localStorage.getItem('luminaToken');
      const cart = getCart();

      try {
        const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            items: cart.map(item => ({ product: item.productId, quantity: item.quantity })),
            shippingAddress: {
              fullName: document.getElementById('shipFullName').value,
              address: document.getElementById('shipAddress').value,
              city: document.getElementById('shipCity').value,
              phone: document.getElementById('shipPhone').value
            }
          })
        });
        const order = await orderResponse.json();
        if (!orderResponse.ok) throw new Error(order.error || 'Failed to create order');

        const intentResponse = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ orderId: order._id })
        });
        const intentData = await intentResponse.json();
        if (!intentResponse.ok) throw new Error(intentData.error || 'Failed to create payment');

        const result = await stripe.confirmCardPayment(intentData.clientSecret, {
          payment_method: { card: cardElement }
        });

        if (result.error) {
          checkoutError.textContent = result.error.message;
          payButton.disabled = false;
          payButton.textContent = 'Pay Now';
          return;
        }

        localStorage.removeItem('luminaCart');
        updateCartCount();
        checkoutModalOverlay.classList.remove('show');
        shippingForm.reset();
        showToast('🎉 Payment successful! Your order is on its way.');
      } catch (err) {
        checkoutError.textContent = err.message;
      } finally {
        payButton.disabled = false;
        payButton.textContent = 'Pay Now';
      }
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
  let currentReview = 0;

  function updateTestimonialActive(index) {
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });
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

  // --- Reviews ---
  const testimonialsGridEl = document.getElementById('testimonialsGrid');
  const reviewForm = document.getElementById('reviewForm');
  const reviewProductSelect = document.getElementById('reviewProduct');
  const reviewStars = document.getElementById('reviewStars');
  let selectedRating = 0;

  function populateReviewProductDropdown() {
    if (!reviewProductSelect) return;
    reviewProductSelect.innerHTML = '<option value="">Select a product...</option>' +
      allProducts.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
  }

  async function loadReviews() {
    if (!testimonialsGridEl) return;
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`);
      const reviews = await response.json();

      if (reviews.length === 0) {
        testimonialsGridEl.innerHTML = '<p class="empty-cart-msg">No reviews yet. Be the first!</p>';
        return;
      }

      testimonialsGridEl.innerHTML = reviews.slice(0, 6).map(review => `
        <div class="testimonial-card active">
          <div class="testimonial-body">
            <div class="star-rating">
              ${'<i class="fa-solid fa-star"></i>'.repeat(review.rating)}${'<i class="fa-regular fa-star"></i>'.repeat(5 - review.rating)}
            </div>
            <p class="testimonial-text">&ldquo;${review.comment}&rdquo;</p>
            <span class="testimonial-author">&mdash; ${review.user.name} on ${review.product.name}</span>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  }

  loadReviews();

  if (reviewStars) {
    reviewStars.querySelectorAll('i').forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.value, 10);
        reviewStars.querySelectorAll('i').forEach(s => {
          const val = parseInt(s.dataset.value, 10);
          s.className = val <= selectedRating ? 'fa-solid fa-star' : 'fa-regular fa-star';
        });
      });
    });
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('reviewError');
      errorEl.textContent = '';

      const token = localStorage.getItem('luminaToken');
      if (!token) {
        errorEl.textContent = 'Please sign in to leave a review.';
        return;
      }
      if (!selectedRating) {
        errorEl.textContent = 'Please select a star rating.';
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product: reviewProductSelect.value,
            rating: selectedRating,
            comment: document.getElementById('reviewComment').value
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to submit review');

        showToast('🌿 Thank you for your review!');
        reviewForm.reset();
        selectedRating = 0;
        reviewStars.querySelectorAll('i').forEach(s => s.className = 'fa-regular fa-star');
        loadReviews();
      } catch (err) {
        errorEl.textContent = err.message;
      }
    });
  }
});