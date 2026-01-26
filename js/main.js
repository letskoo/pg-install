// carrot landing - v1

function scrollToApply() {
  const target = document.querySelector("#apply");
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  console.log("[carrot] CTA clicked -> scroll to #apply");
}

function bindCTAs() {
  const top = document.querySelector("#ctaTop");
  const bottom = document.querySelector("#ctaBottom");

  if (top) top.addEventListener("click", scrollToApply);
  if (bottom) bottom.addEventListener("click", scrollToApply);
}

function bindBackButton() {
  const back = document.querySelector(".back-btn");
  if (!back) return;

  back.addEventListener("click", () => {
    console.log("[carrot] back clicked");
    history.back();
  });
}

/**
 * 히어로 슬라이더 초기화
 * 전제:
 * - index.html에 아래 요소들이 있어야 함
 *   #heroSlides .slide (여러개)
 *   #heroDots (도트 컨테이너)
 *   #heroPrev, #heroNext (이전/다음 버튼)
 *   #heroCounter (우측 하단 카운터: "1 / N")
 */
function initHeroSlider() {
  const slidesWrap = document.getElementById("heroSlides");
  const slides = slidesWrap ? Array.from(slidesWrap.querySelectorAll(".slide")) : [];

  const dotsWrap = document.getElementById("heroDots");
  const prevBtn = document.getElementById("heroPrev");
  const nextBtn = document.getElementById("heroNext");
  const counter = document.getElementById("heroCounter");

  if (!slides.length) {
    console.warn("[carrot] hero slider: no slides found (#heroSlides .slide)");
    return;
  }

  let idx = 0;
  let timer = null;
  const AUTOPLAY_MS = 4500;

  // 도트 생성
  let dots = [];
  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dot" + (i === 0 ? " is-active" : "");
      b.setAttribute("aria-label", `${i + 1}번 이미지`);
      b.addEventListener("click", () => go(i));
      dotsWrap.appendChild(b);
    });
    dots = Array.from(dotsWrap.querySelectorAll(".dot"));
  }

  function render() {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));

    // 카운터 표시: 1 / N
    if (counter) {
      counter.textContent = `${idx + 1} / ${slides.length}`;
    }
  }

  function go(n) {
    idx = (n + slides.length) % slides.length;
    render();
  }

  function next() {
    go(idx + 1);
  }

  function prev() {
    go(idx - 1);
  }

  // 슬라이드가 1장이면: 컨트롤/오토플레이 비활성
  if (slides.length <= 1) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (dotsWrap) dotsWrap.style.display = "none";
    render();
    return;
  }

  // 버튼 바인딩
  if (nextBtn) nextBtn.addEventListener("click", next);
  if (prevBtn) prevBtn.addEventListener("click", prev);

  // 자동재생
  function start() {
    stop();
    timer = setInterval(next, AUTOPLAY_MS);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // 마우스 올리면 일시정지 / 벗어나면 재시작
  const slider = document.querySelector(".hero-slider");
  if (slider) {
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    // 포커스 들어오면 멈추고, 나가면 재시작 (접근성)
    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", start);

    // 키보드 좌/우 지원
    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });

    // 키보드 이벤트 받게 탭 포커스 가능 처리(없다면)
    if (!slider.hasAttribute("tabindex")) slider.setAttribute("tabindex", "0");
  }

  // 초기 렌더 + 시작
  render();
  start();
  console.log("[carrot] hero slider initialized:", slides.length, "slides");
}

document.addEventListener("DOMContentLoaded", () => {
  bindCTAs();
  bindBackButton();
  initHeroSlider();
});
