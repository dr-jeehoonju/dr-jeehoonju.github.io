// Deliberately excludes all form pages, query strings, text and health data.
const key = "drju-analytics-consent";
const id = import.meta.env.PUBLIC_GA4_ID || "";
const eligible =
  /^G-[A-Z0-9]+$/.test(id) &&
  location.hostname === "jeehoonju.com" &&
  !/^\/(book|building)(\/|$)/.test(location.pathname);
type AnalyticsWindow = Window & {
  dataLayer: unknown[];
  gtag?: (...args: unknown[]) => void;
};
const w = window as unknown as AnalyticsWindow;
const banner = document.querySelector<HTMLElement>(".cookie-banner");
const gpc =
  (navigator as Navigator & { globalPrivacyControl?: boolean })
    .globalPrivacyControl === true;
let started = false;
let choice: string | null = null;
try {
  choice = localStorage.getItem(key);
} catch {}
const reportingPath = /^\/care\//.test(location.pathname)
  ? "/care/"
  : location.pathname;
const reportingTitle =
  reportingPath === "/care/" ? "Care library" : document.title;
function send(name: string, params: Record<string, string | number> = {}) {
  if (!started || choice !== "yes" || gpc) return;
  w.gtag?.("event", name, {
    page_location: `https://jeehoonju.com${reportingPath}`,
    page_title: reportingTitle,
    page_referrer: document.referrer ? new URL(document.referrer).origin : "",
    ...params,
  });
}
function start() {
  if (started || !eligible || choice !== "yes" || gpc) return;
  started = true;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function (..._args: unknown[]) {
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", id, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: `https://jeehoonju.com${reportingPath}`,
    page_title: reportingTitle,
    page_referrer: document.referrer ? new URL(document.referrer).origin : "",
  });
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  script.async = true;
  document.head.append(script);
  send("page_view");
}
if (eligible && !choice && !gpc && banner) banner.hidden = false;
start();
document.querySelectorAll<HTMLElement>("[data-consent]").forEach((b) =>
  b.addEventListener("click", () => {
    choice = b.dataset.consent || "no";
    try {
      localStorage.setItem(key, choice);
    } catch {}
    if (banner) banner.hidden = true;
    if (choice === "yes") start();
    else if (started) location.reload();
  }),
);
document.querySelectorAll("[data-cookie-settings]").forEach((b) =>
  b.addEventListener("click", () => {
    if (banner) banner.hidden = false;
  }),
);
document.addEventListener("click", (e) => {
  const el = (e.target as Element).closest<HTMLElement>("[data-event]");
  const allowed = ["booking_cta", "video_original", "video_play"];
  if (el?.dataset.event && allowed.includes(el.dataset.event))
    send(el.dataset.event);
});
const seen = new Set<number>();
window.addEventListener(
  "scroll",
  () => {
    if (!started) return;
    const total = document.documentElement.scrollHeight - innerHeight;
    if (total <= 0) return;
    const percent = (scrollY / total) * 100;
    for (const threshold of [50, 90])
      if (percent >= threshold && !seen.has(threshold)) {
        seen.add(threshold);
        send("reading_depth", { percent: threshold });
      }
  },
  { passive: true },
);
let active = 0;
setInterval(() => {
  if (document.visibilityState === "visible" && document.hasFocus() && started)
    active += 5;
}, 5000);
document.addEventListener("visibilitychange", () => {
  if (document.hidden && active) {
    send("active_reading", { active_seconds: active });
    active = 0;
  }
});
