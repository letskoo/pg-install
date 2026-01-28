"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const slides = [
  { src: "/images/hero/001.jpg", alt: "커피 음료와 케이크" },
  { src: "/images/hero/002.jpg", alt: "커피 음료와 케이크" },
  { src: "/images/hero/003.jpg", alt: "커피 음료와 케이크" },
  { src: "/images/hero/004.jpg", alt: "커피 음료와 케이크" },
];

const TRANSITION_MS = 380;
const DRAG_THRESHOLD_RATIO = 0.14; // 14% drag needed to trigger slide

export default function HeroSlider() {
  const [index, setIndex] = useState(1); // using extended slides, start at first real slide
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef(0);
  const widthRef = useRef(1);
  const modalStartXRef = useRef(0);

  // ✅ iOS 메인 슬라이더 touch 이벤트 직접 바인딩용
  const isTouchDraggingRef = useRef(false);

  const total = slides.length;
  const renderSlides = [slides[total - 1], ...slides, slides[0]];

  useEffect(() => {
    const updateWidth = () => {
      widthRef.current = containerRef.current?.offsetWidth || 1;
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAnimating) return undefined;
    const timer = window.setTimeout(() => {
      setIsAnimating(false);
      setIndex((current) => {
        if (current === 0) return total;
        if (current === total + 1) return 1;
        return current;
      });
    }, TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [isAnimating, total]);

  const percentOffset = (dragOffset / widthRef.current) * 100;
  const displayIndex = ((index - 1 + total) % total) + 1;

  const finishDrag = (direction: -1 | 0 | 1) => {
    setIsDragging(false);

    if (direction === 0) {
      setDragOffset(0);
      return;
    }

    setIsAnimating(true);
    setIndex((prev) => prev + direction);
    setDragOffset(0);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isAnimating) return;

    // iOS에서 기본 제스처로 포인터가 끊기는 것 방지
    event.preventDefault();

    setIsDragging(true);
    startXRef.current = event.clientX;
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    event.preventDefault();

    setDragOffset(event.clientX - startXRef.current);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const delta = event.clientX - startXRef.current;
    const threshold = widthRef.current * DRAG_THRESHOLD_RATIO;

    if (Math.abs(delta) >= threshold) {
      finishDrag(delta > 0 ? -1 : 1);
    } else {
      finishDrag(0);
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handlePointerCancel = () => {
    if (isDragging) {
      finishDrag(0);
    }
  };

  // ✅ 핵심: iOS에서 확실히 먹는 "passive:false" 터치 바인딩
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (isAnimating) return;
      if (!e.touches || e.touches.length === 0) return;

      isTouchDraggingRef.current = true;
      setIsDragging(true);
      startXRef.current = e.touches[0].clientX;
      setDragOffset(0);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouchDraggingRef.current) return;
      if (!e.touches || e.touches.length === 0) return;

      // ✅ 이게 iOS에서 스와이프를 브라우저에 뺏기지 않게 해줌
      e.preventDefault();

      const x = e.touches[0].clientX;
      setDragOffset(x - startXRef.current);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTouchDraggingRef.current) return;

      isTouchDraggingRef.current = false;

      const touch = (e.changedTouches && e.changedTouches[0]) || null;
      if (!touch) {
        finishDrag(0);
        return;
      }

      const delta = touch.clientX - startXRef.current;
      const threshold = widthRef.current * DRAG_THRESHOLD_RATIO;

      if (Math.abs(delta) >= threshold) {
        finishDrag(delta > 0 ? -1 : 1);
      } else {
        finishDrag(0);
      }
    };

    const onTouchCancel = () => {
      if (isTouchDraggingRef.current) {
        isTouchDraggingRef.current = false;
        finishDrag(0);
      }
    };

    // ✅ 중요: passive:false
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart as any);
      el.removeEventListener("touchmove", onTouchMove as any);
      el.removeEventListener("touchend", onTouchEnd as any);
      el.removeEventListener("touchcancel", onTouchCancel as any);
    };
  }, [isAnimating]);

  const handleImageClick = () => {
    if (!isDragging) {
      setShowModal(true);
      setModalIndex(index);
    }
  };

  const handleModalPrev = () => {
    setModalIndex((prev) => (prev - 1 - 1 + total) % total + 1);
  };

  const handleModalNext = () => {
    setModalIndex((prev) => (prev % total) + 1);
  };

  // 모달 키보드 이벤트
  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handleModalPrev();
      } else if (e.key === "ArrowRight") {
        handleModalNext();
      } else if (e.key === "Escape") {
        setShowModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal, modalIndex, total]);

  // 모달 스와이프 이벤트
  const handleModalTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    modalStartXRef.current = e.touches[0].clientX;
  };

  const handleModalTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const endX = e.changedTouches[0].clientX;
    const delta = endX - modalStartXRef.current;
    const threshold = 50;

    if (Math.abs(delta) >= threshold) {
      if (delta > 0) {
        handleModalPrev();
      } else {
        handleModalNext();
      }
    }
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="max-w-[640px] mx-auto">
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden aspect-square"
          style={{
            touchAction: "pan-y",
            width: "100%",
            WebkitUserSelect: "none",
            userSelect: "none",
            WebkitTouchCallout: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerLeave={handlePointerCancel}
          onPointerCancel={handlePointerCancel}
          onClick={handleImageClick}
        >
          {renderSlides.map((slide, slideIndex) => {
            const position = (slideIndex - index) * 100 + percentOffset;
            const transition =
              isDragging || !isAnimating
                ? "none"
                : `transform ${TRANSITION_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;

            return (
              <div
                key={`${slide.src}-${slideIndex}`}
                className="absolute inset-0"
                style={{
                  transform: `translateX(${position}%)`,
                  transition,
                }}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={slideIndex === 1}
                  sizes="100vw"
                  className="select-none object-cover"
                  draggable={false}
                />
              </div>
            );
          })}

          <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {displayIndex} / {slides.length}
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center overflow-hidden"
          onClick={() => setShowModal(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(false);
            }}
            className="absolute top-4 right-4 z-[10000] flex items-center justify-center w-10 h-10 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            aria-label="닫기"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            className="relative flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleModalTouchStart}
            onTouchEnd={handleModalTouchEnd}
            style={{ maxWidth: "100vw", maxHeight: "100vh" }}
          >
            {/* 좌 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleModalPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[10001] flex items-center justify-center w-12 h-12 bg-black/45 rounded-full hover:bg-black/60 active:bg-black/70 transition-colors shadow-lg"
              aria-label="이전"
            >
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* 이미지 */}
            <img
              src={slides[modalIndex - 1].src}
              alt={slides[modalIndex - 1].alt}
              style={{ maxWidth: "100vw", maxHeight: "100vh", objectFit: "contain" }}
            />

            {/* 우 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleModalNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[10001] flex items-center justify-center w-12 h-12 bg-black/45 rounded-full hover:bg-black/60 active:bg-black/70 transition-colors shadow-lg"
              aria-label="다음"
            >
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* 인디케이터 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {modalIndex} / {slides.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
