import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "../lib/booking-contract";
type Provider = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
export default function Verification({
  onToken,
  attempt,
  action = "booking",
}: {
  onToken: (token: string) => void;
  attempt: number;
  action?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false,
      id: string | undefined;
    const provider = () =>
      (window as Window & { turnstile?: Provider }).turnstile;
    const render = () => {
      if (disposed || !ref.current || !provider()) return;
      id = provider()!.render(ref.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action,
        theme: "light",
        size: "compact",
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };
    onToken("");
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-verification]",
    );
    const script = existing ?? document.createElement("script");
    if (provider()) render();
    else {
      script.addEventListener("load", render);
      if (!existing) {
        script.dataset.verification = "true";
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        document.head.append(script);
      }
    }
    return () => {
      disposed = true;
      script.removeEventListener("load", render);
      if (id) provider()?.remove(id);
    };
  }, [onToken, attempt, action]);
  return (
    <div>
      <div ref={ref} />
      <p className="fineprint">Security verification provided by Cloudflare.</p>
    </div>
  );
}
