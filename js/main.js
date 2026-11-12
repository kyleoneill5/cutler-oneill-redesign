(function () {
  const header = document.getElementById("header");
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".desktop-nav a")];
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const offsetOf = () => (header ? header.offsetHeight : 0);

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open menu");
    }
    if (mobileNav) mobileNav.hidden = true;
  };

  const openMenu = () => {
    document.body.classList.add("menu-open");
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close menu");
    mobileNav.hidden = false;
  };

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      if (document.body.classList.contains("menu-open")) closeMenu();
      else openMenu();
    });
  }

  document.querySelectorAll(".mobile-nav a").forEach((a) => {
    a.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  const onScroll = () => {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle("is-scrolled", y > 24);

    const headerH = offsetOf() + 8;
    let current = sections[0] && sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top - headerH <= 0) current = section.id;
    }
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + current);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = window.scrollY + target.getBoundingClientRect().top;
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });

  const els = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add("is-in"));
  }

  const initObitCarousel = () => {
    const root = document.querySelector("[data-carousel]");
    if (!root) return;
    const track = root.querySelector(".obit-track");
    const prev = root.querySelector(".obit-arrow.prev");
    const next = root.querySelector(".obit-arrow.next");
    const dotsWrap = document.getElementById("obitDots");
    const items = Array.from(track.children);
    if (!items.length || !dotsWrap) return;

    const desktop = window.matchMedia("(min-width: 700px)");

    dotsWrap.innerHTML = "";
    items.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show obituary " + (i + 1) + " of " + items.length);
      b.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(b);
    });

    const gapOf = () => {
      const style = window.getComputedStyle(track);
      return parseFloat(style.columnGap || style.gap) || 16;
    };
    const cardStep = () => items[0].getBoundingClientRect().width + gapOf();
    const indexOf = () => Math.round(track.scrollLeft / cardStep());

    const goTo = (i) => {
      const max = items.length - 1;
      i = Math.max(0, Math.min(max, i));
      track.scrollTo({ left: i * cardStep(), behavior: reduce ? "auto" : "smooth" });
      paint(i);
    };

    const paint = (i) => {
      const idx = typeof i === "number" ? i : indexOf();
      dotsWrap.querySelectorAll("button").forEach((b, n) => {
        b.classList.toggle("is-on", n === idx);
        b.setAttribute("aria-current", n === idx ? "true" : "false");
      });
      if (prev) prev.disabled = idx <= 0;
      if (next) next.disabled = idx >= items.length - 1;
    };

    prev && prev.addEventListener("click", () => goTo(indexOf() - 1));
    next && next.addEventListener("click", () => goTo(indexOf() + 1));

    let ticking = false;
    track.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        paint();
        ticking = false;
      });
    }, { passive: true });

    paint(0);
    window.addEventListener("resize", () => {
      if (desktop.matches) return;
      paint();
    });
  };
  initObitCarousel();

})();
