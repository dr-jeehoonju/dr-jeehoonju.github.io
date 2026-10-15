# Dr. Jee Hoon Ju

Astro static personal website for https://jeehoonju.com. English-first clinical and founder pages with shared Tune Clinic availability and a separately gated intake integration.

## Develop and verify

Use Node 24, `npm ci`, then `npm run dev`. Run `npm run verify` before release. Build output is `dist/`; use `npm run preview` to inspect the production artifact. Avoid running a production build concurrently with the development server's dependency optimizer; restart the dev server after build verification if necessary.

## Publish

GitHub Pages uses `.github/workflows/pages.yml` on `main`, not the repository root HTML. Preserve `public/CNAME` and the separately hosted `/errata/` project. Roll back by reverting the release commit and rerunning the workflow.

Repository variables:
- `PUBLIC_GA4_ID`: dedicated personal-site measurement ID.
- `PUBLIC_INTAKE_ENABLED`: exact `true` only after the Seoul booking backend release and Turnstile domain configuration are complete.

The booking form is a general Tune Clinic request, not a Dr. Ju appointment guarantee. Backend authorization, availability and CAPTCHA validation remain authoritative. Business inquiries use a private separate table, with administrative review rather than automatic notification.

## Source and editorial maintenance

`docs/source-manifest.json` pins the Tune source commit. All 39 published treatment/concern records have original consultation-focused copy. Six program pages preserve published scope and defer current quotations to the clinic. Recheck clinical assertions and citations when the source changes. Independent agent review is not licensed clinical sign-off.

## Analytics

Dedicated GA4 property 559059037, stream 16136410750, measurement G-7FWZG8V26N. Enhanced measurement is off. Analytics requires affirmative consent, respects GPC, excludes all booking/business form pages, removes query and fragment, and groups treatment/concern/program visits under `/care/`. Event names: page_view, reading_depth, active_reading, booking_cta, video_play, video_original. Active reading means foreground, focused elapsed time, not proof of comprehension. No automatic attribution to revenue is claimed.
