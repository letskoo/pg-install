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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef(0);
  const widthRef = useRef(1);

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
    setIsDragging(true);
    startXRef.current = event.clientX;
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
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

  const handleImageClick = () => {
    if (!isDragging) {
      setShowModal(true);
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
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        style={{ touchAction: "pan-y", width: "100%", height: "100vw" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerLeave={handlePointerCancel}
        onPointerCancel={handlePointerCancel}
        onClick={handleImageClick}
      >
        {renderSlides.map((slide, slideIndex) => {
          const position = (slideIndex - index) * 100 + percentOffset;
          const transition = isDragging || !isAnimating
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
            style={{ maxWidth: "100vw", maxHeight: "100vh" }}
          >
            <img
              src={renderSlides[index].src}
              alt={renderSlides[index].alt}
              style={{ maxWidth: "100vw", maxHeight: "100vh", objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
