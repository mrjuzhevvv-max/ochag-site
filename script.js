/* =========================================================
   Форма заявки
   ========================================================= */
(() => {
  const form = document.querySelector("#request-form");
  const message = document.querySelector("#form-message");

  if (!form || !message) return;

  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const name = form.elements.namedItem("name").value.trim();
    const phone = form.elements.namedItem("phone").value.trim();
    const details = form.elements.namedItem("details").value.trim();

    const consent = form.elements.namedItem("personalDataConsent");

    if (!consent || !consent.checked) {
      message.textContent = "Необходимо дать согласие на обработку персональных данных.";
      return;
    }

    if (!name || !phone || !details) {
      message.textContent = "Заполните все поля.";
      return;
    }

    message.textContent = "Отправляем заявку...";

    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          details,
          consent: consent.checked
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Ошибка отправки");
      }

      message.textContent = "Заявка успешно отправлена!";
      form.reset();

    } catch (error) {
      console.error("Ошибка отправки:", error);
      message.textContent = "Не удалось отправить заявку. Попробуйте ещё раз.";

    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
})();
/* =========================================================
   Универсальная карусель (отзывы и работы)
   ========================================================= */
function createCarousel({ track, slides, prev, next, dotsContainer, swipeArea, dotLabel }) {
  if (!track || !slides.length || !prev || !next || !dotsContainer || !swipeArea) return;

  let current = 0;

  const dots = Array.from(slides, (_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `${dotLabel} ${index + 1}`);
    dot.addEventListener("click", () => show(index));
    dotsContainer.appendChild(dot);
    return dot;
  });

  function show(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  prev.addEventListener("click", () => show(current - 1));
  next.addEventListener("click", () => show(current + 1));

  // Свайп на телефоне (учитываем только горизонтальные жесты)
  let startX = 0;
  let startY = 0;

  swipeArea.addEventListener("touchstart", (event) => {
    startX = event.changedTouches[0].clientX;
    startY = event.changedTouches[0].clientY;
  }, { passive: true });

  swipeArea.addEventListener("touchend", (event) => {
    const dx = startX - event.changedTouches[0].clientX;
    const dy = startY - event.changedTouches[0].clientY;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      show(current + (dx > 0 ? 1 : -1));
    }
  }, { passive: true });

  show(0);
}

// Карусель отзывов
createCarousel({
  track: document.querySelector(".reviews-track"),
  slides: document.querySelectorAll(".review-slide"),
  prev: document.querySelector(".reviews-arrow.prev"),
  next: document.querySelector(".reviews-arrow.next"),
  dotsContainer: document.querySelector(".reviews-dots"),
  swipeArea: document.querySelector(".reviews-window"),
  dotLabel: "Перейти к отзыву"
});

// Карусель наших работ
createCarousel({
  track: document.querySelector(".works-track"),
  slides: document.querySelectorAll(".work-slide"),
  prev: document.querySelector(".works-arrow.prev"),
  next: document.querySelector(".works-arrow.next"),
  dotsContainer: document.querySelector(".works-dots"),
  swipeArea: document.querySelector(".works-window"),
  dotLabel: "Перейти к работе"
});

/* =========================================================
   Смена фоновых изображений первого экрана
   ========================================================= */
(() => {
  const images = document.querySelectorAll(".hero-image");

  if (images.length < 2) return;

  let currentIndex = 0;

  setInterval(() => {
    images[currentIndex].classList.remove("active");

    currentIndex = (currentIndex + 1) % images.length;

    images[currentIndex].classList.add("active");
  }, 3000);
})();
/* =========================================================
   Анимация сварочных искр в заголовке работ
   ========================================================= */
(() => {
  const heading = document.querySelector("#works-heading");
  const canvas = heading?.querySelector(".welding-sparks");

  if (!heading || !canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducedMotion) {
    heading.classList.add("revealed");
    return;
  }

  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame = null;
  let started = false;
  let startTime = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createSpark() {
    const centerX = width / 2;
    const centerY = height / 2;

    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    const life = 25 + Math.random() * 35;

    return {
      x: centerX + (Math.random() - 0.5) * width * 0.65,
      y: centerY + (Math.random() - 0.5) * height * 0.5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      gravity: 0.12 + Math.random() * 0.12,
      life,
      maxLife: life,
      size: 1 + Math.random() * 2,
      color: Math.random() > 0.5 ? "#ffb347" : "#fff0c2"
    };
  }

  function drawSpark(spark) {
    const alpha = Math.max(0, spark.life / spark.maxLife);

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = spark.color;
    ctx.lineWidth = spark.size;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ff8a32";
    ctx.beginPath();
    ctx.moveTo(spark.x, spark.y);
    ctx.lineTo(
      spark.x - spark.vx * 2.5,
      spark.y - spark.vy * 2.5
    );
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;

    const elapsed = timestamp - startTime;

    ctx.clearRect(0, 0, width, height);

    if (elapsed < 1800 && Math.random() < 0.85) {
      for (let i = 0; i < 3; i++) {
        particles.push(createSpark());
      }
    }

    particles = particles.filter((spark) => spark.life > 0);

    particles.forEach((spark) => {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += spark.gravity;
      spark.vx *= 0.985;
      spark.life--;

      drawSpark(spark);
    });

    if (elapsed < 2600 || particles.length > 0) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, width, height);
      animationFrame = null;
    }
  }

  function startAnimation() {
    if (started) return;
    started = true;

    resizeCanvas();
    heading.classList.add("revealed");
    animationFrame = requestAnimationFrame(animate);
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      startAnimation();
      observer.disconnect();
    }
  }, { threshold: 0.35 });

  observer.observe(heading);

  window.addEventListener("resize", () => {
    if (started && animationFrame !== null) {
      resizeCanvas();
    }
  });
})();