import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  loadAvailability,
  availableTimes,
  seoulDate,
  submitBooking,
  bookingWriteAllowed,
  BookingSubmitError,
  type Availability,
} from "../lib/booking-contract";
import { BOOKING_LABELS, CONSULTATION_VALUE } from "../lib/booking-catalog";
import Verification from "./Verification";
export default function BookingForm() {
  const [enabled, setEnabled] = useState(false),
    [date, setDate] = useState(""),
    [time, setTime] = useState(""),
    [availability, setAvailability] = useState<Availability | null>(null),
    [loading, setLoading] = useState(false),
    [availabilityError, setAvailabilityError] = useState(false),
    [token, setToken] = useState(""),
    [attempt, setAttempt] = useState(0),
    [busy, setBusy] = useState(false),
    [unresolved, setUnresolved] = useState(false),
    [message, setMessage] = useState(""),
    [done, setDone] = useState(false);
  const lock = useRef(false);
  const month = date.slice(0, 7);
  useEffect(() => {
    setEnabled(bookingWriteAllowed(location));
    setDate(seoulDate());
  }, []);
  useEffect(() => {
    if (!month) return;
    const controller = new AbortController();
    setAvailability(null);
    setLoading(true);
    setAvailabilityError(false);
    setTime("");
    loadAvailability(month, controller.signal)
      .then(setAvailability)
      .catch(() => {
        if (!controller.signal.aborted) setAvailabilityError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [month]);
  const times = availability ? availableTimes(date, availability) : [];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || unresolved || !enabled) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!time || !times.includes(time)) {
      setMessage("Choose an available time.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const text = (name: string) => String(data.get(name) || "").trim();
      await submitBooking(
        {
          booking_type: "slot_pick",
          patient_name: text("name"),
          patient_email: text("email"),
          patient_phone: text("phone") || null,
          appointment_date: date,
          appointment_time: time,
          preferred_out_time: null,
          treatment_interest: [text("treatment") || CONSULTATION_VALUE],
          message: text("message") || null,
          locale: "en",
          patient_timezone:
            Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          preferred_contact_channel: "email",
          contact_channel_id: null,
          iv_sedation_requested: false,
          consent_personal: data.has("personal") as true,
          consent_health: data.has("health") as true,
          consent_overseas: false,
          consent_version: "2026-09-27-en-v4",
          event_id: crypto.randomUUID(),
          event_time: Math.floor(Date.now() / 1000),
        },
        token,
        location,
        text("website"),
      );
      setDone(true);
      try {
        sessionStorage.setItem(
          "drju-receipt",
          JSON.stringify({ received: true, at: Date.now() }),
        );
        location.assign("/book/received/");
      } catch {
        /* Receipt stays visible if storage is unavailable. */
      }
    } catch (error) {
      const unknown =
        !(error instanceof BookingSubmitError) || error.unresolved;
      setUnresolved(unknown);
      setMessage(
        error instanceof BookingSubmitError
          ? error.message
          : "We could not confirm receipt. Please do not submit again; contact Tune Clinic to check.",
      );
      if (!unknown) {
        setAttempt((n) => n + 1);
        setToken("");
        try {
          setAvailability(await loadAvailability(month));
          setTime("");
        } catch {
          setAvailabilityError(true);
        }
      }
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  if (done)
    return (
      <div className="notice" role="status">
        <h2>Request received.</h2>
        <p>
          Tune Clinic will review your request and contact you. This is not yet
          a confirmed appointment or a Dr. Ju appointment guarantee.
        </p>
        <a href="https://wa.me/821098748575">Contact Tune Clinic</a>
      </div>
    );
  return (
    <div>
      {!enabled && (
        <div className="notice">
          <strong>Book directly with Tune Clinic</strong>
          <p>
            Online requests on this website are not open yet. You can explore
            the form and availability below, or complete your booking on the
            clinic’s website.
          </p>
          <a className="button" href="https://tuneclinic-global.com/booking">
            Open Tune Clinic booking ↗
          </a>
        </div>
      )}
      <form onSubmit={submit}>
        <fieldset
          disabled={busy || unresolved}
          style={{ border: 0, padding: 0, margin: 0 }}
        >
          <div className="form-grid">
            <label className="field">
              Your preferred date
              <input
                type="date"
                value={date}
                min={seoulDate()}
                max={seoulDate(new Date(Date.now() + 180 * 86400000))}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTime("");
                }}
                required
              />
            </label>
            <label className="field">
              Time in Seoul (KST, UTC+9)
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={loading || !times.length}
              >
                <option value="">
                  {loading
                    ? "Checking availability…"
                    : availabilityError
                      ? "Availability unavailable"
                      : times.length
                        ? "Choose a time"
                        : "No available times"}
                </option>
                {times.map((t) => (
                  <option key={t} value={t}>
                    {t} KST
                  </option>
                ))}
              </select>
            </label>
            <div className="full fineprint" role="status">
              {availabilityError
                ? "We could not load availability. Please use the clinic booking page or contact the clinic."
                : "Availability is shared with Tune Clinic and checked again when you submit. All appointment times are in Seoul time."}
            </div>
            <label className="field">
              Full name
              <input name="name" autoComplete="name" required maxLength={200} />
            </label>
            <label className="field">
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={320}
              />
            </label>
            <label className="field">
              Phone with country code (optional)
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={50}
              />
            </label>
            <label className="field">
              What would you like to discuss?
              <select name="treatment" defaultValue={CONSULTATION_VALUE}>
                {[...BOOKING_LABELS].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field full">
              Anything to help us plan? (optional)
              <textarea
                name="message"
                rows={4}
                maxLength={2000}
                placeholder="Your travel timing or questions for the consultation."
              />
            </label>
            <label className="trap" aria-hidden="true">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <p className="fineprint" style={{ marginTop: 24 }}>
            Requests are managed by Tune Clinic. The clinic confirms your
            treating physician and appointment. Selecting a treatment is an
            expression of interest, not a purchase or a treatment
            recommendation.
          </p>
          <label className="check">
            <input type="checkbox" name="personal" required />
            <span>
              <strong>Required: personal information.</strong> Use my name,
              email, optional phone and contact handle, preferred date and time,
              and booking notes to arrange this visit. If I do not attend, keep
              this request for up to 12 months.
            </span>
          </label>
          <label className="check">
            <input type="checkbox" name="health" required />
            <span>
              <strong>Required: health information.</strong> Use my treatment
              interests, symptoms, sedation request and any other health details
              I choose to share for physician consultation and safety review. If
              I do not attend, keep these details for up to 12 months.
            </span>
          </label>
          <p className="fineprint">
            You can decline and contact us on WhatsApp instead; declining does
            not change your care or price. These are care consents, not
            marketing consent.{" "}
            <a
              href="https://tuneclinic-global.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the clinic privacy policy (new tab).
            </a>
          </p>
          {enabled && <Verification onToken={setToken} attempt={attempt} />}
          <button
            className="button"
            type="submit"
            disabled={!enabled || !token || busy || unresolved || !time}
          >
            {busy ? "Sending request…" : "Request a clinic appointment ↗"}
          </button>
          <div className="status" role="status" aria-live="polite">
            {message}
          </div>
          {unresolved && (
            <a className="text-link" href="https://wa.me/821098748575">
              Ask the clinic to check your request ↗
            </a>
          )}
        </fieldset>
      </form>
    </div>
  );
}
