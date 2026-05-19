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
      // THE RULE: never make back visible until it fires canplay.
      // If back isn't ready when front ends, loop front silently
      // until back fires canplay, then hard-cut instantly.
      // This makes black screens structurally impossible.
      //
      let front = vA, back = vB;
      front.style.zIndex = "1";
      back.style.zIndex  = "0";

      function loadInto(v, src) {
        applyFit(v, src);
        v.src = src;
        v.load();
      }

      // Prime the buffers
      loadInto(front, clips[0]);
      idx = 1;
      loadInto(back, clips[idx]);

      // Don't show front until its first frame is decoded
      front.addEventListener("canplay", function() {
        front.style.opacity = "1";
        front.play().catch(() => {});
        startWatcher();
      }, { once: true });

      function startWatcher() {
        const myFront = front;
        const myBack  = back;
        let nearEndFired = false;

        // ── Called once when front is about to finish ──
        function onNearEnd() {
          if (nearEndFired) return;
          nearEndFired = true;
          myFront.removeEventListener("timeupdate", onTime);

          if (myBack.readyState >= 2) {
            // Back has at least one decoded frame — cut now
            doSwap();
          } else {
            // Back isn't ready yet: loop front so we never go black,
            // then cut the instant back fires canplay.
            myFront.loop = true;
            myBack.addEventListener("canplay", doSwap, { once: true });
          }
        }

        // ── The actual hard cut ────────────────────────
        function doSwap() {
          myFront.loop = false;

          myBack.play().catch(() => {});
          myBack.style.zIndex  = "1";
          myBack.style.opacity = "1";
          myFront.style.zIndex  = "0";
          myFront.style.opacity = "0";

          front = myBack;
          back  = myFront;

          // Load the clip after this one into the now-hidden old front
          idx = (idx + 1) % clips.length;
          loadInto(back, clips[idx]);

          // Arm the watcher for the new front
          startWatcher();
        }

        function onTime() {
          // Trigger 0.5 s early to hide any black tail frames in the source file
          const cutAt = myFront.duration - 0.5;
          if (cutAt > 0 && myFront.currentTime >= cutAt) onNearEnd();
        }

        myFront.addEventListener("timeupdate", onTime);
        myFront.addEventListener("ended", onNearEnd, { once: true });
        myFront.addEventListener("error", onNearEnd, { once: true });
      }

      // Resume after tab backgrounding
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
