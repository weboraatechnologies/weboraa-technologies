/**
 * WEBORAA TECHNOLOGIES — Core Application Script
 * Clean, lightweight, professional interactions for navigation, modals, portfolio case studies, and conversion forms.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // Enforce Clean Theme
  // --------------------------------------------------------------------------
  try {
    localStorage.removeItem('weboraa-theme');
  } catch (e) { }
  document.documentElement.setAttribute('data-theme', 'light');

  // --------------------------------------------------------------------------
  // 1. Sticky Navigation & Scroll Spy
  // --------------------------------------------------------------------------
  const header = document.getElementById('siteHeader');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  function handleScroll() {
    const scrollY = window.scrollY;

    if (header) {
      if (scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    let currentSectionId = '';
    const headerOffset = 100;

    sections.forEach(section => {
      const top = section.offsetTop - headerOffset;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      mobileToggle.classList.toggle('is-active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        mobileToggle.classList.remove('is-active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        navMenu.classList.remove('is-open');
        mobileToggle.classList.remove('is-active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // --------------------------------------------------------------------------
  // 2. Smooth Anchor Link Scrolling (with Sticky Header Offset)
  // --------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#!') || this.hasAttribute('data-open-modal') || this.hasAttribute('data-open-case-study')) {
        return;
      }

      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // 3. Quick Copy Email Address
  // --------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = 'weboraatechnologies@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          setCopiedState();
        }).catch(() => {
          fallbackCopyText(email);
        });
      } else {
        fallbackCopyText(email);
      }
    });

    function setCopiedState() {
      const copyTextEl = copyEmailBtn.querySelector('.copy-text');
      copyEmailBtn.classList.add('is-copied');
      if (copyTextEl) copyTextEl.textContent = 'Copied!';
      setTimeout(() => {
        copyEmailBtn.classList.remove('is-copied');
        if (copyTextEl) copyTextEl.textContent = 'Copy';
      }, 2000);
    }

    function fallbackCopyText(text) {
      const tempInput = document.createElement('input');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopiedState();
    }
  }

  // --------------------------------------------------------------------------
  // 4. Interactive Project Inquiry Modal
  // --------------------------------------------------------------------------
  let lastActiveTrigger = null;
  let isSubmittingInquiry = false;

  const conversationModal = document.getElementById('conversationModal');
  const closeConversationModalBtn = document.getElementById('closeConversationModal');
  const modalInquiryForm = document.getElementById('modalInquiryForm');
  const modalSuccessAlert = document.getElementById('modalSuccessAlert');
  const modalErrorAlert = document.getElementById('modalErrorAlert');
  const modalServiceSelect = document.getElementById('modalService');
  const modalMessage = document.getElementById('modalMessage');
  const modalName = document.getElementById('modalName');
  const modalEmail = document.getElementById('modalEmail');
  const modalPhone = document.getElementById('modalPhone');
  const modalBudget = document.getElementById('modalBudget');
  const modalTimeline = document.getElementById('modalTimeline');
  const modalSubmitBtn = document.getElementById('modalSubmitBtn');

  // Error Message Elements
  const errName = document.getElementById('errModalName');
  const errEmail = document.getElementById('errModalEmail');
  const errService = document.getElementById('errModalService');
  const errMessage = document.getElementById('errModalMessage');

  function clearFieldError(inputEl, errorEl) {
    if (inputEl) inputEl.classList.remove('is-invalid');
    if (errorEl) errorEl.classList.remove('is-visible');
  }

  function setFieldError(inputEl, errorEl, message) {
    if (inputEl) inputEl.classList.add('is-invalid');
    if (errorEl) {
      if (message) errorEl.textContent = message;
      errorEl.classList.add('is-visible');
    }
  }

  function clearValidationErrors() {
    clearFieldError(modalName, errName);
    clearFieldError(modalEmail, errEmail);
    clearFieldError(modalServiceSelect, errService);
    clearFieldError(modalMessage, errMessage);
  }

  function hideAlerts() {
    if (modalSuccessAlert) modalSuccessAlert.classList.remove('is-visible');
    if (modalErrorAlert) modalErrorAlert.classList.remove('is-visible');
  }

  function setSelectByValue(selectEl, value) {
    if (!selectEl) return;
    for (let i = 0; i < selectEl.options.length; i++) {
      if (selectEl.options[i].value === value) {
        selectEl.selectedIndex = i;
        break;
      }
    }
  }

  function openConversationModal(serviceName, triggerEl) {
    if (!conversationModal) return;

    // Close mobile nav drawer if open
    if (navMenu && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      if (mobileToggle) {
        mobileToggle.classList.remove('is-active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    }

    // Track active trigger for accessible focus return
    if (triggerEl) {
      lastActiveTrigger = triggerEl;
    } else if (document.activeElement) {
      lastActiveTrigger = document.activeElement;
    }

    clearValidationErrors();
    hideAlerts();

    // Smart service selection based on clicked trigger
    if (modalServiceSelect && serviceName) {
      const normalized = serviceName.trim().toLowerCase();
      let matched = false;

      for (let i = 0; i < modalServiceSelect.options.length; i++) {
        const optText = modalServiceSelect.options[i].text.toLowerCase();
        const optVal = modalServiceSelect.options[i].value.toLowerCase();
        if (optVal && (normalized.includes(optText) || optText.includes(normalized))) {
          modalServiceSelect.selectedIndex = i;
          matched = true;
          break;
        }
      }

      if (!matched) {
        if (normalized.includes('web') || normalized.includes('e-commerce') || normalized.includes('store')) {
          setSelectByValue(modalServiceSelect, 'Website Development');
        } else if (normalized.includes('software') || normalized.includes('erp') || normalized.includes('automation')) {
          setSelectByValue(modalServiceSelect, 'Business Software / ERP');
        } else if (normalized.includes('ui') || normalized.includes('ux') || normalized.includes('design')) {
          setSelectByValue(modalServiceSelect, 'UI/UX Design');
        } else if (normalized.includes('label') || normalized.includes('pack') || normalized.includes('poster')) {
          setSelectByValue(modalServiceSelect, 'Label & Poster Design');
        } else if (normalized.includes('market') || normalized.includes('seo')) {
          setSelectByValue(modalServiceSelect, 'Digital Marketing');
        } else if (normalized.includes('consult')) {
          setSelectByValue(modalServiceSelect, 'Technology Consulting');
        }
      }
    }

    // Contextual message suggestion for specific services
    if (modalMessage && serviceName && !modalMessage.value.trim()) {
      if (serviceName !== 'Project Inquiry' && serviceName !== 'Project Inception' && serviceName !== 'Partnership Discussion') {
        modalMessage.value = `Hi Weboraa team, I would like to discuss our requirements for ${serviceName}.`;
      }
    }

    // Open modal dialog
    conversationModal.classList.add('is-open');
    conversationModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus on first input
    setTimeout(() => {
      if (modalName) {
        try {
          modalName.focus({ preventScroll: true });
        } catch (e) {
          modalName.focus();
        }
      }
    }, 50);
  }

  function closeConversationModal() {
    if (!conversationModal) return;
    conversationModal.classList.remove('is-open');
    conversationModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Restore focus to opening button
    if (lastActiveTrigger && typeof lastActiveTrigger.focus === 'function') {
      try {
        lastActiveTrigger.focus({ preventScroll: true });
      } catch (e) {
        lastActiveTrigger.focus();
      }
    }
  }

  if (closeConversationModalBtn) {
    closeConversationModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeConversationModal();
    });
  }

  if (conversationModal) {
    // Backdrop click closes modal
    conversationModal.addEventListener('click', (e) => {
      if (e.target === conversationModal) {
        e.preventDefault();
        closeConversationModal();
      }
    });

    // Clicks inside modal box do NOT close modal
    const modalBox = conversationModal.querySelector('.modal-box');
    if (modalBox) {
      modalBox.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Escape key closes modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && conversationModal.classList.contains('is-open')) {
        closeConversationModal();
      }
    });
  }

  // Bind all project inquiry CTAs across navbar, hero, services, about, and contact sections
  document.querySelectorAll('[data-open-modal="conversation"]').forEach(trigger => {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      const service = this.getAttribute('data-service') || '';
      openConversationModal(service, this);
    });
  });

  // Real-time error clearance on user interaction
  if (modalName) {
    modalName.addEventListener('input', () => {
      if (modalName.value.trim()) clearFieldError(modalName, errName);
    });
  }
  if (modalEmail) {
    modalEmail.addEventListener('input', () => {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(modalEmail.value.trim())) {
        clearFieldError(modalEmail, errEmail);
      }
    });
  }
  if (modalServiceSelect) {
    modalServiceSelect.addEventListener('change', () => {
      if (modalServiceSelect.value) clearFieldError(modalServiceSelect, errService);
    });
  }
  if (modalMessage) {
    modalMessage.addEventListener('input', () => {
      if (modalMessage.value.trim()) clearFieldError(modalMessage, errMessage);
    });
  }

  // Modal Form Submission Handler
  if (modalInquiryForm) {
    modalInquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (isSubmittingInquiry) return;

      clearValidationErrors();
      hideAlerts();

      // Check honeypot anti-spam
      const honey1 = modalInquiryForm.querySelector('input[name="_honey"]');
      const honey2 = document.getElementById('modalWebsiteHoneypot');
      if ((honey1 && honey1.value.trim() !== '') || (honey2 && honey2.value.trim() !== '')) {
        modalInquiryForm.reset();
        closeConversationModal();
        return;
      }

      // Validate required fields
      let hasError = false;
      let firstInvalidEl = null;

      const nameVal = modalName ? modalName.value.trim() : '';
      const emailVal = modalEmail ? modalEmail.value.trim() : '';
      const serviceVal = modalServiceSelect ? modalServiceSelect.value : '';
      const messageVal = modalMessage ? modalMessage.value.trim() : '';

      if (!nameVal) {
        setFieldError(modalName, errName, 'Please enter your full name.');
        hasError = true;
        if (!firstInvalidEl) firstInvalidEl = modalName;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailVal) {
        setFieldError(modalEmail, errEmail, 'Please enter your email address.');
        hasError = true;
        if (!firstInvalidEl) firstInvalidEl = modalEmail;
      } else if (!emailRegex.test(emailVal)) {
        setFieldError(modalEmail, errEmail, 'Please enter a valid email address (e.g. name@domain.com).');
        hasError = true;
        if (!firstInvalidEl) firstInvalidEl = modalEmail;
      }

      if (!serviceVal) {
        setFieldError(modalServiceSelect, errService, 'Please select the service required.');
        hasError = true;
        if (!firstInvalidEl) firstInvalidEl = modalServiceSelect;
      }

      if (!messageVal) {
        setFieldError(modalMessage, errMessage, 'Please tell us about your project requirements.');
        hasError = true;
        if (!firstInvalidEl) firstInvalidEl = modalMessage;
      }

      if (hasError) {
        if (firstInvalidEl) {
          try {
            firstInvalidEl.focus({ preventScroll: true });
          } catch (err) {
            firstInvalidEl.focus();
          }
        }
        return;
      }

      // Enter submission state
      isSubmittingInquiry = true;
      const submitBtn = modalSubmitBtn || modalInquiryForm.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '<span>Submit Inquiry</span>';

      if (submitBtn) {
        submitBtn.innerHTML = '<span>Sending inquiry...</span>';
        submitBtn.disabled = true;
      }

      let isSuccess = false;

      try {
        const formData = new FormData(modalInquiryForm);
        formData.set('name', nameVal);
        formData.set('email', emailVal);
        formData.set('service', serviceVal);
        formData.set('message', messageVal);

        const endpoint = modalInquiryForm.getAttribute('action') || 'https://formsubmit.co/ajax/weboraatechnologies@gmail.com';
        const ajaxEndpoint = endpoint.includes('/ajax/') ? endpoint : endpoint.replace('formsubmit.co/', 'formsubmit.co/ajax/');

        const response = await fetch(ajaxEndpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        });

        if (response.ok) {
          isSuccess = true;
        } else {
          console.error('Modal inquiry submission returned HTTP status:', response.status);
        }
      } catch (err) {
        console.warn('Modal inquiry network exception:', err);
      } finally {
        isSubmittingInquiry = false;
        if (submitBtn) {
          submitBtn.innerHTML = originalBtnHTML;
          submitBtn.disabled = false;
        }

        if (isSuccess) {
          // Success State: Clear form & show success confirmation
          modalInquiryForm.reset();
          if (modalSuccessAlert) {
            modalSuccessAlert.classList.add('is-visible');
            modalSuccessAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          if (modalErrorAlert) {
            modalErrorAlert.classList.remove('is-visible');
          }
        } else {
          // Error State: Retain all entered data, display error with direct contacts
          if (modalErrorAlert) {
            modalErrorAlert.classList.add('is-visible');
            modalErrorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          if (modalSuccessAlert) {
            modalSuccessAlert.classList.remove('is-visible');
          }
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. Portfolio Case Study Modal
  // --------------------------------------------------------------------------
  const caseStudyModal = document.getElementById('caseStudyModal');
  const closeCaseStudyModalBtn = document.getElementById('closeCaseStudyModal');
  const csTitle = document.getElementById('csModalTitle');
  const csCategory = document.getElementById('csModalCategory');
  const csOverview = document.getElementById('csModalOverview');
  const csChallenge = document.getElementById('csModalChallenge');
  const csSolution = document.getElementById('csModalSolution');
  const csTechStack = document.getElementById('csModalTechStack');
  const csHighlights = document.getElementById('csModalHighlights');
  const csDiscussBtn = document.getElementById('csModalDiscussBtn');

  function openCaseStudyModal(projectId) {
    if (!caseStudyModal) return;

    const data = (typeof PROJECTS_DATA !== 'undefined' && PROJECTS_DATA[projectId]) ? PROJECTS_DATA[projectId] : null;
    if (!data) return;

    if (csTitle) csTitle.textContent = data.title;
    if (csCategory) csCategory.textContent = data.category;
    if (csOverview) csOverview.textContent = data.overview;
    if (csChallenge) csChallenge.textContent = data.challenge;
    if (csSolution) csSolution.textContent = data.solution;

    if (csTechStack && data.techStack) {
      csTechStack.innerHTML = data.techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
    }

    if (csHighlights && data.highlights) {
      csHighlights.innerHTML = data.highlights.map(hl => `<li><span class="hl-check">✓</span><span>${hl}</span></li>`).join('');
    }

    if (csDiscussBtn) {
      csDiscussBtn.setAttribute('data-service', data.title);
    }

    caseStudyModal.classList.add('is-open');
    caseStudyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCaseStudyModal() {
    if (!caseStudyModal) return;
    caseStudyModal.classList.remove('is-open');
    caseStudyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeCaseStudyModalBtn) {
    closeCaseStudyModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeCaseStudyModal();
    });
  }

  if (caseStudyModal) {
    caseStudyModal.addEventListener('click', (e) => {
      if (e.target === caseStudyModal) {
        e.preventDefault();
        closeCaseStudyModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && caseStudyModal.classList.contains('is-open')) {
        closeCaseStudyModal();
      }
    });
  }

  // Trigger buttons for case studies
  document.querySelectorAll('[data-open-case-study]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const projectId = this.getAttribute('data-project');
      openCaseStudyModal(projectId);
    });
  });

  // Switch from Case Study Modal to Conversation Quote Modal
  if (csDiscussBtn) {
    csDiscussBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const service = this.getAttribute('data-service') || 'Custom Project';
      closeCaseStudyModal();
      setTimeout(() => {
        openConversationModal(service);
      }, 180);
    });
  }

  // --------------------------------------------------------------------------
  // 6. Services Clean Expandable Accordion
  // --------------------------------------------------------------------------
  const accordionItems = document.querySelectorAll('.service-accordion-item');
  if (accordionItems.length > 0) {
    accordionItems.forEach(item => {
      const headerBtn = item.querySelector('.service-accordion-header');
      if (headerBtn) {
        headerBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const isOpen = item.classList.contains('is-open');

          // Close other accordion items for clean single-expanded view
          accordionItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('is-open');
              const otherBtn = otherItem.querySelector('.service-accordion-header');
              if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            }
          });

          // Toggle current item
          if (isOpen) {
            item.classList.remove('is-open');
            headerBtn.setAttribute('aria-expanded', 'false');
          } else {
            item.classList.add('is-open');
            headerBtn.setAttribute('aria-expanded', 'true');
          }
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. Dynamic Year in Footer
  // --------------------------------------------------------------------------
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // --------------------------------------------------------------------------
  // 8. Hero Subtle Abstract Digital Network Parallax
  // --------------------------------------------------------------------------
  (function initHeroNetworkParallax() {
    const hero = document.getElementById('hero');
    const svgNet = document.querySelector('.hero-network-svg');
    const auraL = document.querySelector('.hero-aura-left');
    const auraR = document.querySelector('.hero-aura-right');

    if (!hero || !svgNet) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isTracking = false;

    hero.addEventListener('mouseenter', () => {
      isTracking = true;
    });

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = relX * 16;
      targetY = relY * 12;
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    function renderParallax() {
      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01 || isTracking) {
        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;

        svgNet.style.transform = `translateX(calc(-50% + ${currentX.toFixed(2)}px)) translateY(${currentY.toFixed(2)}px)`;
        if (auraL) auraL.style.transform = `translate(${(currentX * 0.7).toFixed(2)}px, ${(currentY * 0.7).toFixed(2)}px)`;
        if (auraR) auraR.style.transform = `translate(${(-currentX * 0.7).toFixed(2)}px, ${(currentY * 0.7).toFixed(2)}px)`;
      }

      requestAnimationFrame(renderParallax);
    }

    requestAnimationFrame(renderParallax);
  })();
});
