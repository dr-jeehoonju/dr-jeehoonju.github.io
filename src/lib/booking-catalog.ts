import {
  BOOKING_TREATMENT_CATALOG,
  FEATURED_PROGRAMS,
  GLOW_ADD_ON,
} from "./vnext-public-catalog";

export const CONSULTATION_VALUE = "consultation-first";
export const CONSULTATION_LABEL = "Free physician consultation";
export const GLOW_EXTRA_VALUE = "pigment-acne-scar:enlighten-glow-addon";
export const GLOW_EXTRA_LABEL = "Enlighten laser · optional Glow add-on";
const TREATMENT_PARAM = "treatment";
const DATE_PARAM = "date";
const TIME_PARAM = "time";

// Retain existing treatment keys for the operational backend. New Journey
// names are explicit wishlist entries, never an automatic paid reservation.
// Each key is bound to the program's current display name instead of its
// position in FEATURED_PROGRAMS, so renaming, reordering or adding a program
// can never move a patient's wishlist onto another program's key.
const PROGRAM_KEYS = new Map([
  ["Tune Journey Glow", "fly-in-programs:tune-journey-glow"],
  ["Tune Journey Lift", "fly-in-programs:tune-journey-lift"],
  ["Tune Journey Complete", "fly-in-programs:tune-journey-complete"],
  ["The First Pigment laser Omakase", "curated-programs:the-first-reading"],
  ["The Restoration with PRP", "curated-programs:the-restoration"],
  ["The Body Filler Omakase", "curated-programs:body-composition"],
]);

/** A program the map does not name is offered to nobody, rather than being
 * submitted with an undefined key. The catalog build throws when this list
 * is non-empty, so a rename is caught before a patient sees it. The clinic's confirmation email prints the same names (see
 * CURRENT_PROGRAM_LABELS in the booking backend's _shared/locale.ts). */
export const UNMAPPED_PROGRAM_TITLES = FEATURED_PROGRAMS.filter(
  (program) => !PROGRAM_KEYS.has(program.title),
).map((program) => program.title);

if (UNMAPPED_PROGRAM_TITLES.length)
  throw new Error(
    `Unmapped clinic programs: ${UNMAPPED_PROGRAM_TITLES.join(", ")}`,
  );

export const BOOKING_PROGRAMS = FEATURED_PROGRAMS.filter((program) =>
  PROGRAM_KEYS.has(program.title),
).map((program) => ({ ...program, value: PROGRAM_KEYS.get(program.title)! }));

export const GLOW_PROGRAM_VALUE = PROGRAM_KEYS.get("Tune Journey Glow")!;

export const BOOKING_TREATMENTS = BOOKING_TREATMENT_CATALOG;

export const GLOW_EXTRA = { ...GLOW_ADD_ON, value: GLOW_EXTRA_VALUE };
// A label a patient reads here is the label the clinic's confirmation email
// prints for the same key. Keep both sides in step when a name changes.
export const BOOKING_LABELS = new Map(
  [
    ...BOOKING_PROGRAMS,
    ...BOOKING_TREATMENTS,
    { value: CONSULTATION_VALUE, title: CONSULTATION_LABEL },
    { value: GLOW_EXTRA.value, title: GLOW_EXTRA_LABEL },
  ].map((item) => [item.value, item.title]),
);

/** Selections the current menu can still name, and those it cannot. A legacy
 * or retired key stays with the booking: it is never silently dropped by a
 * management change, because the change is refused instead. */
export const knownSelection = (values: readonly string[]) =>
  values.filter(
    (value) => value !== CONSULTATION_VALUE && BOOKING_LABELS.has(value),
  );
export const unknownSelection = (values: readonly string[]) =>
  values.filter(
    (value) => value !== CONSULTATION_VALUE && !BOOKING_LABELS.has(value),
  );

const validDate = (value: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
};

const validTime = (value: string | null) =>
  value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : null;

/** Query-string values are only a UI prefill. The calendar rechecks the slot
 * against live availability before submission, and the booking function is
 * still the write authority. Unknown treatments and malformed dates/times are
 * ignored rather than copied into form state. */
export function initialBookingPrefill(search: string) {
  const params = new URLSearchParams(search);
  const requested = params.get(TREATMENT_PARAM);
  const result = requested && BOOKING_LABELS.has(requested) ? [requested] : [];
  // A URL may choose a program wishlist, never add the paid laser option.
  const selected = result.filter(
    (value) => value !== GLOW_EXTRA.value && value !== CONSULTATION_VALUE,
  );
  const date = validDate(params.get(DATE_PARAM));
  const time = date ? validTime(params.get(TIME_PARAM)) : null;
  return { selected, date: date ?? "", time: time ?? "" };
}

export function initialBookingSelection(search: string) {
  return initialBookingPrefill(search).selected;
}
