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
      // ── Mobile: single video ────────────────────────
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
      // Key rules that prevent black screens:
      //
      //  1. Transition fires 0.4 s BEFORE the clip ends via timeupdate,
      //     so any black trailing frames in the source video are already
      //     covered by the incoming clip before they're ever visible.
      //
      //  2. The old clip (nb) stays at opacity:1 during the entire
      //     crossfade — the dark hero background never bleeds through.
      //
      //  3. loadBack() (which resets back.src) is only called 250 ms
      //     AFTER doSwap, once the new clip fully covers the old one.
      //
      let front = vA, back = vB;

      function loadBack(src) {
        applyFit(back, src);
        back.src = src;
        back.load();
      }

      // watchEnd: monitors the current front video and triggers advance()
      // 0.4 s before it ends. 'ended' is a safety fallback.
      function watchEnd() {
        const target = front; // snapshot — survives future front/back swaps
        let fired = false;

        function go() {
          if (fired) return;
          fired = true;
          target.removeEventListener("timeupdate", onTime);
          target.removeEventListener("ended", go);
          advance();
        }

        function onTime() {
          if (target.duration && target.currentTime >= target.duration - 0.4) go();
        }

        function onError() {
          if (fired) return;
          fired = true;
          target.removeEventListener("timeupdate", onTime);
          target.removeEventListener("ended", go);
          idx = (idx + 1) % clips.length;
          advance();
        }

        target.addEventListener("timeupdate", onTime);
        target.addEventListener("ended", go, { once: true });
        target.addEventListener("error", onError, { once: true });
      }

      function advance() {
        const nf = back, nb = front;
        let done = false;

        function doSwap() {
          if (done) return;
          done = true;

          // nf fades in ON TOP of nb (nb stays opacity:1 as the background)
          nf.style.zIndex = "1";
          nb.style.zIndex = "0";
          requestAnimationFrame(() => { nf.style.opacity = "1"; });

          front = nf;
          back  = nb;
          watchEnd(); // arm listener for new front

          // Only after nf fully covers nb: hide nb and load next clip into it
          setTimeout(() => {
            nb.style.opacity = "0";
            idx = (idx + 1) % clips.length;
            loadBack(clips[idx]);
          }, 250);
        }

        nf.play().catch(() => {});
        if (nf.readyState >= 2) {
          doSwap();
        } else {
          nf.addEventListener("canplay", doSwap, { once: true });
          setTimeout(doSwap, 800);
        }
      }

      // Resume playback if tab was backgrounded
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) front.play().catch(() => {});
      });

      // Init
      applyFit(vA, clips[0]);
      vA.src = clips[0];
      vA.style.zIndex  = "1";
      vA.style.opacity = "1";
      vB.style.zIndex  = "0";
      vB.style.opacity = "0";
      vA.play().catch(() => {});
      idx = 1;
      loadBack(clips[1]);
      front = vA;
      back  = vB;
      watchEnd();
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
      else { e.target.pause(); }
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
