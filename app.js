(function () {
  // ── Hero montage (shuffled on each load) ──────────
  const heroVideo = document.querySelector(".hero-montage");
  if (heroVideo) {
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
    // Fisher-Yates shuffle — new order every refresh
    for (let i = clips.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clips[i], clips[j]] = [clips[j], clips[i]];
    }
    let idx = 0;
    heroVideo.loop = false;

    // Hidden buffer element pre-fetches the next clip while current plays
    const buf = document.createElement("video");
    buf.muted = true;
    buf.preload = "auto";
    buf.style.cssText = "position:absolute;width:0;height:0;opacity:0;pointer-events:none";
    document.body.appendChild(buf);

    function playClip() {
      const src = clips[idx];
      heroVideo.style.objectFit = src.includes("try-again") ? "contain" : "cover";
      heroVideo.src = src;
      heroVideo.play().catch(() => {});
      idx = (idx + 1) % clips.length;
      buf.src = clips[idx]; // preload next clip into browser cache
      buf.load();
    }

    heroVideo.addEventListener("ended", playClip);
    heroVideo.addEventListener("error", () => {
      idx = (idx + 1) % clips.length;
      playClip();
    });
    playClip();
  }

  const revealItems = document.querySelectorAll(".reveal");
  const videos = document.querySelectorAll("video");
  const cursor = document.querySelector(".cursor-logo");
  const footerWordmark = document.querySelector(".footer-wordmark span");

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.10 });

  revealItems.forEach((item) => revealObserver.observe(item));

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.25 });

  videos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    video.style.pointerEvents = "none";
    videoObserver.observe(video);
  });

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

  if (cursor && window.matchMedia("(pointer:fine)").matches) {
    let visible = false;
    const interactive = document.querySelectorAll("a, button, .project-tile");

    window.addEventListener("mousemove", (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      if (!visible) {
        cursor.style.opacity = "1";
        visible = true;
      }
    });

    window.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
      visible = false;
    });

    interactive.forEach((node) => {
      node.addEventListener("mouseenter", () => {
        cursor.style.transform = "translate(-50%, -50%) scale(1.18)";
      });
      node.addEventListener("mouseleave", () => {
        cursor.style.transform = "translate(-50%, -50%) scale(1)";
      });
    });

    window.addEventListener("click", () => {
      cursor.classList.remove("is-burst");
      void cursor.offsetWidth;
      cursor.classList.add("is-burst");
    });
  }
})();
