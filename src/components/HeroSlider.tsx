"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { heroImages } from "@/generated/heroImages";

const SWIPE_THRESHOLD = 60; // px
const TRANSITION_MS = 340;

type Direction = -1 | 0 | 1;
type TransitionKind = "none" | "commit" | "cancel";

export default function HeroSlider() {
  const images = heroImages;

  if (images.length === 0) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [direction, setDirection] = useState<Direction>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [transitionKind, setTransitionKind] = useState<TransitionKind>("none");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const startXRef = useRef<number | null>(null);
  const transitionHandledRef = useRef(false);

  const canSlide = images.length > 1;

  // 이미지 개수가 변하거나 리프레시 이후 상태가 꼬이는 것을 방지하기 위한 안전 초기화
  useEffect(() => {
    if (images.length === 0) return;

    startXRef.current = null;
    transitionHandledRef.current = false;
    setIsDragging(false);
    setDragX(0);
    setDirection(0);
    setTransitionKind("none");
    setIsTransitioning(false);
    setNextIndex(null);

    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }

    if (nextIndex !== null && nextIndex >= images.length) {
      setNextIndex(null);
    }
  }, [images.length]);

  const wrapIndex = (idx: number) => {
    const mod = idx % images.length;
    return mod < 0 ? mod + images.length : mod;
  };

  const beginCommit = (dir: Direction) => {
    if (!canSlide) return;
    if (isDragging) return;
    if (dir === 0 || isTransitioning) return;
    const target = wrapIndex(currentIndex + dir);
    transitionHandledRef.current = false;
    setDirection(dir);
    setNextIndex(target);
    setTransitionKind("commit");
    setIsTransitioning(true);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!canSlide || isTransitioning) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    startXRef.current = e.clientX;
    setIsDragging(true);
    setTransitionKind("none");
    transitionHandledRef.current = false;
    setDirection(0);
    setNextIndex(null);
    setDragX(0);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!canSlide || !isDragging || startXRef.current === null) return;
    e.preventDefault();
    const delta = e.clientX - startXRef.current;
    setDragX(delta);

    const dir: Direction = delta === 0 ? 0 : delta < 0 ? 1 : -1;
    if (dir !== direction) {
      setDirection(dir);
      setNextIndex(dir === 0 ? null : wrapIndex(currentIndex + dir));
    }
  };

  const endDrag = (cancelOnly = false) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (!canSlide) return;

    if (!cancelOnly && Math.abs(dragX) >= SWIPE_THRESHOLD && direction !== 0) {
      const target = nextIndex ?? wrapIndex(currentIndex + direction);
      transitionHandledRef.current = false;
      setNextIndex(target);
      setTransitionKind("commit");
      setIsTransitioning(true);
    } else {
      transitionHandledRef.current = false;
      setTransitionKind("cancel");
      setIsTransitioning(true);
      setDirection(0);
      setNextIndex(null);
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    endDrag();
  };

  const handlePointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    endDrag(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!canSlide) return;
      if (isDragging) return;
      if (event.key === "ArrowLeft") beginCommit(-1);
      if (event.key === "ArrowRight") beginCommit(1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, images.length, isTransitioning, canSlide, isDragging]);

  const handleTransitionEnd = () => {
    if (!isTransitioning) return;
    if (transitionHandledRef.current) return;
    transitionHandledRef.current = true;

    if (transitionKind === "commit" && nextIndex !== null && direction !== 0) {
      setCurrentIndex(nextIndex);
    }

    setDragX(0);
    setDirection(0);
    setNextIndex(null);
    setTransitionKind("none");
    setIsTransitioning(false);
  };

  const activeTransform = (() => {
    if (isTransitioning && transitionKind === "commit" && direction !== 0) {
      return `translateX(${direction === 1 ? "-100%" : "100%"})`;
    }
    if (isTransitioning && transitionKind === "cancel") return "translateX(0)";
    if (isDragging) return `translateX(${dragX}px)`;
    return "translateX(0)";
  })();

  const incomingTransform = (() => {
    if (nextIndex === null || direction === 0) return null;

    if (isTransitioning && transitionKind === "commit") {
      return "translateX(0)";
    }

    const base = direction === 1 ? "100%" : "-100%";

    if (isDragging) {
      return `translateX(calc(${base} + ${dragX}px))`;
    }

    return `translateX(${base})`;
  })();

  const shouldAnimate = isTransitioning && !isDragging;

  if (!canSlide) {
    return (
      <section className="mx-auto w-full max-w-md">
        <div className="relative aspect-square w-full overflow-hidden bg-black">
          <Image
            src={images[0]}
            alt="hero-static"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
            1 / 1
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-md">
      <div
        className="relative aspect-square w-full overflow-hidden bg-black"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: activeTransform,
            transition: shouldAnimate
              ? `transform ${TRANSITION_MS}ms ease-out`
              : "none",
          }}
          onTransitionEnd={(event) => {
            if (event.propertyName === "transform") {
              handleTransitionEnd();
            }
          }}
        >
          <Image
            src={images[currentIndex]}
            alt={`hero-${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
        </div>

        {incomingTransform !== null && nextIndex !== null && (
          <div
            className="absolute inset-0"
            style={{
              transform: incomingTransform,
              transition: shouldAnimate
                ? `transform ${TRANSITION_MS}ms ease-out`
                : "none",
            }}
            onTransitionEnd={(event) => {
              if (event.propertyName === "transform") {
                handleTransitionEnd();
              }
            }}
          >
            <Image
              src={images[nextIndex]}
              alt={`hero-${nextIndex + 1}`}
              fill
              className="object-cover"
            />
          </div>
        )}

        {isHovering && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white transition hover:opacity-70 focus:outline-none p-2 z-20"
              style={{ pointerEvents: "auto" }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                startXRef.current = null;
                setDragX(0);
                setTransitionKind("none");
                setNextIndex(null);
                setDirection(0);
                beginCommit(-1);
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              type="button"
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white transition hover:opacity-70 focus:outline-none p-2 z-20"
              style={{ pointerEvents: "auto" }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                startXRef.current = null;
                setDragX(0);
                setTransitionKind("none");
                setNextIndex(null);
                setDirection(0);
                beginCommit(1);
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}

        <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </section>
  );
}
