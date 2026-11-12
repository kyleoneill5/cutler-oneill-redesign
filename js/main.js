(function () {
  if (new URLSearchParams(location.search).has("qa")) {
    document.documentElement.classList.add("qa");
    if (new URLSearchParams(location.search).get("part") === "2") document.documentElement.classList.add("qa-part2");
  }
  const header = document.getElementById("header");
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");
  const toTop = document.querySelector(".to-top");
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".desktop-nav a, .bottom-bar a[href^='#']")];

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
    header.classList.toggle("is-scrolled", y > 24);
    if (toTop) toTop.classList.toggle("is-visible", y > 700);

    const headerH = header.offsetHeight + 8;
    let current = sections[0] && sections[0].id;
    for (const section of sections) {
      const top = section.getBoundingClientRect().top;
      if (top - headerH <= 0) current = section.id;
    }
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("is-active", href === "#" + current);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Smooth anchor offset for sticky header
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight + 8;
      const top = window.scrollY + target.getBoundingClientRect().top - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      history.replaceState(null, "", id);
    });
  });

  // Scroll reveals
  const els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add("is-in"));
  }

  const jump = new URLSearchParams(location.search).get("section");
  if (jump) {
    const el = document.getElementById(jump);
    if (el) {
      const offset = header.offsetHeight + 8;
      window.scrollTo(0, Math.max(0, window.scrollY + el.getBoundingClientRect().top - offset));
      onScroll();
    }
  }
})();
