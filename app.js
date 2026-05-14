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
      vB.style.display = "none";
      vA.style.opacity = "1";

      let guardTimer = null;

      function playMobile() {
        clearTimeout(guardTimer);
        const src = clips[idx];
        applyFit(vA, src);
        vA.src = src;
        vA.play().catch(() => {});
        idx = (idx + 1) % clips.length;

        vA.addEventListener("loadedmetadata", function guard() {
          vA.removeEventListener("loadedmetadata", guard);
          const dur = vA.duration || 10;
          guardTimer = setTimeout(playMobile, (dur + 1) * 1000);
        }, { once: true });
      }

      vA.addEventListener("ended", () => { clearTimeout(guardTimer); playMobile(); });
      vA.addEventListener("error", () => { clearTimeout(guardTimer); idx = (idx + 1) % clips.length; playMobile(); });
      playMobile();

    } else {
      // ── Desktop: double-buffer ──────────────────────
      //
      // The rule that prevents ALL black flashes:
      //   Never change back.src while back is still visible.
      //
      // Crossfade strategy:
      //   1. Raise nf (new clip) above nb (old clip) via z-index.
      //   2. Fade nf opacity 0→1. nb stays at opacity:1 the whole time —
      //      it acts as the "background" so the dark hero never bleeds through.
      //   3. Only AFTER the transition (250ms), hide nb and swap its src.
      //      By then nf is fully opaque and covers nb completely.
      //
      let front = vA, back = vB;

      function loadBack(src) {
        applyFit(back, src);
        back.src = src;
        back.load();
      }

      function advance() {
        const nf = back, nb = front;
        let done = false;

        function doSwap() {
          if (done) return;
          done = true;

          // New clip goes on top, old clip stays fully visible beneath it
          nf.style.zIndex = "1";
          nb.style.zIndex = "0";

          // One rAF lets the browser paint the z-index before the fade starts,
          // guaranteeing nf is above nb when it fades in.
          requestAnimationFrame(() => {
            nf.style.opacity = "1";
          });

          // Wire up the next transition immediately
          front = nf;
          back  = nb;
          front.addEventListener("ended",  advance,       { once: true });
          front.addEventListener("error",  skipAndAdvance, { once: true });

          // Only after nf has fully faded in: hide nb and load the next clip.
          // At this point nf covers nb completely, so changing nb.src is invisible.
          setTimeout(() => {
            nb.style.opacity = "0";
            idx = (idx + 1) % clips.length;
            loadBack(clips[idx]);
          }, 250); // matches CSS transition (200ms) + safety margin
        }

        nf.play().catch(() => {});

        // Wait until nf has at least one decoded frame before swapping,
        // so the first frame shown is never black.
        if (nf.readyState >= 2) {
          doSwap();
        } else {
          nf.addEventListener("canplay", doSwap, { once: true });
          setTimeout(doSwap, 800); // fallback if canplay is slow
        }
      }

      function skipAndAdvance() {
        idx = (idx + 1) % clips.length;
        advance();
      }

      // Init: vA plays first, vB silently buffers second
      applyFit(vA, clips[0]);
      vA.src      = clips[0];
      vA.style.zIndex  = "1";
      vA.style.opacity = "1";
      vB.style.zIndex  = "0";
      vB.style.opacity = "0";
      vA.play().catch(() => {});
      vA.addEventListener("ended",  advance,       { once: true });
      vA.addEventListener("error",  skipAndAdvance, { once: true });
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
