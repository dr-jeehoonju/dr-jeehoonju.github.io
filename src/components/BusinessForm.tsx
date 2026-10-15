import { useState, useEffect, useRef, type FormEvent } from "react";
import Verification from "./Verification";
import {
  BOOKING_ORIGIN,
  BOOKING_EDGE_REGION,
  bookingWriteAllowed,
} from "../lib/booking-contract";
export default function BusinessForm() {
  const [enabled, setEnabled] = useState(false),
    [token, setToken] = useState(""),
    [attempt, setAttempt] = useState(0),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [uncertain, setUncertain] = useState(false),
    [message, setMessage] = useState("");
  const lock = useRef(false);
  useEffect(() => setEnabled(bookingWriteAllowed(location)), []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!enabled || lock.current || uncertain) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    const data = new FormData(e.currentTarget);
    const field = (name: string) => String(data.get(name) || "").trim();
    try {
      const response = await fetch(
        `${BOOKING_ORIGIN}/functions/v1/submit-business-inquiry?forceFunctionRegion=${BOOKING_EDGE_REGION}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "omit",
          referrerPolicy: "no-referrer",
          signal: AbortSignal.timeout(20000),
          body: JSON.stringify({
            name: field("name"),
            email: field("email"),
            organization: field("organization"),
            message: field("message"),
            consent_personal: data.has("consent"),
            consent_version: "2026-10-16-business-v1",
            turnstile_token: token,
            honeypot: field("website"),
          }),
        },
      );
      if (response.status >= 400 && response.status < 500) {
        setMessage(
          response.status === 429
            ? "Too many requests. Please contact us by email."
            : "Your inquiry was not accepted. Check the fields and verification.",
        );
        setToken("");
        setAttempt((n) => n + 1);
        return;
      }
      const result = await response.json();
      if (!response.ok || result.ok !== true || typeof result.id !== "string")
        throw Error();
      setDone(true);
    } catch {
      setUncertain(true);
      setMessage(
        "We could not confirm receipt. Please do not send again; email drjeeju@aetherheal.com to check.",
      );
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  if (done)
    return (
      <p className="notice" role="status">
        Your business inquiry has been received. Thank you for getting in touch.
      </p>
    );
  if (!enabled)
    return (
      <p>
        For partnerships, speaking and business inquiries:{" "}
        <a className="text-link" href="mailto:drjeeju@aetherheal.com">
          drjeeju@aetherheal.com ↗
        </a>
      </p>
    );
  return (
    <form onSubmit={submit}>
      <fieldset disabled={busy || uncertain} style={{ border: 0, padding: 0 }}>
        <div className="form-grid">
          <label className="field">
            Name
            <input name="name" required maxLength={200} autoComplete="name" />
          </label>
          <label className="field">
            Email
            <input
              name="email"
              required
              type="email"
              maxLength={320}
              autoComplete="email"
            />
          </label>
          <label className="field full">
            Organization (optional)
            <input name="organization" maxLength={200} />
          </label>
          <label className="field full">
            Business inquiry
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={4000}
              rows={5}
            />
          </label>
          <label className="trap" aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <p className="fineprint">
          For business correspondence only. Please use clinic booking for care
          and do not include health information here.
        </p>
        <label className="check">
          <input type="checkbox" name="consent" required />
          <span>
            I agree to use of my name, email, organization and message to
            respond to this business inquiry. See{" "}
            <a href="/privacy/">privacy details</a>.
          </span>
        </label>
        <Verification
          onToken={setToken}
          attempt={attempt}
          action="business_inquiry"
        />
        <button className="button" disabled={!token || busy || uncertain}>
          {busy ? "Sending…" : "Send business inquiry ↗"}
        </button>
        <p role="status" className="status">
          {message}
        </p>
      </fieldset>
    </form>
  );
}
