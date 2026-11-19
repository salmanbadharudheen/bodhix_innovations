const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const siteHeader = document.querySelector(".site-header");

if (siteHeader) {
  const updateHeaderVisibility = () => {
    const isVisible = window.scrollY > 24;
    siteHeader.classList.toggle("is-visible", isVisible);

    if (!isVisible && menuButton && navigation) {
      menuButton.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    }
  };

  window.addEventListener("scroll", updateHeaderVisibility, { passive: true });
  updateHeaderVisibility();
}

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

const parallaxSections = Array.from(document.querySelectorAll(".service-page [data-parallax-section]"));
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if (parallaxSections.length && !reducedMotionPreference.matches) {
  let parallaxFrame;

  const updateServiceParallax = () => {
    parallaxFrame = undefined;
    const viewportCenter = window.innerHeight / 2;

    parallaxSections.forEach((section) => {
      const bounds = section.getBoundingClientRect();
      if (bounds.bottom < -150 || bounds.top > window.innerHeight + 150) return;

      const sectionCenter = bounds.top + bounds.height / 2;
      const progress = Math.max(-1, Math.min(1, (viewportCenter - sectionCenter) / (window.innerHeight + bounds.height)));
      section.querySelectorAll("[data-parallax-layer]").forEach((layer) => {
        const speed = Number(layer.dataset.parallaxLayer);
        layer.style.setProperty("--parallax-y", `${progress * (Number.isFinite(speed) ? speed : .12) * 100}px`);
      });
    });
  };

  const requestServiceParallax = () => {
    if (!parallaxFrame) {
      parallaxFrame = window.requestAnimationFrame(updateServiceParallax);
    }
  };

  window.addEventListener("scroll", requestServiceParallax, { passive: true });
  window.addEventListener("resize", requestServiceParallax);
  updateServiceParallax();
}

const experienceSection = document.querySelector("[data-experience-section]");

if (experienceSection) {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const experienceVisual = experienceSection.querySelector("[data-experience-visual]");

  if (motionPreference.matches || !("IntersectionObserver" in window)) {
    experienceSection.classList.add("is-visible");
  } else {
    experienceSection.classList.add("has-motion");
    const revealObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        experienceSection.classList.add("is-visible");
        revealObserver.disconnect();
      }
    }, { threshold: 0.2 });
    revealObserver.observe(experienceSection);
  }

  if (experienceVisual && !motionPreference.matches && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    experienceSection.addEventListener("pointermove", (event) => {
      const bounds = experienceSection.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
      const y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
      experienceVisual.style.setProperty("--pointer-x", `${x * 18}px`);
      experienceVisual.style.setProperty("--pointer-y", `${y * 18}px`);
    });
    experienceSection.addEventListener("pointerleave", () => {
      experienceVisual.style.setProperty("--pointer-x", "0px");
      experienceVisual.style.setProperty("--pointer-y", "0px");
    });
  }

  if (!motionPreference.matches) {
    let parallaxFrame;

    const updateExperienceParallax = () => {
      parallaxFrame = undefined;
      const bounds = experienceSection.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const sectionCenter = bounds.top + bounds.height / 2;
      const progress = Math.max(-1, Math.min(1, (viewportCenter - sectionCenter) / (window.innerHeight + bounds.height)));

      experienceSection.style.setProperty("--scroll-wash-one", `${progress * -110}px`);
      experienceSection.style.setProperty("--scroll-wash-two", `${progress * 75}px`);
      experienceSection.style.setProperty("--scroll-ring", `${progress * 55}px`);
      experienceSection.style.setProperty("--scroll-heading", `${progress * -18}px`);
      experienceSection.style.setProperty("--scroll-visual", `${progress * -45}px`);
      experienceSection.style.setProperty("--scroll-word-left", `${progress * 65}px`);
      experienceSection.style.setProperty("--scroll-word-right", `${progress * -75}px`);
      experienceSection.style.setProperty("--scroll-rotate", `${progress * 8}deg`);
    };

    const requestExperienceParallax = () => {
      if (!parallaxFrame) {
        parallaxFrame = window.requestAnimationFrame(updateExperienceParallax);
      }
    };

    window.addEventListener("scroll", requestExperienceParallax, { passive: true });
    window.addEventListener("resize", requestExperienceParallax);
    updateExperienceParallax();
  }
}

