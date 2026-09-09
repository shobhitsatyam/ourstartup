import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Global ScrollToTop Hook
 *
 * Ensures that whenever the user navigates to ANY different route/page
 * using React Router (via footer links, product cards, category links,
 * navbar links, search results, or internal navigation), the destination
 * page starts at the very top (scrollY = 0, scrollX = 0).
 *
 * - Works seamlessly across Desktop, Tablet, and Mobile.
 * - Preserves intentional in-page hash scrolling (e.g. #reviews-section).
 * - Overrides CSS smooth-scrolling during route transitions for instant snapping.
 */
export function useScrollToTop() {
  const { pathname, search, hash } = useLocation();

  const performScrollToTop = () => {
    // If there is an intentional in-page hash on the route, preserve that scrolling behavior
    if (hash) {
      try {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      } catch {
        // Invalid selector or element not found; fall through to top reset
      }
    }

    // 1. Instant window scroll reset (overrides html.scroll-smooth delay)
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    } catch {
      window.scrollTo(0, 0);
    }

    // 2. Direct reset on documentElement and body (critical for iOS/WebKit and tablet browsers)
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    }
  };

  useIsomorphicLayoutEffect(() => {
    // Immediate synchronous reset before paint
    performScrollToTop();

    // Secondary frame check in case route components mount asynchronously or have entrance transitions
    const rafId = requestAnimationFrame(() => {
      performScrollToTop();
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, search, hash]);
}

/**
 * Reusable ScrollToTop Component
 * Place at the root of App inside React Router context.
 */
export default function ScrollToTop() {
  useScrollToTop();
  return null;
}
