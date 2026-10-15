import { bookingCampaignAttribution } from "./campaign-attribution";

/** Public browser contract from the existing Tune booking frontend, 2026-09-07.
 * This is the public anon key, never a service-role key. RLS/Edge functions
 * remain the authority; no database writes are made directly by this client.
 */
export const BOOKING_ORIGIN = "https://eqavuyhzocextlqkcfpa.supabase.co";
export const BOOKING_EDGE_REGION = "ap-northeast-2";
const PUBLIC_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYXZ1eWh6b2NleHRscWtjZnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzOTQ2NzgsImV4cCI6MjEwNTk3MDY3OH0._dGM17QDOieRFt8BsXwr5Uxfu-FJNw63NPFJ5V6pTrs";
export const TURNSTILE_SITE_KEY = "0x4AAAAAAFEiLFGFIZ8YgxOS";
export const OPERATIONAL_BOOKING_URL = "https://tuneclinic-global.com/booking";
export const isBookingHost = (hostname: string) =>
  ["jeehoonju.com", "www.jeehoonju.com"].includes(hostname);

/** Fail-closed release switch, shared by the booking form and the appointment
 * management page. Moving the clinic hostname to this site cannot by itself
 * put a live patient form in front of anyone: PUBLIC_INTAKE_ENABLED has to be
 * deployed as "true" after the patched booking backend and the privacy review
 * ship. Any other value, a missing variable included, keeps both pages inert. */
export const BOOKING_RELEASED =
  import.meta.env.PUBLIC_INTAKE_ENABLED === "true";

export type BookingLocation = {
  protocol: string;
  hostname: string;
  port: string;
};
/** The clinic domain, over HTTPS, on the default port. A preview host, a
 * plain-HTTP page and a tunnelled port are none of them the clinic. */
export const bookingLocationAllowed = (location: BookingLocation) =>
  location.protocol === "https:" &&
  isBookingHost(location.hostname) &&
  !location.port;
export const bookingWriteAllowed = (location: BookingLocation) =>
  BOOKING_RELEASED && bookingLocationAllowed(location);
/** The operational booking page — unless this page is already served from the
 * clinic domain, where that link would be a loop rather than a fallback. */
export const operationalBookingUrl = (location: BookingLocation) =>
  OPERATIONAL_BOOKING_URL;

export type ScheduleTemplate = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
};
export type Availability = {
  templates: ScheduleTemplate[];
  blocks: { block_date: string }[];
  booked: {
    appointment_date: string;
    appointment_time: string;
    status: string;
  }[];
};
export type BookingAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  landing_page?: string;
  gclid?: string;
  wbraid?: string;
  gbraid?: string;
};
export type BookingPayload = BookingAttribution & {
  booking_type: "slot_pick";
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  appointment_date: string;
  appointment_time: string;
  preferred_out_time: string | null;
  treatment_interest: string[];
  message: string | null;
  locale: string;
  patient_timezone: string;
  preferred_contact_channel: string | null;
  contact_channel_id: string | null;
  iv_sedation_requested: boolean;
  consent_personal: true;
  consent_health: true;
  consent_overseas: boolean;
  consent_version: string;
  event_id: string;
  event_time: number;
};

/** Read at submission time. Public source labels are revalidated here.
 * Google IDs require current optional tracking consent and no GPC signal.
 * Storage failure must not prevent a patient from submitting a request. */