const neuralCanvas = document.querySelector("[data-neural-background]");

if (neuralCanvas) {
  const neuralSlide = neuralCanvas.closest(".hero__slide");
  const context = neuralCanvas.getContext("2d", { alpha: true });

  if (neuralSlide && context) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let particles = [];
    let width = 0;
    let height = 0;
    let frame;
    let isInView = true;
    let lastTime = 0;
    let elapsed = 0;
    const connectionPaths = Array.from({ length: 8 }, () => []);

    const makeParticles = () => {
      const isSmallScreen = window.matchMedia("(max-width: 640px)").matches;
      const count = Math.max(isSmallScreen ? 20 : 30, Math.min(isSmallScreen ? 30 : 56, Math.round(width * height / (isSmallScreen ? 29000 : 28000))));

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        depth: .18 + Math.random() * .82,
        radius: .8 + Math.random() * 1.45,
        vx: (Math.random() - .5) * 13,
        vy: (Math.random() - .5) * 9,
        hue: Math.random() > .52 ? 192 : 258,
        renderX: 0,
        renderY: 0,
      }));
    };

    const resizeCanvas = () => {
      const bounds = neuralCanvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1);
      width = bounds.width;
      height = bounds.height;
      neuralCanvas.width = Math.round(width * pixelRatio);
      neuralCanvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      makeParticles();
      drawFrame(0, false);
    };

    const drawFrame = (time, animate) => {
      if (!width || !height) return;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0;
      lastTime = time;
      if (animate) elapsed += delta;
      context.clearRect(0, 0, width, height);

      const pointerX = pointer.x * 17;
      const pointerY = pointer.y * 17;
      const beamX = width * (.63 + Math.sin(elapsed * .12) * .17 + pointer.x * .012);
      const beamY = height * (.34 + Math.cos(elapsed * .1) * .1 + pointer.y * .012);
      const atmosphere = context.createRadialGradient(beamX, beamY, 0, beamX, beamY, Math.max(width, height) * .72);
      atmosphere.addColorStop(0, "rgba(45, 99, 190, .12)");
      atmosphere.addColorStop(.38, "rgba(94, 51, 166, .055)");
      atmosphere.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = atmosphere;
      context.fillRect(0, 0, width, height);

      context.save();
      context.globalCompositeOperation = "lighter";
      const waveCount = 4;
      for (let wave = 0; wave < waveCount; wave += 1) {
        const baseY = height * (.28 + wave * .16);
        const amplitude = height * (.035 + wave * .008);
        const phase = elapsed * (.3 + wave * .035) + wave * 1.7 + pointerX * .001;
        const gradient = context.createLinearGradient(0, baseY - amplitude, width, baseY + amplitude);
        gradient.addColorStop(0, "rgba(66, 212, 255, 0)");
        gradient.addColorStop(.34, `rgba(73, 171, 255, ${.06 + wave * .008})`);
        gradient.addColorStop(.68, `rgba(154, 91, 255, ${.055 + wave * .006})`);
        gradient.addColorStop(1, "rgba(91, 221, 255, 0)");
        context.beginPath();
        for (let x = 0; x <= width + 24; x += 24) {
          const progress = x / Math.max(width, 1);
          const y = baseY
            + Math.sin(progress * Math.PI * 2.2 + phase) * amplitude
            + Math.sin(progress * Math.PI * 5.1 - phase * .72) * amplitude * .32
            + pointerY * (progress - .5) * .2;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = gradient;
        context.lineWidth = wave === 1 ? 1.25 : .8;
        context.shadowColor = wave % 2 ? "rgba(119, 87, 255, .36)" : "rgba(53, 201, 255, .34)";
        context.shadowBlur = 0;
        context.stroke();
      }

      context.shadowBlur = 0;
      context.globalCompositeOperation = "source-over";
      connectionPaths.forEach((path) => { path.length = 0; });

      for (let first = 0; first < particles.length; first += 1) {
        const particle = particles[first];
        if (animate) {
          particle.x += particle.vx * particle.depth * delta;
          particle.y += particle.vy * particle.depth * delta;
          if (particle.x < -12) particle.x = width + 12;
          if (particle.x > width + 12) particle.x = -12;
          if (particle.y < -12) particle.y = height + 12;
          if (particle.y > height + 12) particle.y = -12;
        }

        particle.renderX = particle.x + pointerX * particle.depth;
        particle.renderY = particle.y + pointerY * particle.depth;
      }

      for (let first = 0; first < particles.length; first += 1) {
        const particle = particles[first];
        const x = particle.renderX;
        const y = particle.renderY;

        for (let second = first + 1; second < particles.length; second += 1) {
          const neighbor = particles[second];
          const dx = x - neighbor.renderX;
          const dy = y - neighbor.renderY;
          const maxDistance = 112 + (particle.depth + neighbor.depth) * 43;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < maxDistance * maxDistance) {
            const distance = Math.sqrt(distanceSquared);
            const strength = (1 - distance / maxDistance) * Math.min(particle.depth, neighbor.depth) * .28;
            const alphaBand = Math.min(3, Math.floor(strength / .07));
            const colorBand = particle.hue > 220 ? 4 : 0;
            connectionPaths[colorBand + alphaBand].push(x, y, neighbor.renderX, neighbor.renderY);
          }
        }
      }

      context.lineWidth = .8;
      for (let group = 0; group < connectionPaths.length; group += 1) {
        const path = connectionPaths[group];
        if (!path.length) continue;
        context.beginPath();
        for (let index = 0; index < path.length; index += 4) {
          context.moveTo(path[index], path[index + 1]);
          context.lineTo(path[index + 2], path[index + 3]);
        }
        context.strokeStyle = group >= 4 ? "rgb(157, 121, 255)" : "rgb(75, 204, 255)";
        context.globalAlpha = .07 + (group % 4) * .055;
        context.stroke();
      }

      context.globalAlpha = 1;
      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        const x = particle.renderX;
        const y = particle.renderY;
        const pulse = animate ? .78 + Math.sin(elapsed * 1.3 + index) * .22 : .8;
        const radius = particle.radius * (.45 + particle.depth * .72);
        context.beginPath();
        context.arc(x, y, radius * 2.8, 0, Math.PI * 2);
        context.fillStyle = `hsla(${particle.hue}, 100%, 68%, ${(.045 + particle.depth * .08) * pulse})`;
        context.fill();
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = `hsla(${particle.hue}, 100%, 86%, ${(.34 + particle.depth * .52) * pulse})`;
        context.fill();
      }
      context.restore();

      if (animate) {
        pointer.x += (pointer.targetX - pointer.x) * .035;
        pointer.y += (pointer.targetY - pointer.y) * .035;
      } else {
        pointer.x = 0;
        pointer.y = 0;
      }
    };

    const stopAnimation = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = undefined;
      lastTime = 0;
    };

    const animate = (time) => {
      frame = undefined;
      if (document.hidden || !isInView || !neuralSlide.classList.contains("is-active") || reducedMotion.matches) return;
      drawFrame(time, true);
      frame = window.requestAnimationFrame(animate);
    };

    const updateAnimation = () => {
      stopAnimation();
      if (document.hidden || !isInView || !neuralSlide.classList.contains("is-active")) return;
      if (reducedMotion.matches) {
        drawFrame(0, false);
        return;
      }
      frame = window.requestAnimationFrame(animate);
    };

    const neuralMedia = neuralCanvas.closest(".hero__media");

    neuralMedia.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      const bounds = neuralMedia.getBoundingClientRect();
      pointer.targetX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      pointer.targetY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    }, { passive: true });
    neuralMedia.addEventListener("pointerleave", () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    });

    if ("ResizeObserver" in window) {
      new ResizeObserver(resizeCanvas).observe(neuralCanvas);
    } else {
      window.addEventListener("resize", resizeCanvas, { passive: true });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        isInView = entries.some((entry) => entry.isIntersecting);
        updateAnimation();
      }).observe(neuralCanvas);
    }

    new MutationObserver(updateAnimation).observe(neuralSlide, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", updateAnimation);
    reducedMotion.addEventListener("change", updateAnimation);
    resizeCanvas();
    updateAnimation();
  }
}

