function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const siblings = [
          ...entry.target.parentElement.querySelectorAll('.reveal'),
        ];

        const idx = siblings.indexOf(entry.target);

        entry.target.style.transitionDelay = idx * 85 + 'ms';
        entry.target.classList.add('visible');

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  els.forEach(el => observer.observe(el));
}

function initStickyHeader() {
  const header = document.getElementById('js-header');

  if (!header) return;

  const update = () => {
    header.classList.toggle('scrolled', window.scrollY > 16);
  };

  window.addEventListener('scroll', update, { passive: true });

  update();
}

function initMobileNav() {
  const hamburger = document.getElementById('js-hamburger');
  const mobileNav = document.getElementById('js-mobile-nav');
  const closeBtn = document.getElementById('js-mobile-nav-close');
  const mobileLinks = document.querySelectorAll('.js-mobile-link');

  if (!hamburger || !mobileNav) return;

  const open = () => {
    mobileNav.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', open);

  closeBtn?.addEventListener('click', close);

  mobileLinks.forEach(link => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      close();
    }
  });
}

function initPhoneMask() {
  const input = document.getElementById('inp-phone');

  if (!input) return;

  input.addEventListener('input', function () {
    let d = this.value.replace(/\D/g, '');

    if (d.startsWith('380')) d = d.slice(3);
    else if (d.startsWith('38')) d = d.slice(2);
    else if (d.startsWith('0')) d = d.slice(1);

    let out = '+38 (0';

    if (d.length > 0) out += d.substring(0, 2);
    if (d.length >= 2) out += ') ' + d.substring(2, 5);
    if (d.length >= 5) out += ' ' + d.substring(5, 7);
    if (d.length >= 7) out += ' ' + d.substring(7, 9);

    this.value = out;
  });
}

function initContactForm() {
  const form = document.getElementById('js-contact-form');
  const submitBtn = document.getElementById('js-submit-btn');
  const success = document.getElementById('js-form-success');

  if (!form) return;

  const MOCK_API_URL = 'https://6a1724cb1b90031f81b2170a.mockapi.io/orders';

  function ctrl(fieldId) {
    return (
      document.getElementById(fieldId) &&
      document.getElementById(fieldId).querySelector('.form-control')
    );
  }

  function setError(fieldId, show) {
    const field = document.getElementById(fieldId);

    const control = field && field.querySelector('.form-control');

    if (!field || !control) return;

    field.classList.toggle('has-error', show);

    control.classList.toggle('is-error', show);

    control.classList.toggle('is-valid', !show && control.value.trim() !== '');

    control.setAttribute('aria-invalid', String(show));
  }

  const validPhone = value => value.replace(/\D/g, '').length >= 10;

  const validEmail = value =>
    value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  ctrl('field-name')?.addEventListener('blur', function () {
    setError('field-name', this.value.trim().length < 2);
  });

  ctrl('field-phone')?.addEventListener('blur', function () {
    setError('field-phone', !validPhone(this.value));
  });

  ctrl('field-email')?.addEventListener('blur', function () {
    setError('field-email', !validEmail(this.value.trim()));
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nameVal =
      (ctrl('field-name') && ctrl('field-name').value.trim()) || '';

    const phoneVal =
      (ctrl('field-phone') && ctrl('field-phone').value.trim()) || '';

    const emailVal =
      (ctrl('field-email') && ctrl('field-email').value.trim()) || '';

    const messageVal =
      (ctrl('field-message') && ctrl('field-message').value.trim()) || '';

    let hasError = false;

    if (nameVal.length < 2) {
      setError('field-name', true);
      hasError = true;
    } else {
      setError('field-name', false);
    }

    if (!validPhone(phoneVal)) {
      setError('field-phone', true);
      hasError = true;
    } else {
      setError('field-phone', false);
    }

    if (!validEmail(emailVal)) {
      setError('field-email', true);
      hasError = true;
    } else {
      setError('field-email', false);
    }

    if (hasError) return;

    submitBtn.disabled = true;

    submitBtn.classList.add('is-loading');

    submitBtn.querySelector('.btn-text').textContent = 'Надсилаємо...';

    const formData = {
      name: nameVal,
      phone: phoneVal,
      email: emailVal,
      message: messageVal,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(MOCK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Помилка при відправці форми');
      }

      await response.json();

// Надсилаємо подію Lead у Meta Pixel після успішної заявки
      if (typeof fbq === 'function') {
        fbq('track', 'Lead');
      }
      
      form.style.display = 'none';
      
      success.classList.add('is-visible');
      
      success.setAttribute('aria-hidden', 'false');

      setTimeout(() => {
        form.reset();

        form.style.display = '';

        success.classList.remove('is-visible');

        success.setAttribute('aria-hidden', 'true');

        submitBtn.disabled = false;

        submitBtn.classList.remove('is-loading');

        submitBtn.querySelector('.btn-text').textContent = 'Надіслати заявку';

        form.querySelectorAll('.form-control').forEach(control => {
          control.classList.remove('is-valid', 'is-error');
        });
      }, 5000);
    } catch (error) {
      console.error(error);

      alert('Сталася помилка. Спробуйте ще раз.');

      submitBtn.disabled = false;

      submitBtn.classList.remove('is-loading');

      submitBtn.querySelector('.btn-text').textContent = 'Надіслати заявку';
    }
  });
}

function initReviewsDots() {
  document.querySelectorAll('.reviews__dot').forEach(dot => {
    dot.addEventListener('click', function () {
      document.querySelectorAll('.reviews__dot').forEach(d => {
        d.classList.remove('is-active');

        d.setAttribute('aria-selected', 'false');
      });

      this.classList.add('is-active');

      this.setAttribute('aria-selected', 'true');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initStickyHeader();
  initMobileNav();
  initPhoneMask();
  initContactForm();
  initReviewsDots();
});
