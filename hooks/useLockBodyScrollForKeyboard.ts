"use client";

import { useCallback, useRef } from "react";

const APP_CONTAINER_ID = "app-container";

/**
 * Returns lock/unlock callbacks that give the "moveable page" effect on mobile
 * when the keyboard appears: body and app-container are made fixed so the
 * viewport resize (keyboard) moves the whole page up and keeps the focused
 * input visible. Use onFocus={lockBodyScroll} onBlur={unlockBodyScroll} on
 * inputs, and call unlockBodyScroll when closing overlays.
 */
export function useLockBodyScrollForKeyboard() {
  const savedScrollY = useRef(0);
  const bodyScrollLocked = useRef(false);
  const touchMoveHandlerRef = useRef<((e: TouchEvent) => void) | null>(null);
  const appContainerStylesRef = useRef<{
    position: string;
    top: string;
    left: string;
    right: string;
    width: string;
    maxWidth: string;
    marginLeft: string;
    marginRight: string;
  } | null>(null);

  const lockBodyScroll = useCallback(() => {
    if (typeof window === "undefined" || bodyScrollLocked.current) return;
    const isMobile = "ontouchstart" in window;
    if (!isMobile) return;
    bodyScrollLocked.current = true;
    const scrollY = window.scrollY;
    savedScrollY.current = scrollY;

    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const app = document.getElementById(APP_CONTAINER_ID);
    if (app) {
      appContainerStylesRef.current = {
        position: app.style.position,
        top: app.style.top,
        left: app.style.left,
        right: app.style.right,
        width: app.style.width,
        maxWidth: app.style.maxWidth,
        marginLeft: app.style.marginLeft,
        marginRight: app.style.marginRight,
      };
      app.style.position = "fixed";
      app.style.top = `-${scrollY}px`;
      app.style.left = "0";
      app.style.right = "0";
      app.style.width = "100%";
      app.style.maxWidth = "430px";
      app.style.marginLeft = "auto";
      app.style.marginRight = "auto";
    }

    const preventTouchMove = (e: TouchEvent) => {
      const target = e.target as Node;
      const active = document.activeElement;
      if (active && (active === target || active.contains(target))) return;
      e.preventDefault();
    };
    touchMoveHandlerRef.current = preventTouchMove;
    document.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });
  }, []);

  const unlockBodyScroll = useCallback(() => {
    if (typeof window === "undefined" || !bodyScrollLocked.current) return;
    bodyScrollLocked.current = false;

    document.documentElement.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.overflow = "";
    document.body.style.touchAction = "";

    const app = document.getElementById(APP_CONTAINER_ID);
    if (app && appContainerStylesRef.current) {
      const s = appContainerStylesRef.current;
      app.style.position = s.position;
      app.style.top = s.top;
      app.style.left = s.left;
      app.style.right = s.right;
      app.style.width = s.width;
      app.style.maxWidth = s.maxWidth;
      app.style.marginLeft = s.marginLeft;
      app.style.marginRight = s.marginRight;
      appContainerStylesRef.current = null;
    }

    if (touchMoveHandlerRef.current) {
      document.removeEventListener("touchmove", touchMoveHandlerRef.current);
      touchMoveHandlerRef.current = null;
    }

    window.scrollTo(0, savedScrollY.current);
  }, []);

  return { lockBodyScroll, unlockBodyScroll };
}
