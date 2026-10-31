
const form = document.querySelector("#request-form");
const message = document.querySelector("#form-message");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  const name = form.elements.name.value.trim();
  const phone = form.elements.phone.value.trim();
  const details = form.elements.details.value.trim();

  if (!name || !phone || !details) {
    message.textContent = "Заполните все поля.";
    return;
  }

  message.textContent = "Отправляем заявку...";

  try {
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        phone,
        details
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
    message.textContent =
      "Не удалось отправить заявку. Попробуйте ещё раз.";
  }
});
// Карусель отзывов
const reviewsTrack = document.querySelector(".reviews-track");
const reviewSlides = document.querySelectorAll(".review-slide");
const prevReviewButton = document.querySelector(".reviews-arrow.prev");
const nextReviewButton = document.querySelector(".reviews-arrow.next");
const reviewsDotsContainer = document.querySelector(".reviews-dots");

if (
  reviewsTrack &&
  reviewSlides.length &&
  prevReviewButton &&
  nextReviewButton &&
  reviewsDotsContainer
) {
  let currentReview = 0;
  const dots = [];

  reviewSlides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Перейти к отзыву ${index + 1}`);

    dot.addEventListener("click", () => showReview(index));

    reviewsDotsContainer.appendChild(dot);
    dots.push(dot);
  });

  function showReview(index) {
    currentReview = (index + reviewSlides.length) % reviewSlides.length;

    reviewsTrack.style.transform =
      `translateX(-${currentReview * 100}%)`;

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentReview);
    });
  }

  prevReviewButton.addEventListener("click", () => {
    showReview(currentReview - 1);
  });

  nextReviewButton.addEventListener("click", () => {
    showReview(currentReview + 1);
  });

  let touchStartX = 0;
  const reviewsWindow = document.querySelector(".reviews-window");

  reviewsWindow.addEventListener("touchstart", event => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  reviewsWindow.addEventListener("touchend", event => {
    const touchEndX = event.changedTouches[0].screenX;
    const difference = touchStartX - touchEndX;

    if (Math.abs(difference) > 50) {
      showReview(currentReview + (difference > 0 ? 1 : -1));
    }
  }, { passive: true });

  showReview(0);
}

// Карусель наших работ
const worksTrack = document.querySelector(".works-track");
const workSlides = document.querySelectorAll(".work-slide");
const prevWorksButton = document.querySelector(".works-arrow.prev");
const nextWorksButton = document.querySelector(".works-arrow.next");
const worksDotsContainer = document.querySelector(".works-dots");
const worksWindow = document.querySelector(".works-window");

if (
  worksTrack &&
  workSlides.length &&
  prevWorksButton &&
  nextWorksButton &&
  worksDotsContainer &&
  worksWindow
) {
  let currentWork = 0;
  const worksDots = [];

  workSlides.forEach((_, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.setAttribute("aria-label", `Перейти к работе ${index + 1}`);

    dot.addEventListener("click", () => showWork(index));

    worksDotsContainer.appendChild(dot);
    worksDots.push(dot);
  });

  function showWork(index) {
    currentWork = (index + workSlides.length) % workSlides.length;

    worksTrack.style.transform =
      `translateX(-${currentWork * 100}%)`;

    worksDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentWork);
    });
  }

  prevWorksButton.addEventListener("click", () => {
    showWork(currentWork - 1);
  });

  nextWorksButton.addEventListener("click", () => {
    showWork(currentWork + 1);
  });

  let worksTouchStartX = 0;

  worksWindow.addEventListener("touchstart", event => {
    worksTouchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  worksWindow.addEventListener("touchend", event => {
    const worksTouchEndX = event.changedTouches[0].screenX;
    const difference = worksTouchStartX - worksTouchEndX;

    if (Math.abs(difference) > 50) {
      showWork(currentWork + (difference > 0 ? 1 : -1));
    }
  }, { passive: true });

  showWork(0);
}
