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

    // Kill any CSS transitions — hard cuts only, no blending
    vA.style.transition = "none";
    vB.style.transition = "none";

    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    if (isMobile) {
      // ── Mobile: single video, hard cut ─────────────
      vB.style.display = "none";
      vA.style.opacity = "1";
      let guardTimer = null;

      function playMobile() {
        clearTimeout(guardTimer);
        const src = clips[idx];
        idx = (idx + 1) % clips.length;
        applyFit(vA, src);
        vA.src = src;
        vA.load();
        vA.play().catch(() => {});
        vA.addEventListener("loadedmetadata", function onMeta() {
          vA.removeEventListener("loadedmetadata", onMeta);
          const dur = vA.duration || 10;
          guardTimer = setTimeout(playMobile, (dur + 1) * 1000);
        }, { once: true });
      }

      vA.addEventListener("ended", () => { clearTimeout(guardTimer); playMobile(); });
      vA.addEventListener("error",  () => { clearTimeout(guardTimer); playMobile(); });
      playMobile();

    } else {
      // ── Desktop: double-buffer, instant hard cut ────
      //
      // front = currently visible video  (z:1, opacity:1)
      // back  = preloading next clip     (z:0, opacity:0, hidden)
      //
      // On cut: flip z-index + opacity INSTANTLY (no CSS transition),
      // then preload the clip after that into the new back.
      //
      let front = vA, back = vB;

      // Initialise front
      applyFit(front, clips[0]);
      front.src            = clips[0];
      front.style.zIndex   = "1";
      front.style.opacity  = "1";
      front.play().catch(() => {});

      // Preload clip[1] into back (invisible)
      idx = 1;
      applyFit(back, clips[idx]);
      back.src           = clips[idx];
      back.load();
      back.style.zIndex  = "0";
      back.style.opacity = "0";

      function loadNextIntoBack() {
        idx = (idx + 1) % clips.length;
        applyFit(back, clips[idx]);
        back.src = clips[idx];
        back.load();
      }

      function doHardCut() {
        const nf = back, nb = front;
        // Instant swap — no animation whatsoever
        nf.style.zIndex  = "1";
        nf.style.opacity = "1";
        nb.style.zIndex  = "0";
        nb.style.opacity = "0";
        front = nf;
        back  = nb;
        watchEnd();
        loadNextIntoBack();
      }

      function watchEnd() {
        const target = front;
        let fired = false;

        function cut() {
          if (fired) return;
          fired = true;
          target.removeEventListener("timeupdate", onTime);
          target.removeEventListener("ended",      cut);
          target.removeEventListener("error",      cut);

          // Only cut once back has at least one decoded frame
          let done = false;
          function executeCut() {
            if (done) return;
            done = true;
            back.play().catch(() => {});
            doHardCut();
          }

          if (back.readyState >= 2) {
            executeCut();
          } else {
            back.addEventListener("canplay", function onCP() {
              back.removeEventListener("canplay", onCP);
              executeCut();
            });
            // Hard deadline: cut anyway after 1 s so we never get stuck
            setTimeout(executeCut, 1000);
          }
        }

        // Fire 0.5 s before clip ends to skip black tail frames
        // embedded in the source files. 'ended' is the safety fallback.
        function onTime() {
          if (target.duration && target.currentTime >= target.duration - 0.5) cut();
        }

        target.addEventListener("timeupdate", onTime);
        target.addEventListener("ended", cut, { once: true });
        target.addEventListener("error", cut, { once: true });
      }

      watchEnd();

      // Resume if the tab was backgrounded
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) front.play().catch(() => {});
      });
    }
  }

  // ── Reveal on scroll ───────────────────────────────
  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-visible"); });
  }, { threshold: 0.10 });
  revealItems.forEach((el) => revealObserver.observe(el));

  // ── Project tile videos ────────────────────────────
  const tileVideos = document.querySelectorAll("video:not(#hv-a):not(#hv-b)");
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.play().catch(() => {}); }
      else                  { e.target.pause(); }
    });
  }, { threshold: 0.25 });

  tileVideos.forEach((v) => {
    v.muted               = true;
    v.playsInline         = true;
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
