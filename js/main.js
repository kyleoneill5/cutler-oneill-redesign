(function () {
  const header = document.getElementById("header");
  const menuBtn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastFocus = null;

  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open menu");
    }
    if (menu) {
      menu.hidden = true;
      menu.classList.remove("is-ready");
    }
    if (lastFocus) lastFocus.focus();
  };

  const openMenu = () => {
    lastFocus = document.activeElement;
    document.body.classList.add("menu-open");
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close menu");
    menu.hidden = false;
    requestAnimationFrame(() => {
      menu.classList.add("is-ready");
      const first = menu.querySelector("a");
      if (first) first.focus();
    });
  };

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => {
      if (document.body.classList.contains("menu-open")) closeMenu();
      else openMenu();
    });
  }

  document.querySelectorAll(".menu a").forEach((a) => {
    a.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
    if (e.key !== "Tab" || !document.body.classList.contains("menu-open")) return;
    const focusable = [menuBtn, ...menu.querySelectorAll("a")].filter(Boolean);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

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

  // Count-up for official stats
  const nums = document.querySelectorAll(".stat-num[data-count]");
  const runCount = (el) => {
    const end = Number(el.getAttribute("data-count"));
    const plus = el.querySelector("span");
    if (reduce || !end) {
      el.childNodes[0].textContent = String(end);
      return;
    }
    const start = performance.now();
    const dur = 1100;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.childNodes[0].textContent = String(Math.round(end * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const ioN = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCount(entry.target);
            ioN.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    nums.forEach((n) => ioN.observe(n));
  } else {
    nums.forEach(runCount);
  }

  const initObitCarousel = () => {
    const root = document.querySelector("[data-carousel]");
    if (!root) return;
    const track = root.querySelector(".obit-track");
    const prev = root.querySelector(".obit-arrow.prev");
    const next = root.querySelector(".obit-arrow.next");
    const dotsWrap = document.getElementById("obitDots");
    const bar = document.getElementById("obitProgress");
    const items = Array.from(track.children);
    if (!items.length || !dotsWrap) return;

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
      if (bar) bar.style.width = ((idx + 1) / items.length) * 100 + "%";
    };

    if (prev) prev.addEventListener("click", () => goTo(indexOf() - 1));
    if (next) next.addEventListener("click", () => goTo(indexOf() + 1));

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
    window.addEventListener("resize", () => paint());
  };
  initObitCarousel();
})();
