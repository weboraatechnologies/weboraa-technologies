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
  // 4. Conversation / Project Quote Modal
  // --------------------------------------------------------------------------
  const conversationModal = document.getElementById('conversationModal');
  const closeConversationModalBtn = document.getElementById('closeConversationModal');
  const modalInquiryForm = document.getElementById('modalInquiryForm');
  const modalSuccessAlert = document.getElementById('modalSuccessAlert');
  const modalServiceTag = document.getElementById('modalServiceTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalServiceSelect = document.getElementById('modalService');
  const modalMessage = document.getElementById('modalMessage');

  function openConversationModal(serviceName) {
    if (!conversationModal) return;

    if (modalServiceTag) {
      modalServiceTag.textContent = serviceName ? `Project Scope: ${serviceName}` : 'Fast Turnaround • 24h Response';
    }

    if (modalTitle) {
      modalTitle.textContent = serviceName ? `Discuss ${serviceName}` : 'Get a Project Quote';
    }

    if (modalServiceSelect && serviceName) {
      // Find matching option in select
      for (let i = 0; i < modalServiceSelect.options.length; i++) {
        if (modalServiceSelect.options[i].text.toLowerCase().includes(serviceName.toLowerCase()) ||
            serviceName.toLowerCase().includes(modalServiceSelect.options[i].text.toLowerCase())) {
          modalServiceSelect.selectedIndex = i;
          break;
        }
      }
    }

    if (modalMessage && serviceName && !modalMessage.value) {
      modalMessage.value = `Hi Weboraa team, I would like to get a quote and discuss our requirements for ${serviceName}.`;
    }

    conversationModal.classList.add('is-open');
    conversationModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus on first input without layout shift
    const firstInput = document.getElementById('modalName');
    if (firstInput) {
      try {
        firstInput.focus({ preventScroll: true });
      } catch (err) {
        firstInput.focus();
      }
    }
  }

  function closeConversationModal() {
    if (!conversationModal) return;
    conversationModal.classList.remove('is-open');
    conversationModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeConversationModalBtn) {
    closeConversationModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeConversationModal();
    });
  }

  if (conversationModal) {
    conversationModal.addEventListener('click', (e) => {
      if (e.target === conversationModal) {
        e.preventDefault();
        closeConversationModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && conversationModal.classList.contains('is-open')) {
        closeConversationModal();
      }
    });
  }

  // Bind all quote / discussion triggers
  document.querySelectorAll('[data-open-modal="conversation"]').forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      const service = this.getAttribute('data-service') || '';
      openConversationModal(service);
    });
  });

  // Modal Form Submission
  if (modalInquiryForm) {
    modalInquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('modalName');
      const email = document.getElementById('modalEmail');
      const message = document.getElementById('modalMessage');
      const submitBtn = modalInquiryForm.querySelector('button[type="submit"]');

      if (!name || !name.value.trim()) {
        alert('Please enter your full name.');
        if (name) name.focus({ preventScroll: true });
        return;
      }

      if (!email || !email.value.trim() || !email.value.includes('@') || !email.value.includes('.')) {
        alert('Please provide a valid email address.');
        if (email) email.focus({ preventScroll: true });
        return;
      }

      if (!message || !message.value.trim()) {
        alert('Please provide a brief description of your project.');
        if (message) message.focus({ preventScroll: true });
        return;
      }

      const origText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Sending quote request...</span>';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(modalInquiryForm);
        // Anti-spam check
        if (formData.get('_honey')) {
          submitBtn.innerHTML = origText;
          submitBtn.disabled = false;
          modalInquiryForm.reset();
          closeConversationModal();
          return;
        }

        const endpoint = modalInquiryForm.getAttribute('action') || 'https://formsubmit.co/ajax/weboraatechnologies@gmail.com';
        const ajaxEndpoint = endpoint.includes('/ajax/') ? endpoint : endpoint.replace('formsubmit.co/', 'formsubmit.co/ajax/');

        const response = await fetch(ajaxEndpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        });

        const result = await response.json().catch(() => ({}));
        console.log('Modal quote request result:', result);
      } catch (err) {
        console.warn('Form submission notice:', err);
      } finally {
        submitBtn.innerHTML = origText;
        submitBtn.disabled = false;
        modalInquiryForm.reset();

        if (modalSuccessAlert) {
          modalSuccessAlert.style.display = 'flex';
          setTimeout(() => {
            modalSuccessAlert.style.display = 'none';
            closeConversationModal();
          }, 3200);
        } else {
          closeConversationModal();
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
  // 6. Contact Form Validation & Submission
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('projectInquiryForm');
  const formSuccessAlert = document.getElementById('formSuccessAlert');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check anti-spam honeypot
      const honeypot = document.getElementById('contactWebsiteHoneypot');
      if (honeypot && honeypot.value.trim() !== '') {
        // Silent bot discard
        return;
      }

      const name = document.getElementById('contactName');
      const email = document.getElementById('contactEmail');
      const message = document.getElementById('contactMessage');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      if (!name || !name.value.trim()) {
        alert('Please enter your full name.');
        if (name) name.focus();
        return;
      }

      if (!email || !email.value.trim() || !email.value.includes('@') || !email.value.includes('.')) {
        alert('Please provide a valid email address.');
        if (email) email.focus();
        return;
      }

      if (!message || !message.value.trim()) {
        alert('Please tell us about your project requirements.');
        if (message) message.focus();
        return;
      }

      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Sending inquiry...</span>';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(contactForm);
        // Anti-spam check
        if (formData.get('_honey') || (honeypot && honeypot.value.trim() !== '')) {
          submitBtn.innerHTML = originalBtnHTML;
          submitBtn.disabled = false;
          contactForm.reset();
          return;
        }

        const endpoint = contactForm.getAttribute('action') || 'https://formsubmit.co/ajax/weboraatechnologies@gmail.com';
        const ajaxEndpoint = endpoint.includes('/ajax/') ? endpoint : endpoint.replace('formsubmit.co/', 'formsubmit.co/ajax/');

        const response = await fetch(ajaxEndpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        });

        const result = await response.json().catch(() => ({}));
        console.log('Project inquiry result:', result);
      } catch (err) {
        console.warn('Form submission notice:', err);
      } finally {
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;

        if (formSuccessAlert) {
          formSuccessAlert.style.display = 'flex';
          formSuccessAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        contactForm.reset();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. Services Clean Expandable Accordion
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
  // 8. Dynamic Year in Footer
  // --------------------------------------------------------------------------
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }
});
