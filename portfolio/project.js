(function () {
  const PROJECTS = {
    "the-ball": {
      number: "001",
      title: "The Ball",
      tag: "Motion Design Reel",
      summary: "A focused motion design reel presented as a standalone project page.",
      media: {
        type: "vimeo",
        src: "https://player.vimeo.com/video/1168540088?background=1&autoplay=1&loop=1&muted=1&quality=1080p&title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=122963"
      }
    },
    "benq": {
      number: "002",
      title: "BenQ",
      tag: "Brand / Commercial",
      summary: "Commercial and product-focused motion work built for a crisp launch presentation.",
      link: { href: "https://benqi.fi/", label: "benqi.fi" },
      media: { type: "video", src: "/videos/motion/benq-web.mp4" }
    },
    "a-wise": {
      number: "003",
      title: "A Wise",
      tag: "Motion Design",
      summary: "A motion-driven piece delivered from a new 1080p web master to keep playback sharp while cutting the original 4K file size down dramatically.",
      media: { type: "video", src: "/videos/motion/a-wise-web.mp4" }
    },
    "spectra": {
      number: "004",
      title: "Spectra",
      tag: "Launch Video",
      summary: "Launch visuals designed to feel sharp, financial, and high-signal without losing motion energy.",
      link: { href: "https://www.spectra.finance/", label: "spectra.finance" },
      media: { type: "video", src: "/videos/motion/spectra-teaser.mp4" }
    },
    "lucid": {
      number: "005",
      title: "Lucid",
      tag: "Launch Video",
      summary: "Launch motion shaped for a product-first narrative with a clean technical finish.",
      link: { href: "https://lucidlabs.fi/", label: "lucidlabs.fi" },
      media: { type: "video", src: "/videos/motion/lucid-web.mp4" }
    },
    "river": {
      number: "006",
      title: "River",
      tag: "Launch Video",
      summary: "A launch piece built around controlled pacing, strong framing, and product-forward motion beats.",
      link: { href: "https://river.inc/", label: "river.inc" },
      media: { type: "video", src: "/videos/motion/river-web.mp4", seamlessLoop: 0.12 }
    },
    "moon-discovery": {
      number: "007",
      title: "The Discovery on the Moon That Nobody Prepared Us For",
      tag: "Explainer",
      summary: "An explainer-led cinematic piece that leans on scale, suspense, and narrative clarity.",
      link: { href: "https://youtu.be/piQSi6bn_Gk?si=8MLBE8vbWiKZD4vZ&t=27", label: "Watch on YouTube" },
      media: { type: "video", src: "/videos/3D/moon-discovery.mp4" }
    },
    "reentry": {
      number: "008",
      title: "Reentry to the evacuation day",
      tag: "3D Animation",
      summary: "A 3D-driven piece built around atmosphere, impact, and cinematic movement.",
      media: { type: "video", src: "/videos/3D/reentry-evacuation.mp4" }
    },
    "bin-laden": {
      number: "009",
      title: "How America Found Bin Laden",
      tag: "Storytelling",
      summary: "Story-led motion work balancing pacing, information density, and visual tension.",
      link: { href: "https://youtu.be/Oi-J0ArLZy8?si=PBBVSPojaFGiGlr-", label: "Watch on YouTube" },
      media: { type: "video", src: "/videos/3D/bin-laden.mp4" }
    }
  };

  const projectKey = document.documentElement.dataset.project;
  const project = PROJECTS[projectKey];
  if (!project) return;

  const themeKey = "aftercells-theme";
  const html = document.documentElement;
  const btnTheme = document.getElementById("btn-theme");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const pageDate = document.getElementById("page-date");
  const title = document.getElementById("project-title");
  const tag = document.getElementById("project-tag");
  const kicker = document.getElementById("project-kicker");
  const summary = document.getElementById("project-summary");
  const primaryLink = document.getElementById("project-link");
  const mediaHost = document.getElementById("project-media");
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');

  function syncTheme(theme) {
    html.setAttribute("data-theme", theme);
    btnTheme.textContent = theme === "dark" ? "Light" : "Dark";
    themeColor.setAttribute("content", theme === "dark" ? "#070707" : "#efece5");
  }

  const savedTheme = localStorage.getItem(themeKey) || "dark";
  syncTheme(savedTheme);
  btnTheme.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem(themeKey, next);
    syncTheme(next);
  });

  const summaryText = project.summary || "Selected portfolio project from Aftercells Studio.";
  document.title = `${project.title} - Aftercells Studio`;
  if (descriptionMeta) descriptionMeta.setAttribute("content", summaryText);
  if (ogTitle) ogTitle.setAttribute("content", `${project.title} - Aftercells Studio`);
  if (ogDescription) ogDescription.setAttribute("content", summaryText);
  if (twitterTitle) twitterTitle.setAttribute("content", `${project.title} - Aftercells Studio`);
  if (twitterDescription) twitterDescription.setAttribute("content", summaryText);

  title.textContent = project.title;
  tag.textContent = `// ${project.tag}`;
  kicker.textContent = `Project ${project.number}`;
  summary.textContent = summaryText;

  if (project.link) {
    primaryLink.href = project.link.href;
    primaryLink.textContent = `${project.link.label} ->`;
    primaryLink.hidden = false;
  } else {
    primaryLink.hidden = true;
  }

  const stage = document.createElement("div");
  stage.className = "media-stage";
  const stageInner = document.createElement("div");
  stageInner.className = "media-stage-inner";

  if (project.media.type === "vimeo") {
    stage.classList.add("media-stage--vimeo");
    stageInner.innerHTML =
      `<iframe src="${project.media.src}" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerpolicy="strict-origin-when-cross-origin" title="${project.title}" loading="eager" allowfullscreen></iframe>`;
  } else {
    const video = document.createElement("video");
    video.src = project.media.src;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "metadata";
    stageInner.appendChild(video);
    addSoundBar(stage, video);
    enableSeamlessLoop(video, project.media.seamlessLoop || 0);
    video.play().catch(() => {});
  }

  stage.appendChild(stageInner);
  mediaHost.appendChild(stage);

  const now = new Date();
  pageDate.textContent = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(now);

  document.addEventListener("visibilitychange", () => {
    const video = mediaHost.querySelector("video");
    if (!video) return;
    if (document.hidden) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  });

  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");
  let mx = -200, my = -200, rx = -200, ry = -200;
  document.addEventListener("mousemove", event => { mx = event.clientX; my = event.clientY; });
  (function tick() {
    if (cursor && ring) {
      cursor.style.left = `${mx}px`;
      cursor.style.top = `${my}px`;
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
    }
    requestAnimationFrame(tick);
  })();

  function enableSeamlessLoop(video, loopBuffer) {
    if (!loopBuffer) return;
    let seeking = false;
    video.addEventListener("timeupdate", () => {
      if (seeking || !video.duration || Number.isNaN(video.duration)) return;
      if (video.currentTime >= video.duration - loopBuffer) {
        seeking = true;
        video.currentTime = 0.03;
        video.play().catch(() => {}).finally(() => { seeking = false; });
      }
    });
  }

  function addSoundBar(host, video) {
    const bar = document.createElement("div");
    bar.className = "sound-bar";
    const btn = document.createElement("button");
    btn.className = "sound-btn";
    btn.type = "button";
    btn.textContent = "Unmute";
    const slider = document.createElement("input");
    slider.className = "sound-slider";
    slider.type = "range";
    slider.min = 0;
    slider.max = 100;
    slider.value = 0;

    function updateTrack() {
      const pct = `${slider.value}%`;
      slider.style.background =
        `linear-gradient(to right, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.92) ${pct}, rgba(255,255,255,0.22) ${pct})`;
    }

    btn.addEventListener("click", () => {
      const shouldMute = !video.muted;
      video.muted = shouldMute;
      video.volume = shouldMute ? 0 : (slider.value > 0 ? slider.value / 100 : 0.7);
      slider.value = shouldMute ? 0 : Math.round(video.volume * 100);
      btn.textContent = shouldMute ? "Unmute" : "Mute";
      updateTrack();
    });

    slider.addEventListener("input", () => {
      const volume = slider.value / 100;
      video.volume = volume;
      video.muted = volume === 0;
      btn.textContent = volume === 0 ? "Unmute" : "Mute";
      updateTrack();
    });

    updateTrack();
    bar.appendChild(btn);
    bar.appendChild(slider);
    host.appendChild(bar);
  }
})();
