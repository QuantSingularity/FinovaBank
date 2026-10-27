// jest-dom adds custom matchers for asserting on DOM nodes.
import "@testing-library/jest-dom";

// Provide a canvas implementation for chart.js (used by the Dashboard charts).
// jsdom does not implement the canvas API, so without this, chart rendering
// throws and crashes the whole component under test.
import "jest-canvas-mock";

// Polyfill browser observer APIs that jsdom does not implement. Several
// components and MUI internals (HomePage uses IntersectionObserver, MUI Tabs
// uses ResizeObserver) reference these at render time.
class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

if (typeof window.IntersectionObserver === "undefined") {
  // @ts-expect-error - assigning a test polyfill
  window.IntersectionObserver = MockObserver;
}
if (typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = MockObserver;
}

// Polyfill matchMedia, used by MUI's responsive utilities.
if (typeof window.matchMedia === "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
