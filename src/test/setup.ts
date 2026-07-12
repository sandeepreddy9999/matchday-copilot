import '@testing-library/jest-dom/vitest';

// Extend Vitest's expect with jest-dom matchers (toBeInTheDocument, etc).

// jsdom doesn't implement matchMedia; components that check
// prefers-reduced-motion need this polyfilled or they throw on mount.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}
