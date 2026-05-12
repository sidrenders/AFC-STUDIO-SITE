(function () {
  // ── Hero montage ───────────────────────────────────
  const vA = document.getElementById("hv-a");
  const vB = document.getElementById("hv-b");
  if (vA && vB) {
    const clips = [
      "/videos/landing%20page/benq-web.mp4",
      "/videos/landing%20page/lucid-web.mp4",
      "/videos/landing%20page/reentry-evacuation.mp4",
      "/videos/landing%20page/river-web_2.mp4",
      "/videos/landing%20page/2024_1_1.mp4",
      "/videos/landing%20page/2024_1_2.mp4",
      "/videos/landing%20page/A_WISE_HQ.mp4",
      "/videos/landing%20page/bin-laden.mp4",
      "/videos/landing%20page/moon-discovery.mp4",
      "/videos/landing%20page/river-web.mp4",
      "/videos/landing%20page/river-web_1.mp4",
      "/videos/landing%20page/river-web_3.mp4",
      "/videos/landing%20page/try-again.mp4",
    ];
    for (let i = clips.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clips[i], clips[j]] = [clips[j], clips[i]];
    }

    let idx = 0;

    function applyFit(v, src) {
      v.style.objectFit = src.includes("try-again") ? "contain" : "cover";
    }

    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    if (isMobile) {
      // ── Mobile: single video, no double-buffer ──────
      // Two simultaneous preloading videos freeze mobile browsers.
      vB.style.display = "none";
      vA.style.zIndex = "1";

      let guardTimer = null;

      function playMobile() {
        clearTimeout(guardTimer);
        const src = clips[idx];
        applyFit(vA, src);
        vA.src = src;
        vA.play().catch(() => {});
        idx = (idx + 1) % clips.length;

        // iOS guard: if 'ended' doesn't fire within a generous window, force next
        vA.addEventListener("loadedmetadata", function guard() {
          vA.removeEventListener("loadedmetadata", guard);
          const dur = vA.duration || 10;
          guardTimer = setTimeout(playMobile, (dur + 1) * 1000);
        }, { once: true });
      }

      vA.addEventListener("ended", () => { clearTimeout(guardTimer); playMobile(); });
      vA.addEventListener("error",  () => { clearTimeout(guardTimer); idx = (idx + 1) % clips.length; playMobile(); });
      playMobile();

    } else {
      // ── Desktop: double-buffer for instant cuts ─────
      let front = vA, back = vB;

      function loadBack(src) {
        applyFit(back, src);
        back.src = src;
        back.load(); // preload silently in background
      }

      function advance() {
        const nf = back, nb = front; // next-front, next-back
        let swapped = false;

        function doSwap() {
          if (swapped) return;
          swapped = true;
          nf.style.zIndex = "1";
          nb.style.zIndex = "0";
          front = nf;
          back  = nb;
          front.addEventListener("ended", advance, { once: true });
          front.addEventListener("error", skipAndAdvance, { once: true });
          idx = (idx + 1) % clips.length;
          loadBack(clips[idx]);
        }

        nf.play().catch(() => {});

        // Wait until the new clip actually has a frame ready before swapping.
        // This keeps the old clip's last frame visible instead of flashing black.
        if (nf.readyState >= 2) {
          doSwap();
        } else {
          nf.addEventListener("canplay", doSwap, { once: true });
          setTimeout(doSwap, 800); // safety fallback if canplay is slow
        }
      }

      function skipAndAdvance() {
        idx = (idx + 1) % clips.length;
        advance();
      }

      applyFit(vA, clips[0]);
      vA.src = clips[0];
      vA.style.zIndex = "1";
      vB.style.zIndex = "0";
      vA.play().catch(() => {});
      vA.addEventListener("ended", advance, { once: true });
      vA.addEventListener("error", skipAndAdvance, { once: true });
      idx = 1;
      loadBack(clips[1]);
    }
  }

  // ── Reveal on scroll ───────────────────────────────
  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-visible"); });
  }, { threshold: 0.10 });
  revealItems.forEach((el) => revealObserver.observe(el));

  // ── Project tile videos (play/pause on scroll) ─────
  const tileVideos = document.querySelectorAll("video:not(#hv-a):not(#hv-b)");
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { v.play().catch(() => {}); }
      else { v.pause(); }
    });
  }, { threshold: 0.25 });

  tileVideos.forEach((v) => {
    v.muted = true;
    v.playsInline = true;
    v.style.pointerEvents = "none";
    videoObserver.observe(v);
  });

  // ── Footer wordmark fit ────────────────────────────
  const footerWordmark = document.querySelector(".footer-wordmark span");
  function fitWordmark() {
    if (!footerWordmark) return;
    const parent = footerWordmark.parentElement;
    if (!parent) return;
    const available = parent.clientWidth * 0.995;
    if (!available) return;
    let size = Math.min(window.innerWidth * 0.38, 620);
    footerWordmark.style.fontSize = `${size}px`;
    while (footerWordmark.scrollWidth > available && size > 40) {
      size -= 4;
      footerWordmark.style.fontSize = `${size}px`;
    }
  }
  fitWordmark();
  window.addEventListener("resize", fitWordmark);

  // ── Custom cursor (desktop only) ───────────────────
  const cursor = document.querySelector(".cursor-logo");
  if (cursor && window.matchMedia("(pointer:fine)").matches) {
    let visible = false;
    const interactive = document.querySelectorAll("a, button, .project-tile");

    window.addEventListener("mousemove", (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top  = `${e.clientY}px`;
      if (!visible) { cursor.style.opacity = "1"; visible = true; }
    });
    window.addEventListener("mouseleave", () => { cursor.style.opacity = "0"; visible = false; });

    interactive.forEach((node) => {
      node.addEventListener("mouseenter", () => { cursor.style.transform = "translate(-50%, -50%) scale(1.18)"; });
      node.addEventListener("mouseleave", () => { cursor.style.transform = "translate(-50%, -50%) scale(1)"; });
    });

    window.addEventListener("click", () => {
      cursor.classList.remove("is-burst");
      void cursor.offsetWidth;
      cursor.classList.add("is-burst");
    });
  }
})();
