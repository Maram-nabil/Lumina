// LUMINA — Luxury Skincare Interactive Script

document.addEventListener('DOMContentLoaded', () => {
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

    // Close menu when clicking link
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
  const productCards = document.querySelectorAll('.product-card');

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  productCards.forEach(card => {
    const arrowBtn = card.querySelector('.product-arrow-btn');
    const productName = card.dataset.product || 'Product';
    
    // Clicking arrow button adds item to cart
    if (arrowBtn) {
      arrowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cartCount++;
        if (cartCountEl) cartCountEl.textContent = cartCount;
        showToast(`✨ ${productName} added to your cart!`);
      });
    }

    // Clicking the card itself
    card.addEventListener('click', () => {
      cartCount++;
      if (cartCountEl) cartCountEl.textContent = cartCount;
      showToast(`✨ ${productName} added to your cart!`);
    });
  });

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

    // On smaller screens, emphasize the selected card
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

  // Resize listener for responsive testimonial layout
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
