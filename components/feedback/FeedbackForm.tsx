'use client';

import { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { submitFeedback, type SubmitFeedbackResult } from '@/app/actions/feedback';
import { FEEDBACK_CATEGORIES } from '@/lib/validations';
import { trackEvent, flushAnalytics } from '@/lib/analytics/track';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

type FeedbackFormProps = {
  /** Called when feedback is successfully submitted (e.g. to close drawer) */
  onSubmitted?: () => void;
};

const SCALE_LABELS_5: Record<number, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
};

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  uiux: 'UI / UX',
  bug: 'Bug',
  feature_request: 'Feature request',
  performance: 'Performance',
  pricing: 'Pricing',
};

function ScaleRow({
  name,
  label,
  value,
  min = 1,
  max = 5,
  leftLabel,
  rightLabel,
}: {
  name: string;
  label: string;
  value: number | null;
  min?: number;
  max?: number;
  leftLabel?: string;
  rightLabel?: string;
}) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="mb-5">
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      {leftLabel != null && rightLabel != null && (
        <p className="mb-2 flex justify-between text-xs text-gray-500">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </p>
      )}
      <div className="flex gap-1">
        {options.map((n) => (
          <label
            key={n}
            className="flex flex-1 cursor-pointer select-none flex-col items-center rounded-md border py-2 transition-colors has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700 hover:border-gray-400"
          >
            <input
              type="radio"
              name={name}
              value={n}
              defaultChecked={value === n}
              className="sr-only"
            />
            <span className="text-sm font-medium">{SCALE_LABELS_5[n] ?? n}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CategoryRow({ value }: { value: string | null }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-sm font-medium text-gray-700">What best describes this feedback?</p>
      <div className="grid grid-cols-2 gap-2">
        {FEEDBACK_CATEGORIES.map((cat) => (
          <label
            key={cat}
            className="cursor-pointer select-none rounded-md border py-2 text-center text-sm transition-colors has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700 hover:border-gray-400"
          >
            <input
              type="radio"
              name="category"
              value={cat}
              defaultChecked={value === cat}
              className="sr-only"
            />
            {CATEGORY_LABELS[cat] ?? cat}
          </label>
        ))}
      </div>
    </div>
  );
}

export function FeedbackForm({ onSubmitted }: FeedbackFormProps) {
  const [state, formAction, isPending] = useActionState(submitFeedback, {} as SubmitFeedbackResult);
  const trackedSubmitRef = useRef(false);

  useEffect(() => {
    if (state?.submitted && !trackedSubmitRef.current) {
      trackedSubmitRef.current = true;
      trackEvent({ name: ANALYTICS_EVENTS.FEEDBACK_SUBMITTED });
      flushAnalytics(); // send immediately so event is not lost if drawer closes
    }
    if (state?.submitted && onSubmitted) {
      onSubmitted();
    }
  }, [state?.submitted, onSubmitted]);

  if (state?.submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800">
        Thanks for your feedback. It helps us improve the app.
      </div>
    );
  }

  return (
    <form action={formAction} className="text-left">
      <ScaleRow
        name="rating"
        label="First impression: How did the app feel when you first used it?"
        value={null}
        leftLabel="Poor"
        rightLabel="Great"
      />
      <ScaleRow
        name="friendly_score"
        label="Ease of use: How easy was it to do what you needed?"
        value={null}
        leftLabel="Difficult"
        rightLabel="Very easy"
      />
      <ScaleRow
        name="retention_intent"
        label="How likely are you to keep using this app?"
        value={null}
        leftLabel="Not likely"
        rightLabel="Very likely"
      />
      <ScaleRow
        name="nps_score"
        label="How likely are you to recommend this app to a friend? (NPS)"
        value={null}
        min={0}
        max={10}
        leftLabel="Not at all"
        rightLabel="Extremely"
      />
      <ScaleRow
        name="pricing_score"
        label="How do you feel about the pricing?"
        value={null}
        min={0}
        max={4}
        leftLabel="Poor value"
        rightLabel="Great value"
      />
      <p className="-mt-3 mb-4 text-xs text-gray-500">Optional — skip if not applicable.</p>
      <CategoryRow value={null} />

      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-gray-700">
          Anything else? <span className="font-normal text-gray-500">(optional)</span>
        </p>
        <textarea
          name="message"
          rows={3}
          maxLength={2000}
          placeholder="Short comment..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-gray-700">
          Attach screenshots <span className="font-normal text-gray-500">(optional)</span>
        </p>
        <p className="mb-2 text-xs text-gray-500">
          Each image must be JPEG, PNG, GIF or WebP and under 5MB. Max 3 images.
        </p>
        <input
          type="file"
          name="images"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {state?.error && (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? 'Sending…' : 'Submit feedback'}
      </button>
    </form>
  );
}
