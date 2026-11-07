/**
 * Template Name: Company
 * Template URL: https://bootstrapmade.com/company-free-html-bootstrap-template/
 * Updated: Aug 07 2024 with Bootstrap v5.3.3
 * Author: BootstrapMade.com
 * License: https://bootstrapmade.com/license/
 */

(function () {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector("body");
    const selectHeader = document.querySelector("#header");
    if (!selectBody || !selectHeader) return;
    if (
      !selectHeader.classList.contains("scroll-up-sticky") &&
      !selectHeader.classList.contains("sticky-top") &&
      !selectHeader.classList.contains("fixed-top")
    )
      return;
    window.scrollY > 100
      ? selectBody.classList.add("scrolled")
      : selectBody.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);
  window.addEventListener("load", toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector(".mobile-nav-toggle");

  function mobileNavToogle() {
    if (!mobileNavToggleBtn) return;
    document.querySelector("body").classList.toggle("mobile-nav-active");
    mobileNavToggleBtn.classList.toggle("bi-list");
    mobileNavToggleBtn.classList.toggle("bi-x");
    mobileNavToggleBtn.setAttribute("aria-expanded", String(document.body.classList.contains("mobile-nav-active")));
  }
  function keyboardClick(element) {
    element.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        element.click();
      }
    });
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.setAttribute("role", "button");
    mobileNavToggleBtn.setAttribute("tabindex", "0");
    mobileNavToggleBtn.setAttribute("aria-label", "Toggle navigation");
    mobileNavToggleBtn.setAttribute("aria-controls", "navmenu");
    mobileNavToggleBtn.setAttribute("aria-expanded", "false");
    mobileNavToggleBtn.addEventListener("click", mobileNavToogle);
    keyboardClick(mobileNavToggleBtn);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && document.body.classList.contains("mobile-nav-active")) {
        mobileNavToogle();
        mobileNavToggleBtn.focus();
      }
    });
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll("#navmenu a").forEach((navmenu) => {
    navmenu.addEventListener("click", () => {
      if (document.querySelector(".mobile-nav-active")) {
        mobileNavToogle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll(".navmenu .toggle-dropdown").forEach((navmenu) => {
    const parent = navmenu.parentElement;
    const submenu = parent?.nextElementSibling;
    if (!parent || !submenu) return;
    parent.setAttribute("aria-haspopup", "true");
    parent.setAttribute("aria-expanded", "false");
    navmenu.addEventListener("click", function (e) {
      e.preventDefault();
      parent.classList.toggle("active");
      submenu.classList.toggle("dropdown-active");
      parent.setAttribute("aria-expanded", String(submenu.classList.contains("dropdown-active")));
      e.stopImmediatePropagation();
    });
    parent.addEventListener("keydown", event => {
      if (event.key === "ArrowDown") {
        event.preventDefault(); event.stopPropagation();
        parent.classList.add("active"); submenu.classList.add("dropdown-active");
        parent.setAttribute("aria-expanded", "true");
        submenu.querySelector("a")?.focus();
      }
      if (event.key === "Escape") {
        parent.classList.remove("active"); submenu.classList.remove("dropdown-active");
        parent.setAttribute("aria-expanded", "false"); parent.focus();
      }
    });
  });

  /**
   * Preloader
   */
  // const preloader = document.querySelector("#preloader");
  // if (preloader) {
  //   window.addEventListener("load", () => {
  //     preloader.remove();
  //   });
  // }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector(".scroll-top");

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100
        ? scrollTop.classList.add("active")
        : scrollTop.classList.remove("active");
    }
  }

  // Add the missing safety check here!
  if (scrollTop) {
    scrollTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  window.addEventListener("load", toggleScrollTop);
  document.addEventListener("scroll", toggleScrollTop);
  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    if (typeof AOS === "undefined") return;
    AOS.init({
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }
  window.addEventListener("load", aosInit);

  /**
   * Auto generate the carousel indicators
   */
  document
    .querySelectorAll(".carousel-indicators")
    .forEach((carouselIndicator) => {
      carouselIndicator
        .closest(".carousel")
        .querySelectorAll(".carousel-item")
        .forEach((carouselItem, index) => {
          if (index === 0) {
            carouselIndicator.innerHTML += `<li data-bs-target="#${
              carouselIndicator.closest(".carousel").id
            }" data-bs-slide-to="${index}" class="active"></li>`;
          } else {
            carouselIndicator.innerHTML += `<li data-bs-target="#${
              carouselIndicator.closest(".carousel").id
            }" data-bs-slide-to="${index}"></li>`;
          }
        });
    });

  // Hook Rotators
  document.addEventListener("DOMContentLoaded", () => {
    const title = document.getElementById("hook-title");
    const question = document.getElementById("hook-question");
    const container = document.getElementById("hook-options-container");
    if (!title || !question || !container) return;
    // 1. Define your copy variations and their respective target URL parameters
    const hooks = [
      {
        title: "🌐 Web Presence",
        question: "Do you currently have a website for your business?",
        options: [
          {
            text: "Yes — professionally built",
            param: "has_website=yes_professional",
          },
          {
            text: "Yes — I built it myself / basic",
            param: "has_website=yes_diy",
          },
          { text: "No website yet", param: "has_website=no" },
        ],
      },
      {
        title: "📈 Growth & Scaling",
        question: "What is your primary goal for your business right now?",
        options: [
          {
            text: "Getting more consistent daily customers",
            param: "goal=more_customers",
          },
          {
            text: "Building a stronger online brand presence",
            param: "goal=brand_building",
          },
          {
            text: "Fixing internal operational bottlenecks",
            param: "goal=operations",
          },
        ],
      },
      {
        title: "📣 Marketing & Visibility",
        question: "Where do most of your current customers come from?",
        options: [
          { text: "Word of mouth / Referrals", param: "source=referrals" },
          {
            text: "Social media (Instagram, Facebook, etc.)",
            param: "source=social_media",
          },
          {
            text: "Google search / Local map listings",
            param: "source=google_search",
          },
        ],
      },
      {
        title: "🎯 Strategy Check",
        question:
          "Do you actively know what your competitors are doing online?",
        options: [
          {
            text: "Yes, I keep a close eye on them",
            param: "competitor_awareness=high",
          },
          {
            text: "I have a vague idea, but nothing concrete",
            param: "competitor_awareness=medium",
          },
          {
            text: "No, I focus entirely on my own setup",
            param: "competitor_awareness=low",
          },
        ],
      },
    ];

    // 2. Pick a random hook variation
    const randomHook = hooks[Math.floor(Math.random() * hooks.length)];

    // 3. Update the text copy inside the card
    title.textContent = randomHook.title;
    question.textContent = randomHook.question;

    // 4. Build and inject the new option buttons
    container.innerHTML = ""; // Clear out placeholders

    randomHook.options.forEach((opt) => {
      const link = document.createElement("a");
      link.href = `https://webtellisense.com/business-audit-tool?${opt.param}`;
      link.className = "lure-opt";
      link.innerHTML = `
            <span>${opt.text}</span>
            <span class="arrow">→</span>
        `;
      container.appendChild(link);
    });
  });

  // Hook Rotators End

  /**
   * Initiate glightbox
   */
  if (typeof GLightbox !== "undefined") GLightbox({ selector: ".glightbox" });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll(".isotope-layout").forEach(function (isotopeItem) {
    if (typeof imagesLoaded === "undefined" || typeof Isotope === "undefined" || !isotopeItem.querySelector(".isotope-container")) return;
    let layout = isotopeItem.getAttribute("data-layout") ?? "masonry";
    let filter = isotopeItem.getAttribute("data-default-filter") ?? "*";
    let sort = isotopeItem.getAttribute("data-sort") ?? "original-order";

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector(".isotope-container"), function () {
      initIsotope = new Isotope(
        isotopeItem.querySelector(".isotope-container"),
        {
          itemSelector: ".isotope-item",
          layoutMode: layout,
          filter: filter,
          sortBy: sort,
        },
      );
    });

    isotopeItem
      .querySelectorAll(".isotope-filters li")
      .forEach(function (filters) {
        filters.addEventListener(
          "click",
          function () {
            if (!initIsotope) return;
            isotopeItem.querySelector(".isotope-filters .filter-active")?.classList.remove("filter-active");
            this.classList.add("filter-active");
            initIsotope.arrange({
              filter: this.getAttribute("data-filter"),
            });
            if (typeof aosInit === "function") {
              aosInit();
            }
          },
          false,
        );
      });
  });

  document.querySelectorAll(".isotope-filters li, .faq-filter li").forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "site-filter-button";
    while (item.firstChild) button.appendChild(item.firstChild);
    item.appendChild(button);
  });

  document.querySelectorAll('.progress [role="progressbar"]').forEach(bar => {
    const label = bar.closest('.progress')?.querySelector('.skill > span')?.textContent;
    if (label) bar.setAttribute('aria-label', label.trim());
  });

  // animate skillbar
  document.addEventListener("DOMContentLoaded", () => {
    const skillBars = document.querySelectorAll(".progress-bar");
    skillBars.forEach((bar) => {
      const targetWidth = bar.getAttribute("aria-valuenow");
      bar.style.width = "0";
      setTimeout(() => {
        bar.style.width = `${targetWidth}%`;
      }, 300);
    });
  });

  // Filter Functionality
  document.querySelectorAll(".faq-filter li").forEach((filter) => {
    filter.addEventListener("click", function () {
      // Update active filter
      document
        .querySelector(".faq-filter .filter-active")
        .classList.remove("filter-active");
      this.classList.add("filter-active");

      const filterValue = this.getAttribute("data-filter");

      // Filter items
      document.querySelectorAll(".faq-item").forEach((item) => {
        if (
          filterValue === "*" ||
          item.classList.contains(filterValue.replace(".", ""))
        ) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // Accordion Functionality
  document.querySelectorAll(".faq-item h3").forEach((question) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "faq-question";
    while (question.firstChild) button.appendChild(question.firstChild);
    question.appendChild(button);
    button.setAttribute("aria-expanded", String(question.parentElement.classList.contains("active")));
    question.addEventListener("click", function () {
      const parent = this.parentElement;
      parent.classList.toggle("active");
      button.setAttribute("aria-expanded", String(parent.classList.contains("active")));
    });
  });

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll(".skills-animation");
  skillsAnimation.forEach((item) => {
    if (typeof Waypoint === "undefined") return;
    new Waypoint({
      element: item,
      offset: "80%",
      handler: function (direction) {
        let progress = item.querySelectorAll(".progress .progress-bar");
        progress.forEach((el) => {
          el.style.width = el.getAttribute("aria-valuenow") + "%";
        });
      },
    });
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    if (typeof Swiper === "undefined") return;
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      const configElement = swiperElement.querySelector(".swiper-config");
      if (!configElement) return;
      let config;
      try { config = JSON.parse(configElement.textContent.trim()); } catch { return; }

      if (swiperElement.classList.contains("swiper-tab") && typeof initSwiperWithCustomPagination === "function") {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Init image animation on business audit tool page
   */
  const cards = document.querySelectorAll(".wt-card");

  cards.forEach((card, index) => {
    if (!card.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    card.animate(
      [
        { transform: "translateY(0px)" },
        { transform: "translateY(-12px)" },
        { transform: "translateY(0px)" },
      ],
      {
        duration: 4000 + index * 500,
        iterations: Infinity,
        easing: "ease-in-out",
      },
    );
  });
})();
