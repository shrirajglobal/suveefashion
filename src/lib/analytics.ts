// ─── Google Analytics 4 ───
// REPLACE with your actual GA4 Measurement ID
const GA4_ID = "G-WBHPBKQ9S5";

// Load gtag.js script dynamically
export function initGA4() {
  if (typeof window === "undefined") return;
  if (document.getElementById("ga4-script")) return;

  const script = document.createElement("script");
  script.id = "ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  gtag("js", new Date());
  gtag("config", GA4_ID);
  (window as any).gtag = gtag;
}

// Track custom events
export function trackEvent(eventName: string, params?: Record<string, string>) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }
}
