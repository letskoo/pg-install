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
    // 실제 앱이면 history.back()을 쓰고, 웹 랜딩이면 홈 이동 등으로 교체 가능
    history.back();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindCTAs();
  bindBackButton();
});