export function readBookingAttribution(): BookingAttribution {
  const read = (key: string): Record<string, unknown> => {
    try {
      const value: unknown = JSON.parse(sessionStorage.getItem(key) || "{}");
      return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  };
  const source = read("tc_src");
  const attribution: BookingAttribution = {};
  // Keep identical to ContactBeacon's public campaign labels.
  const publicLabels = {
    utm_source: ["google", "ig", "instagram", "meta", "facebook", "bing"],
    utm_medium: ["cpc", "ppc", "paid", "paid_social", "social"],
    utm_campaign: [
      "high_intent_v2",
      "high_intent_au",
      "high_intent_gb",
      "high_intent_jp",
      "high_intent_th",
    ],
    utm_content: [
      "the_tuning",
      "the_tuning_sys1",
      "korea_destination",
      "korea_destination_sys1",
      "korea_destination_photo",
      "korea_destination_home",
    ],
  };
  for (const key of Object.keys(publicLabels) as Array<
    keyof typeof publicLabels
  >) {
    const value = source[key];
    if (typeof value === "string" && publicLabels[key].includes(value))
      attribution[key] = value;
  }
  const landing = source.landing_page;
  if (
    typeof landing === "string" &&
    landing.startsWith("/") &&
    !/[?#]/.test(landing)
  )
    attribution.landing_page = landing.slice(0, 500);
  let trackingAllowed = false;
  try {
    trackingAllowed =
      localStorage.getItem("tune-cookie-consent") === "accepted" &&
      (globalThis.navigator as Navigator & { globalPrivacyControl?: boolean })
        ?.globalPrivacyControl !== true;
  } catch {
    /* Consent storage failure keeps advertising attribution off. */
  }
  if (trackingAllowed) {
    const consented = read("tc_attr");
    for (const key of ["gclid", "wbraid", "gbraid"] as const) {
      const value = consented[key];
      if (typeof value === "string" && value)
        attribution[key] = value.slice(0, 200);
    }
  }
  return attribution;
}

const headers = {
  apikey: PUBLIC_ANON_KEY,
  Authorization: `Bearer ${PUBLIC_ANON_KEY}`,
};
export async function loadAvailability(
  month: string,
  signal?: AbortSignal,
): Promise<Availability> {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Invalid month");
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const period = `&appointment_date=gte.${month}-01&appointment_date=lte.${month}-${lastDay}`;
  const queries = [
    "schedule_templates?select=day_of_week,start_time,end_time,slot_duration_minutes,is_active&is_active=eq.true",
    `schedule_blocks?select=block_date&block_date=gte.${month}-01&block_date=lte.${month}-${lastDay}`,
    `booked_slots?select=appointment_date,appointment_time,status${period}`,
  ];
  const values = await Promise.all(
    queries.map(async (query) => {
      const response = await fetch(`${BOOKING_ORIGIN}/rest/v1/${query}`, {
        headers,
        signal,
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });
      if (!response.ok)
        throw new Error("Availability is temporarily unavailable");
      const value: unknown = await response.json();
      if (!Array.isArray(value))
        throw new Error("Invalid availability response");
      return value;
    }),
  );
  return {
    templates: values[0] as ScheduleTemplate[],
    blocks: values[1] as Availability["blocks"],
    booked: values[2] as Availability["booked"],
  };
}

export const seoulDate = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};
const minutes = (time: string) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time)) return NaN;
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
};
export function availableTimes(
  date: string,
  data: Availability,
  now = new Date(),
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    date < seoulDate(now) ||
    data.blocks.some((b) => b.block_date === date)
  )
    return [];
  const day = new Date(`${date}T00:00:00+09:00`);
  if (!Number.isFinite(day.getTime()) || seoulDate(day) !== date) return [];
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const used = new Set(
    data.booked
      .filter((b) => b.appointment_date === date && b.status !== "cancelled")
      .map((b) => b.appointment_time.slice(0, 5)),
  );
  const candidates = new Set<string>();
  for (const template of data.templates.filter(
    (t) => t.is_active && t.day_of_week === weekday,
  )) {
    const start = minutes(template.start_time),
      end = minutes(template.end_time),
      duration = template.slot_duration_minutes;
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 1440
    )
      continue;
    for (let n = start; n + duration <= end; n += duration) {
      const time = `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
      if (
        !used.has(time) &&
        new Date(`${date}T${time}:00+09:00`).getTime() > now.getTime()
      )
        candidates.add(time);
    }
  }
  return [...candidates].sort();
}

const BLOCKED_MESSAGE =
  "Booking requests are not open on this address. Please use the clinic’s current booking page, or message us on WhatsApp.";
const INCOMPLETE_MESSAGE =
  "Please complete the required consent and verification.";
const SLOT_MESSAGE =
  "That time is no longer available. Please choose another time.";
const DECLINED_MESSAGE =
  "Your request was not accepted, so nothing has been booked. Please check your details, or arrange your visit on WhatsApp.";
const BUSY_MESSAGE =
  "Several requests have already been sent from this connection. Nothing was booked this time — please continue on WhatsApp.";
const AVAILABILITY_MESSAGE =
  "Current availability could not be checked, so nothing was booked. Please try again in a moment, or contact us on WhatsApp.";
/** Used whenever the outcome is genuinely unknown: the request may already
 * have reached the clinic, so this never invites another attempt. */
export const UNRESOLVED_MESSAGE =
  "We could not confirm whether your request reached the clinic. Please do not send it again — message us on WhatsApp and we will check for you.";
const SUBMIT_TIMEOUT_MS = 20_000;
const SUBMIT_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A submission failure the page can act on. `unresolved` means the request
 * may have been received: the form must stop rather than offer a retry. */
export class BookingSubmitError extends Error {
  readonly unresolved: boolean;
  constructor(message: string, unresolved = false) {
    super(message);
    this.name = "BookingSubmitError";
    this.unresolved = unresolved;
  }
}

/** Every field is copied out by name, so a caller cannot widen the request.
 * consent_at is deliberately absent: the clinic's record of when consent was
 * given is the server clock, never a patient device clock. */
function submissionBody(
  payload: BookingPayload,
  token: string,
  honeypot: string,
) {
  const attribution: BookingAttribution = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "landing_page",
    "gclid",
    "wbraid",
    "gbraid",
  ] as const) {
    if (typeof payload[key] === "string" && payload[key])
      attribution[key] = payload[key];
  }
  const campaignAttribution = bookingCampaignAttribution();
  return {
    ...attribution,
    ...(campaignAttribution
      ? { campaign_attribution: campaignAttribution }
      : {}),
    booking_type: payload.booking_type,
    patient_name: payload.patient_name,
    patient_email: payload.patient_email,
    patient_phone: payload.patient_phone,
    appointment_date: payload.appointment_date,
    appointment_time: payload.appointment_time,
    preferred_out_time: payload.preferred_out_time,
    treatment_interest: payload.treatment_interest,
    message: payload.message,
    locale: payload.locale,
    patient_timezone: payload.patient_timezone,
    preferred_contact_channel: payload.preferred_contact_channel,
    contact_channel_id: payload.contact_channel_id,
    iv_sedation_requested: payload.iv_sedation_requested,
    consent_personal: payload.consent_personal,
    consent_health: payload.consent_health,
    consent_overseas: payload.consent_overseas,
    consent_version: payload.consent_version,
    event_id: payload.event_id,
    event_time: payload.event_time,
    turnstile_token: token,
    honeypot,
  };
}

export async function submitBooking(
  payload: BookingPayload,
  token: string,
  location: BookingLocation,
  honeypot = "",
) {
  if (!bookingWriteAllowed(location))
    throw new BookingSubmitError(BLOCKED_MESSAGE);
  if (
    !token ||
    honeypot ||
    !payload.consent_personal ||
    !payload.consent_health
  )
    throw new BookingSubmitError(INCOMPLETE_MESSAGE);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
  let response: Response;
  let parsed: unknown;
  try {
    response = await fetch(
      `${BOOKING_ORIGIN}/functions/v1/submit-booking?forceFunctionRegion=${BOOKING_EDGE_REGION}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
        body: JSON.stringify(submissionBody(payload, token, honeypot)),
      },
    );
    // Keep the timeout active until the body arrives, not just the headers.
    // Error status codes can be classified without trusting their body.
    if (response.ok || response.status === 503) parsed = await response.json();
  } catch {
    // A timeout or a dropped connection says nothing about the server: the
    // booking may already exist, so this is never a clean failure. The native
    // error is discarded rather than shown to a patient.
    throw new BookingSubmitError(UNRESOLVED_MESSAGE, true);
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    // 4xx is a decision the function reached before writing anything. 5xx and
    // anything else may have been written before the failure.
    if (response.status === 409) throw new BookingSubmitError(SLOT_MESSAGE);
    if (response.status === 429) throw new BookingSubmitError(BUSY_MESSAGE);
    if (
      response.status === 503 &&
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      (parsed as Record<string, unknown>).error === "availability-unavailable"
    ) {
      throw new BookingSubmitError(AVAILABILITY_MESSAGE);
    }
    if (response.status >= 400 && response.status < 500)
      throw new BookingSubmitError(DECLINED_MESSAGE);
    throw new BookingSubmitError(UNRESOLVED_MESSAGE, true);
  }
  const result =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  if (
    typeof result.error === "string" &&
    /slot|booked|conflict/i.test(result.error)
  )
    throw new BookingSubmitError(SLOT_MESSAGE);
  // Receipt is claimed only for the exact success the function documents: a
  // stored booking id. An empty body, an intercepting page and the honeypot
  // acknowledgement all leave the outcome unknown.
  if (
    result.ok !== true ||
    typeof result.id !== "string" ||
    !SUBMIT_ID.test(result.id)
  ) {
    throw new BookingSubmitError(UNRESOLVED_MESSAGE, true);
  }
  return result as { ok: true; id: string };
}
