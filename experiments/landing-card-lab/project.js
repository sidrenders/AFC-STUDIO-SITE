(function () {
  const projects = {
    benq: {
      title: "BenQ",
      kicker: "Launch video",
      summary: "Product-forward motion built around clarity, light control, and a clean technical finish.",
      link: "https://benqi.fi/",
      linkLabel: "benqi.fi",
      src: "/videos/motion/benq-web.mp4",
      poster: "./media/benq.jpg"
    },
    wise: {
      title: "Wise",
      kicker: "3D and 2D motion graphics",
      summary: "A sharper web master from the HQ source, tuned to keep motion rich while staying fast on the page.",
      link: null,
      src: "/videos/motion/a-wise-web.mp4",
      poster: "./media/wise.jpg"
    },
    river: {
      title: "River",
      kicker: "Launch video",
      summary: "A cinematic piece shaped around pacing, atmosphere, and controlled visual escalation.",
      link: "https://river.inc/",
      linkLabel: "river.inc",
      src: "/videos/motion/river-web.mp4",
      poster: "./media/river.jpg"
    },
    spectra: {
      title: "Spectra",
      kicker: "Launch video",
      summary: "Launch motion designed to feel sharp, financial, and high-signal without losing momentum.",
      link: "https://www.spectra.finance/",
      linkLabel: "spectra.finance",
      src: "/videos/motion/spectra-teaser.mp4",
      poster: "./media/spectra.jpg"
    },
    "moon-discovery": {
      title: "The Discovery on the Moon That Nobody Prepared Us For",
      kicker: "Explainer",
      summary: "An explainer-led cinematic piece built on scale, suspense, and narrative clarity.",
      link: "https://youtu.be/piQSi6bn_Gk?si=8MLBE8vbWiKZD4vZ&t=27",
      linkLabel: "Watch on YouTube",
      src: "/videos/3D/moon-discovery.mp4",
      poster: "./media/moon.jpg"
    },
    reentry: {
      title: "Reentry to the Evacuation Day",
      kicker: "Explainer",
      summary: "Story-led motion work balancing pacing, information density, and visual tension.",
      link: null,
      src: "/videos/3D/reentry-evacuation.mp4",
      poster: "./media/reentry.jpg"
    },
    lucid: {
      title: "Lucid",
      kicker: "Launch video",
      summary: "Launch visuals built around clean product framing and a confident studio finish.",
      link: "https://lucidlabs.fi/",
      linkLabel: "lucidlabs.fi",
      src: "/videos/motion/lucid-web.mp4",
      poster: "./media/lucid.jpg"
    },
    "bin-laden": {
      title: "How America Found Bin Laden",
      kicker: "Storytelling video",
      summary: "A story-driven piece built for tension, clarity, and a highly controlled visual rhythm.",
      link: "https://youtu.be/Oi-J0ArLZy8?si=PBBVSPojaFGiGlr-",
      linkLabel: "Watch on YouTube",
      src: "/videos/3D/bin-laden.mp4",
      poster: "./media/binladen.jpg"
    }
  };

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug") || "benq";
  const project = projects[slug] || projects.benq;

  const title = document.getElementById("project-title");
  const kicker = document.getElementById("project-kicker");
  const sourceLink = document.getElementById("project-source-link");
  const video = document.getElementById("project-video");
  const cursor = document.querySelector(".cursor-logo");
  const footerWordmark = document.querySelector(".footer-wordmark span");

  document.title = `${project.title} - Aftercells Prototype`;
  title.textContent = project.title;
  kicker.textContent = project.kicker;
  if (project.link) {
    sourceLink.href = project.link;
    sourceLink.textContent = project.linkLabel;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener";
  } else {
    sourceLink.style.display = "none";
  }
  video.src = project.src;
  video.poster = project.poster;

  function fitWordmark() {
    if (!footerWordmark) return;
    const parent = footerWordmark.parentElement;
    if (!parent) return;
    const available = parent.clientWidth * 0.995;
    let size = Math.min(window.innerWidth * 0.38, 620);
    footerWordmark.style.fontSize = `${size}px`;

    while (footerWordmark.scrollWidth > available && size > 40) {
      size -= 4;
      footerWordmark.style.fontSize = `${size}px`;
    }
  }

  fitWordmark();
  window.addEventListener("resize", fitWordmark);

  video.play().catch(() => {});

  if (cursor && window.matchMedia("(pointer:fine)").matches) {
    let visible = false;
    const interactive = document.querySelectorAll("a, button");

    window.addEventListener("mousemove", (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
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
        cursor.style.transform = "translate(-50%, -50%) scale(1)";
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
