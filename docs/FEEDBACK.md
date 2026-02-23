# Feedback System (General Purpose for MVPs & Future Apps)

The profile feedback form and `feedbacks` table are designed to work for **any** app or MVP: generic questions, standard metrics, and room to extend without schema changes.

---

## What’s included (out of the box)

| Signal | Column | Range | Purpose |
|--------|--------|--------|---------|
| First impression | `rating` | 1–5 | “How did the app feel when you first used it?” |
| Ease of use | `friendly_score` | 1–5 | “How easy was it to do what you needed?” |
| Retention intent | `retention_intent` | 1–5 | “How likely are you to keep using this app?” |
| NPS | `nps_score` | 0–10 | “How likely are you to recommend this app?” |
| Pricing | `pricing_score` | 0–4 | “How do you feel about the pricing?” (optional) |
| Category | `category` | enum | bug, uiux, feature_request, performance, pricing, general |
| Free text | `message` | text | Optional short comment |

Context is stored automatically: `page`, `event`, `app_version`, `platform` (e.g. `web`).

---

## Extending without schema changes

- **`meta` (jsonb)** — Use for app-specific or A/B questions. Examples:
  - `{ "primary_use_case": "work", "feature_used_most": "habits" }`
  - Store extra scales or multiple-choice answers here; query and aggregate in SQL or your analytics stack.
- **`category`** — Add new values via a migration if you need e.g. `support` or `onboarding`; the form and validation live in `lib/validations.ts` and `components/feedback/FeedbackForm.tsx`.
- **`image_urls`** — Populated when users attach screenshots in the feedback form. Images are uploaded to the `feedback-images` Storage bucket (see migration `20250221150000_storage_feedback_images.sql`). Max 3 images, 5MB each, JPEG/PNG/GIF/WebP.

---

## Customizing the form per app

- **Labels** — Edit copy in `components/feedback/FeedbackForm.tsx` (e.g. “first used” → “first opened the habit tracker”).
- **Questions on/off** — Omit optional scales (e.g. hide `pricing_score` for free-only MVPs) by not rendering that `ScaleRow` and not sending the field; validation already treats `pricing_score` and `nps_score` as optional.
- **Extra questions** — Add more scales or radios and persist results in `meta` in `app/actions/feedback.ts` (e.g. `meta: { my_question: formData.get('my_question') }`).

---

## Migrations

- `20250221120000_add_feedbacks.sql` — Creates `feedbacks` and RLS.
- `20250221140000_add_feedbacks_nps.sql` — Adds `nps_score` (0–10).

Run with `npx supabase db push` or apply in the Supabase SQL Editor.
