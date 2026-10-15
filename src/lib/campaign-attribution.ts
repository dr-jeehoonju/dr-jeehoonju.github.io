/** Optional, first-party campaign metadata. Never collects form fields or full URLs. */
const KEY = "tc_campaign_attribution_v1";
const CONSENT = "tune-cookie-consent";
const SCHEMA = "tc_campaign_attribution.v1";
const TTL = 30 * 24 * 60 * 60 * 1000;
const FIELDS = [
  "af_campaign_version",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "path",
  "reported_at",
];
const UTM = /^[A-Za-z0-9._~-]{1,100}$/;
type Touch = {
  af_campaign_version: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string | null;
  path: string;
  reported_at: string;
};
export type CampaignAttribution = {
  schema: typeof SCHEMA;
  first: Touch | null;
  recent: Touch | null;
};
export type CampaignBrowser = Pick<
  Window,
  "localStorage" | "sessionStorage" | "location" | "document" | "performance"
> & { navigator: { globalPrivacyControl?: boolean } };
function consent(browser: CampaignBrowser) {
  try {
    return (
      browser.navigator.globalPrivacyControl !== true &&
      browser.localStorage.getItem(CONSENT) === "accepted"
    );
  } catch {
    return false;
  }
}
function touch(value: unknown, now: number): Touch | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (
    Object.keys(v).some((key) => !FIELDS.includes(key)) ||
    FIELDS.some((key) => !(key in v))
  )
    return null;
  if (
    typeof v.af_campaign_version !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      v.af_campaign_version,
    )
  )
    return null;
  if (
    ![v.utm_source, v.utm_medium, v.utm_campaign].every(
      (x) => typeof x === "string" && UTM.test(x),
    )
  )
    return null;
  if (
    v.utm_content !== null &&
    (typeof v.utm_content !== "string" || !UTM.test(v.utm_content))
  )
    return null;
  if (
    typeof v.path !== "string" ||
    !/^\/([a-z0-9][a-z0-9_/-]{0,199})?$/.test(v.path) ||
    v.path.includes("//")
  )
    return null;
  if (
    typeof v.reported_at !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v.reported_at)
  )
    return null;
  const stamp = Date.parse(v.reported_at);
  if (
    !Number.isFinite(stamp) ||
    new Date(stamp).toISOString() !== v.reported_at ||
    stamp > now ||
    now - stamp > TTL
  )
    return null;
  return {
    af_campaign_version: v.af_campaign_version.toLowerCase(),
    utm_source: v.utm_source as string,
    utm_medium: v.utm_medium as string,
    utm_campaign: v.utm_campaign as string,
    utm_content: v.utm_content as string | null,
    path: v.path,
    reported_at: v.reported_at,
  };
}
function stored(
  browser: CampaignBrowser,
  now: number,
): CampaignAttribution | null {
  const raw = browser.sessionStorage.getItem(KEY);
  if (!raw || raw.length > 2048) return null;
  const v = JSON.parse(raw);
  if (
    !v ||
    v.schema !== SCHEMA ||
    Object.keys(v).some((key) => !["schema", "first", "recent"].includes(key))
  )
    return null;
  return {
    schema: SCHEMA,
    first: touch(v.first, now),
    recent: touch(v.recent, now),
  };
}
export function clearCampaignAttribution(browser: CampaignBrowser) {
  try {
    browser.sessionStorage.removeItem(KEY);
  } catch {
    /* Optional storage may be unavailable. */
  }
}
export function readCampaignAttribution(
  browser: CampaignBrowser,
  now = Date.now(),
): CampaignAttribution | null {
  if (!consent(browser)) {
    clearCampaignAttribution(browser);
    return null;
  }
  try {
    const value = stored(browser, now);
    return value?.first || value?.recent ? value : null;
  } catch {
    return null;
  }
}
/** First means first consented observation in this tab, not first-ever contact. */
export function captureCampaignArrival(
  browser: CampaignBrowser,
  now = Date.now(),
) {
  if (!consent(browser)) {
    clearCampaignAttribution(browser);
    return;
  }
  try {
    const existing = stored(browser, now);
    const query = new URLSearchParams(browser.location.search);
    const nav = (
      browser.performance.getEntriesByType("navigation")[0] as
        PerformanceNavigationTiming | undefined
    )?.type;
    const referrer = browser.document.referrer;
    const internal =
      !!referrer && new URL(referrer).origin === browser.location.origin;
    const hit =
      nav === "reload" || nav === "back_forward" || internal
        ? null
        : touch(
            {
              af_campaign_version: query.get("af_campaign_version"),
              utm_source: query.get("utm_source"),
              utm_medium: query.get("utm_medium"),
              utm_campaign: query.get("utm_campaign"),
              utm_content: query.get("utm_content"),
              path: browser.location.pathname.toLowerCase(),
              reported_at: new Date(now).toISOString(),
            },
            now,
          );
    const same =
      hit &&
      existing?.recent &&
      FIELDS.filter((key) => key !== "reported_at").every(
        (key) =>
          hit[key as keyof Touch] === existing.recent?.[key as keyof Touch],
      );
    const recent =
      hit && (nav === "navigate" || !same) ? hit : (existing?.recent ?? null);
    browser.sessionStorage.setItem(
      KEY,
      JSON.stringify({
        schema: SCHEMA,
        first: existing ? existing.first : hit,
        recent,
      }),
    );
  } catch {
    /* Storage, referrer or timing failures cannot interfere with booking. */
  }
}
/** Re-check optional consent at submission, including revocation in another tab. */
export function bookingCampaignAttribution(): CampaignAttribution | null {
  if (typeof window === "undefined") return null;
  return readCampaignAttribution(window as CampaignBrowser);
}
