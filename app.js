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

    vA.style.transition = "none";
    vB.style.transition = "none";

    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    if (isMobile) {
      // ── Mobile: single video ────────────────────────
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
      // ── Desktop: rAF polling state machine ─────────
      //
      // No event listeners for swap logic — just inspect state
      // every animation frame. Eliminates every race condition
      // and missed-event bug that plagued the event-driven versions.
      //
      // front = currently visible, playing video
      // back  = silently preloading the next clip
      //
      // Swap rule: when front is ≤ 0.5 s from its end AND
      // back.readyState ≥ 2 (first frame decoded), cut instantly.
      // If back isn't ready yet, loop front until it is.
      //
      let front = vA, back = vB;
      let started = false;

      front.style.zIndex = "1";
      back.style.zIndex  = "0";

      function loadInto(v, src) {
        applyFit(v, src);
        v.src = src;
        v.load();
      }

      loadInto(front, clips[0]);
      idx = 1;
      loadInto(back, clips[idx]);

      function doSwap() {
        front.loop = false;

        back.play().catch(() => {});
        back.style.zIndex  = "1";
        back.style.opacity = "1";
        front.style.zIndex  = "0";
        front.style.opacity = "0";

        // Swap references
        const tmp = front;
        front = back;
        back  = tmp;

        // Queue next clip into the now-hidden old front
        idx = (idx + 1) % clips.length;
        loadInto(back, clips[idx]);
      }

      function tick() {
        // Phase 1 – wait for first clip to have a decoded frame
        if (!started) {
          if (front.readyState >= 2) {
            front.style.opacity = "1";
            front.play().catch(() => {});
            started = true;
          }
          requestAnimationFrame(tick);
          return;
        }

        // Phase 2 – normal monitoring
        const dur      = front.duration;
        const finite   = dur > 0 && isFinite(dur);
        const timeLeft = finite ? dur - front.currentTime : Infinity;
        const nearEnd  = timeLeft <= 0.5 || front.ended;

        if (nearEnd) {
          if (back.readyState >= 2) {
            // Back has a decoded frame — hard cut
            doSwap();
          } else {
            // Back isn't ready yet — keep screen filled by looping front
            if (front.ended) {
              // Video already ended before back was ready: restart it
              front.currentTime = 0;
              front.play().catch(() => {});
            }
            front.loop = true;   // prevent it from ending again
          }
        }

        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);

      // Resume after tab backgrounding
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
          if (front.ended) front.currentTime = 0;
          front.play().catch(() => {});
        }
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
