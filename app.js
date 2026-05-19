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
      // ── Desktop ─────────────────────────────────────
      //
      // rAF polling — checked every frame, zero event-listener races.
      //
      // KEY FIX: Chrome throttles loading of opacity:0 / z-index:0
      // video elements. We call play() immediately when loading the
      // back clip — playing videos always get full resource priority
      // regardless of visibility. We seek back to 0 at swap time so
      // the viewer always sees the clip from the beginning.
      //
      let front = vA, back = vB;
      let started   = false;
      let waitSince = 0; // used to skip a clip that takes > 5 s to load

      front.style.zIndex = "1";
      back.style.zIndex  = "0";

      // Load a clip into v and immediately start playing it (muted,
      // invisible) so Chrome gives it full download priority.
      function prime(v, src) {
        applyFit(v, src);
        v.src = src;
        v.load();
        v.play().catch(() => {});
      }

      // Front: load but don't reveal yet — tick() handles first show.
      applyFit(front, clips[0]);
      front.src = clips[0];
      front.load();

      // Back: prime immediately so it loads at full speed.
      idx = 1;
      prime(back, clips[idx]);

      function doSwap() {
        front.loop = false;

        // back has been playing ahead silently — reset to frame 0.
        // Position 0 is always buffered, so the seek is instant.
        back.currentTime = 0;

        back.style.zIndex  = "1";
        back.style.opacity = "1";
        front.style.zIndex  = "0";
        front.style.opacity = "0";

        const tmp = front;
        front = back;
        back  = tmp;

        waitSince = 0;
        idx = (idx + 1) % clips.length;
        prime(back, clips[idx]); // load + play next clip at full speed
      }

      function tick() {
        // ── Phase 1: reveal front once its first frame is ready ──
        if (!started) {
          if (front.readyState >= 2) {
            front.style.opacity = "1";
            front.play().catch(() => {});
            started = true;
          }
          requestAnimationFrame(tick);
          return;
        }

        // ── Phase 2: watch for near-end and swap ─────────────────
        const dur     = front.duration;
        const finite  = dur > 0 && isFinite(dur);
        const timeLeft = finite ? dur - front.currentTime : Infinity;
        const nearEnd  = timeLeft <= 0.5 || front.ended;

        if (nearEnd) {
          if (back.readyState >= 2) {
            doSwap();
          } else {
            // Back not ready — loop front to keep the screen filled
            if (front.ended) {
              front.currentTime = 0;
              front.play().catch(() => {});
            }
            front.loop = true;

            // Safety valve: if a clip hasn't loaded in 5 s, skip it
            if (!waitSince) waitSince = Date.now();
            if (Date.now() - waitSince > 5000) {
              idx = (idx + 1) % clips.length;
              prime(back, clips[idx]);
              waitSince = Date.now();
            }
          }
        } else {
          waitSince = 0;
        }

        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);

      // Resume after tab is backgrounded
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
