# Care content review notes

Draft patient-education content in `src/lib/care-content.json`, written on 2026-10-16 from the public clinic source export `/tmp/drju-clinical-source.json`.

## Status

This is an unreviewed draft. It needs independent clinical and editorial review before publication.

- Drafted by an AI content assistant (Claude Opus 5.5). The author is not a licensed clinician and no medical sign-off has been given.
- An independent physician reviewer and the clinic should check every record against the source and current practice.
- Check whether Korean medical advertising pre-review applies to these pages before they go live.
- The site's booking route should state that bookings are made through the clinic and that a specific physician is not guaranteed. No record names Dr. Ju or promises who will treat the patient; every record says "the physician".

## Source inventory

The export has 114 records, and 39 of them fall in scope (`kind` treatment or concern, `contentReady` true).

- In scope: 34 treatments and 5 concerns. All 39 have one entry in the JSON, with `sourcePath` matching the source path exactly.
- Out of scope because `contentReady` is false: `/treatments/the-tuning`, `/treatments/the-composition`, `/treatments/the-foundation`.
- Out of scope by kind: home, doctors, visit, segment (8) and guide-index (61) records.
- Source fields used: summary, facts, faqs, included, whyItWorks, description, evidenceNote, relatedTreatments, relatedConcerns.
- Source fields left out on purpose: prices, pricingNote, pricingTerms and journeys. The site root renders prices separately.

## Validation results

A script checked the JSON against the source and the writing rules.

- Coverage: 39 of 39 in-scope records, with no duplicates and no extra records.
- Shape: each record has slug, kind, title, intro, 3 questions, 4 sections, sourcePath and related. Each slug is the last segment of its source path.
- Length: intro plus sections runs 190 to 229 words. With the questions added, it is 232 to 288.
- Characters: no em or en dashes, no section sign, no markdown symbols and no curly quotes.
- Content checks: no KRW amounts, no cc volumes and no physician names.
- Repetition: no sentence over 30 characters appears in two records.
- Links: every `related` path points to another in-scope record.

## Titles

Titles drop the clinic prefix unless it is part of a branded program or product name.

- Prefix removed: Acne Care Package, Shurink Lifting, Botox, Lip Filler, InMode, Ear Filler, Chin Filler, Alltite, CoolSoniq, Enlighten.
- Kept as branded names: The First Pigment laser Omakase, The Body Filler Omakase, Tune Eye Cell, Tune Re2O, Tuneliner Face.
- Review: "Botox" is a trademark for one specific product, but the source says the product is chosen at consultation. Consider "Botulinum Toxin" as the title.
- Review: Tune Eye Cell and Tune Re2O are kept because they read as clinic menu names. Confirm they are branded programs and not just the prefix.
- Review: the slugs `the-first-reading` and `body-composition` do not match their titles. They follow the source paths as instructed.

## Related links

Related lists start from the source and drop targets that are not content-ready. Some links were added in the reverse direction, and those need confirming.

- Dropped from source lists because the targets are not ready: the-foundation, the-composition, the-tuning.
- Reverse links already in the source: the-first-reading to enlighten, body-composition to fat-dissolving-injection, thread-lifting to cheek-hollow-lifting, acne-care to acne-scar, volume-loss to cheek-hollow-lifting.
- Added from concern pages: acne-care to concerns/enlarged-pores; ultherapy, thermage and oligio to concerns/sagging-and-laxity; thread-lifting to concerns/sagging-and-laxity and concerns/volume-loss; potenza and acne-scar to concerns/acne-scarring.
- Added by editorial judgment with no source link in either direction: concerns/pigmentation to enlighten, concerns/acne-scarring to acne-scar, concerns/enlarged-pores to potenza, cheek-hollow-lifting to both concerns. Each is supported by the target's consultation focus, but a reviewer should confirm them.

## Risk flags needing clinical review

These are claims that need a clinician's check, in particular where the draft combines facts from different records or keeps a specific figure from the source.

- Specific figures kept from the source: the Enlighten wavelengths (532nm and 1,064nm), Botox injection time within ten minutes, IV drips running under an hour (source says 30 to 60 minutes), and acne scar revision redness lasting from a few days to about a week.
- Figures left out on purpose: chin filler "commonly visible for 12 to 18 months" and "final shape settles over about two weeks", the body filler training pause of 7 to 10 days, and its follow-up at about 4 weeks. The chin duration figure stands out from the rest of the source, which avoids durations everywhere else. The clinic should check it before using it anywhere.
- Facts combined across records:
  - neck-wrinkle-filler suggests hyperdilute Radiesse as an alternative (from the Radiesse source).
  - inmode suggests botulinum toxin for a masseter-driven square jaw (from the Botox source).
  - chin-filler points to InMode, fat-dissolving injection or lifting for jaw fat or laxity.
  - lapothera-tune-eyecell lists polynucleotide, PDRN and Juvelook as alternatives.
  - lip-filler routes muscle-related concerns to botulinum toxin.
- Concern pages that extend thin source text:
  - volume-loss has a one-sentence source description. The draft expands it using the thread-lifting and cheek-hollow-lifting records.
  - The sagging-and-laxity statement that "non-surgical treatments are aimed at early to moderate change" is a summary drawn from several device records, not text from the concern source.
- Evidence wording: ultherapy, thermage, tenthermalifting, oligio, botox and neck-wrinkle-filler say the published evidence is small or limited. This paraphrases the source evidence notes. No PMIDs are included, so the site could render them from the source if wanted.
- Product naming:
  - Onda's microwave brand is written "Coolwaves". The source uses "COOLWAVES".
  - Tune Re2O names Elravie Re2O and Lateigen. The source says the family has three products but names only these two.
  - Neck filler names The Chaeum.
  - Tune Eye Cell names Lafullen (polycaprolactone).
- Safety screening lists (pacemaker, metal implants, pregnancy, fish allergy, isotretinoin, cold sores, keloids) come from the source. A clinician should confirm they are complete enough for patient-facing use.
- Travel guidance: no record says flying is safe. Records repeat the source position that flight timing is decided after treatment and an itinerary is not medical clearance.

## Not done

These items are out of scope for this pass.

- No content for records whose `contentReady` is false, or for guide-index and segment records.
- No independent review of this draft. That review must be done separately, by someone other than the author.
- No changes to any other repo file, no git operations and no network access.