const heroCarousel = document.querySelector("[data-hero-carousel]");

if (heroCarousel) {
  const slides = Array.from(heroCarousel.querySelectorAll(".hero__slide"));
  const previousButton = heroCarousel.querySelector("[data-carousel-prev]");
  const pauseButton = heroCarousel.querySelector("[data-carousel-pause]");
  const nextButton = heroCarousel.querySelector("[data-carousel-next]");
  const introVideo = heroCarousel.querySelector(".hero__slide--intro .hero__video");
  const currentCount = heroCarousel.querySelector("[data-slide-current]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  let autoAdvanceTimer;
  let userPaused = false;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.inert = !isActive;
      const video = slide.querySelector("video");
      if (!isActive && video && !video.paused) {
        video.pause();
      }
    });

    if (currentCount) {
      currentCount.textContent = String(activeIndex + 1).padStart(2, "0");
    }
  };

  const stopAutoAdvance = () => {
    window.clearInterval(autoAdvanceTimer);
    autoAdvanceTimer = undefined;
  };

  const startAutoAdvance = () => {
    stopAutoAdvance();
    if (userPaused || reducedMotion.matches || document.hidden || (introVideo && !introVideo.paused && !introVideo.ended) || heroCarousel.matches(":hover") || heroCarousel.contains(document.activeElement)) {
      return;
    }
    autoAdvanceTimer = window.setInterval(() => showSlide(activeIndex + 1), 6000);
  };

  if (slides.length > 1 && previousButton && nextButton) {
    previousButton.addEventListener("click", () => showSlide(activeIndex - 1));
    nextButton.addEventListener("click", () => showSlide(activeIndex + 1));
    if (pauseButton) {
      pauseButton.addEventListener("click", () => {
        userPaused = !userPaused;
        pauseButton.setAttribute("aria-pressed", String(userPaused));
        pauseButton.setAttribute(
          "aria-label",
          userPaused ? "Resume automatic slide rotation" : "Pause automatic slide rotation",
        );
        pauseButton.textContent = userPaused ? "▶" : "Ⅱ";
        if (userPaused) {
          stopAutoAdvance();
        } else {
          startAutoAdvance();
        }
      });
    }
    if (introVideo) {
      introVideo.addEventListener("play", stopAutoAdvance);
      introVideo.addEventListener("pause", startAutoAdvance);
      introVideo.addEventListener("ended", startAutoAdvance);
    }
    heroCarousel.addEventListener("mouseenter", stopAutoAdvance);
    heroCarousel.addEventListener("mouseleave", startAutoAdvance);
    heroCarousel.addEventListener("focusin", stopAutoAdvance);
    heroCarousel.addEventListener("focusout", (event) => {
      if (!heroCarousel.contains(event.relatedTarget)) {
        startAutoAdvance();
      }
    });
    document.addEventListener("visibilitychange", startAutoAdvance);
    reducedMotion.addEventListener("change", startAutoAdvance);
    startAutoAdvance();
  }
}
