/**
 * WEBORAA TECHNOLOGIES - Main Interactive Script
 * Handles navigation, idea selector, spotlight effects, case study modals, form validation, and scroll reveals
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // Enforce Clean Light Theme
  // --------------------------------------------------------------------------
  try {
    localStorage.removeItem('weboraa-theme');
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', 'light');

  // --------------------------------------------------------------------------
  // 1. Sticky Navigation & Scroll Spy
  // --------------------------------------------------------------------------
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  function handleScroll() {
    const scrollY = window.scrollY;

    // Header blur state
    if (scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    // Nav link active state
    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      mobileToggle.classList.toggle('is-active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu on clicking any link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        mobileToggle.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 2. Interactive Spotlight Cards (Mouse Glow Follower)
  // --------------------------------------------------------------------------
  const spotlightCards = document.querySelectorAll('.spotlight-card, .idea-card');
  spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Interactive Idea Selector
  // --------------------------------------------------------------------------
  const ideaCards = document.querySelectorAll('.idea-card');
  const panelBadge = document.getElementById('ideaPanelBadge');
  const panelHeading = document.getElementById('ideaPanelHeading');
  const panelDesc = document.getElementById('ideaPanelDesc');
  const panelBtn = document.getElementById('ideaPanelBtn');
  const projectTypeSelect = document.getElementById('formProjectType');

  const IDEA_DETAILS = {
    'website': {
      badge: '✦ High-Conversion Web Experience',
      heading: 'Let’s Build a World-Class Website Together.',
      desc: 'Blazing fast load speeds, captivating visual storytelling, bespoke animations, and SEO excellence engineered to position your brand at the pinnacle of your market.',
      typeValue: 'Website'
    },
    'web-app': {
      badge: '✦ Scalable Cloud Platform',
      heading: 'Let’s Architect Your Next Web Application.',
      desc: 'High-throughput full-stack architectures, intuitive dashboards, real-time collaboration engines, and robust API integrations designed for multi-tenant growth.',
      typeValue: 'Web Application'
    },
    'mobile-app': {
      badge: '✦ Native & Cross-Platform Mobility',
      heading: 'Let’s Create an Addictive Mobile Experience.',
      desc: 'Silky smooth 60fps animations, intuitive touch ergonomics, offline-first data caching, and native hardware synchronization for iOS and Android.',
      typeValue: 'Mobile App'
    },
    'e-commerce': {
      badge: '✦ Next-Gen Digital Storefront',
      heading: 'Let’s Launch Your High-Converting E-Commerce Engine.',
      desc: 'Sub-second catalog browsing, friction-free one-click checkout, dynamic inventory automation, and multi-gateway payment integrations that turn visitors into loyal buyers.',
      typeValue: 'E-Commerce'
    },
    'ai-solution': {
      badge: '✦ Intelligent Automation & Machine Learning',
      heading: 'Let’s Deploy Smart AI & Predictive Solutions.',
      desc: 'Harness LLMs, autonomous task workers, natural language parsing, and custom machine learning pipelines to eliminate repetitive manual work and unlock hidden data insights.',
      typeValue: 'AI / Automation'
    },
    'saas-product': {
      badge: '✦ Multi-Tenant SaaS Architecture',
      heading: 'Let’s Turn Your Software Vision Into a Scalable SaaS.',
      desc: 'Complete subscription lifecycles, automated user onboarding, role-based security, isolated tenant databases, and analytics telemetry built to support hyper-growth.',
      typeValue: 'Software'
    },
    'automation': {
      badge: '✦ Workflow & Systems Automation',
      heading: 'Let’s Streamline & Automate Your Business Operations.',
      desc: 'End-to-end process synchronization, custom webhook bridges, automated data validation, and real-time alerts connecting all your tools into one cohesive machine.',
      typeValue: 'AI / Automation'
    },
    'something-new': {
      badge: '✦ Bespoke Technical R&D',
      heading: 'Let’s Engineer Something Entirely New.',
      desc: 'Have an unconventional challenge or proprietary concept? We thrive on exploratory engineering, complex algorithm design, and building custom technology from first principles.',
      typeValue: 'Other'
    }
  };

  ideaCards.forEach(card => {
    card.addEventListener('click', () => {
      ideaCards.forEach(c => c.classList.remove('is-active'));
      card.classList.add('is-active');

      const ideaKey = card.dataset.idea;
      const details = IDEA_DETAILS[ideaKey];
      if (details) {
        if (panelBadge) panelBadge.textContent = details.badge;
        if (panelHeading) panelHeading.textContent = details.heading;
        if (panelDesc) panelDesc.textContent = details.desc;
        if (panelBtn) {
          panelBtn.setAttribute('data-target-type', details.typeValue);
        }
      }
    });
  });

  // Panel CTA scrolls to contact and pre-selects dropdown
  if (panelBtn) {
    panelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetType = panelBtn.getAttribute('data-target-type') || 'Web Application';
      if (projectTypeSelect) {
        projectTypeSelect.value = targetType;
      }
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        // Subtle highlight effect on form
        const formCard = document.querySelector('.contact-form-card');
        if (formCard) {
          formCard.style.boxShadow = '0 0 35px rgba(0, 240, 255, 0.4)';
          setTimeout(() => {
            formCard.style.boxShadow = '';
          }, 1500);
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. Case Study Modal
  // --------------------------------------------------------------------------
  const modalOverlay = document.getElementById('caseStudyModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalTags = document.getElementById('modalTags');
  const modalOverview = document.getElementById('modalOverview');
  const modalChallenge = document.getElementById('modalChallenge');
  const modalSolution = document.getElementById('modalSolution');
  const modalTechStack = document.getElementById('modalTechStack');
  const modalHighlights = document.getElementById('modalHighlights');
  const caseStudyTriggers = document.querySelectorAll('.view-case-study-btn');

  function openCaseStudy(projectId) {
    if (typeof PROJECTS_DATA === 'undefined') return;
    const project = PROJECTS_DATA[projectId];
    if (!project || !modalOverlay) return;

    if (modalTitle) modalTitle.textContent = project.title;
    if (modalSubtitle) modalSubtitle.textContent = project.subtitle;
    if (modalOverview) modalOverview.textContent = project.overview;
    if (modalChallenge) modalChallenge.textContent = project.challenge;
    if (modalSolution) modalSolution.textContent = project.solution;

    // Render tags
    if (modalTags) {
      modalTags.innerHTML = project.tags
        .map(tag => `<span class="project-tag">${tag}</span>`)
        .join('');
    }

    // Render tech stack pills
    if (modalTechStack) {
      modalTechStack.innerHTML = project.techStack
        .map(tech => `<span class="tech-pill">${tech}</span>`)
        .join('');
    }

    // Render key highlights
    if (modalHighlights) {
      modalHighlights.innerHTML = project.highlights
        .map(h => `<li class="transparency-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${h}</span>
        </li>`)
        .join('');
    }

    modalOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  caseStudyTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = btn.dataset.project;
      openCaseStudy(projectId);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      if (navMenu && navMenu.classList.contains('is-open')) {
        navMenu.classList.remove('is-open');
        mobileToggle.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    }
  });

  // --------------------------------------------------------------------------
  // 5. Contact Form Validation & Submission
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  function showToast(message) {
    if (!toastNotification) return;
    if (toastMessage) toastMessage.textContent = message;
    toastNotification.classList.add('is-visible');
    setTimeout(() => {
      toastNotification.classList.remove('is-visible');
    }, 5000);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('formName');
      const emailInput = document.getElementById('formEmail');
      const messageInput = document.getElementById('formMessage');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      // Validation
      if (!nameInput.value.trim()) {
        nameInput.focus();
        showToast('Please enter your full name.');
        return;
      }

      if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
        emailInput.focus();
        showToast('Please provide a valid business email address.');
        return;
      }

      if (!messageInput.value.trim()) {
        messageInput.focus();
        showToast('Please provide a brief description of your project or idea.');
        return;
      }

      // Enter loading state
      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
      }

      // Simulate robust asynchronous project inquiry submission
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
        }

        showToast('✓ Project inquiry received! A Weboraa technical lead will review and respond within 24 hours.');
        contactForm.reset();
      }, 1200);
    });
  }

  // --------------------------------------------------------------------------
  // 6. Scroll Reveal Observer
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-fade');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // --------------------------------------------------------------------------
  // 7. Pre-seed links for Start Project and Get a Quote buttons
  // --------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1 && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    });
  });
});
